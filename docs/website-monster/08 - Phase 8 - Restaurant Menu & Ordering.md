# 🍽 Phase 8 — תפריט + הזמנות למסעדה

> **מתאים ל:** מסעדות, קפה, מאפיות, קייטרינג, food trucks
> **bookingType:** `"restaurant"`
> **מזוהה אוטומטית** ב-SiteArchaeology — כשיש מנות + תפריט ואין הזמנות online
> **תלויות:** [[07 - Phase 7]], [[services/restaurant]], [[services/tranzila]]

---

## המטרה

מודול גנרי — כל מסעדה שנבנה מקבלת:

1. **קטלוג מנות** — gallery cards ↔ table toggle
2. **DishVariantDrawer** — התאמת מנה כמו וולט (גדלים, תוספות, הסרות)
3. **Cart Drawer** — עגלת קניות מרובת פריטים
4. **Checkout** — שלח לבית / איסוף / ישיבה + QR שולחן
5. **תשלום טרנזילה** (זהה ל-Phase 07) או WhatsApp fallback
6. **QR Code per table** → `/menu?table=5`

---

## ארכיטקטורה

```
Customer-facing (Next.js בכל אתר):
  /menu?table=X               ← קטלוג מנות
  /menu/[slug]                ← דף מנה (optional)
  /order/checkout             ← Checkout form
  /order/success
  /order/error
  /api/orders/route.ts        ← proxy → FastAPI
  /api/payments/tranzila/     ← 100% copy מ-Phase 07

Backend (FastAPI ב-maori_stock_bot):
  app/models/dish.py
  app/models/dish_variant_group.py
  app/models/order.py
  app/models/order_item.py
  app/api/v1/endpoints/dishes.py
  app/api/v1/endpoints/orders.py

Component Library (@tottemai/ui/restaurant):
  MenuCatalog          ← gallery/table toggle (כמו ServiceCatalog)
  DishCard             ← כרטיס מנה (כמו ServiceCard)
  DishVariantDrawer    ← modal בחירת variants (חדש)
  CartProvider         ← React Context + localStorage
  CartDrawer           ← slide-in עגלה
  OrderWidget          ← 4-step checkout
  ViewToggle           ← 100% reuse מ-Phase 07
```

---

## Data Models

### Dish

```python
class Dish(SQLModel, table=True):
    id, place_id, slug, name, description, price
    category          # "ראשונות" | "עיקריות" | "קינוחים" | "שתייה"
    image_urls_json   # ["url1", "url2"]
    allergens_json    # ["gluten", "dairy", "nuts", "sesame", "egg"]
    spicy_level       # 0=לא, 1=קלות, 2=חריף, 3=🌶🌶🌶
    is_vegetarian, is_vegan
    prep_time_minutes, is_active, sort_order, created_at
```

### DishVariantGroup + DishVariantOption

```python
class DishVariantGroup(SQLModel, table=True):
    id, dish_id, name, selection_type, is_required, sort_order

    # selection_type:
    # "single_required"  ← RadioGroup (גודל, רמת בישול)
    # "multi_optional"   ← CheckboxGroup (תוספות)
    # "remove"           ← CheckboxGroup (ללא בצל, ללא גבינה)

class DishVariantOption(SQLModel, table=True):
    id, group_id, label, price_delta, is_default, sort_order
    # price_delta: +10 לתוספת, 0 לגודל בסיסי, 0 להסרה
```

### Order + OrderItem

```python
class Order(SQLModel, table=True):
    __tablename__ = "restaurant_order"   # "order" reserved ב-SQL
    id, place_id
    customer_name, customer_phone, customer_address
    order_type       # "delivery" | "pickup" | "dine_in"
    table_number     # dine_in בלבד
    estimated_time   # "30" דקות
    subtotal, delivery_fee, total
    status           # pending → confirmed → preparing → ready → completed/cancelled
    payment_id, payment_mode, notes, created_at

class OrderItem(SQLModel, table=True):
    id, order_id (FK), dish_id (FK)
    dish_name, dish_price   # snapshot — לא משתנה
    quantity
    variants_json           # [{"group": "גודל", "option": "גדול", "delta": 10}]
    special_request         # "ללא בצל"
    item_total              # (dish_price + sum(deltas)) × quantity
```

---

## FastAPI Endpoints

```python
# dishes.py
GET  /api/v1/dishes/                   ← list by place_id, קבוץ לפי קטגוריה
GET  /api/v1/dishes/{slug}             ← dish + variant_groups + options
POST /api/v1/dishes/                   ← create (admin)
POST /api/v1/dishes/{id}/variants      ← add variant group + options
PUT  /api/v1/dishes/{id}              ← update (admin)
DELETE /api/v1/dishes/{id}            ← soft delete

# orders.py
POST /api/v1/orders/                   ← create order from cart → Telegram
GET  /api/v1/orders/{id}
POST /api/v1/orders/{id}/confirm       ← payment confirmed (TranzilaTK)
PUT  /api/v1/orders/{id}/status        ← admin: preparing / ready / completed
POST /api/v1/orders/{id}/cancel
GET  /api/v1/orders/admin/{place_id}   ← filter: date, status, order_type
POST /api/v1/orders/estimate           ← חישוב delivery_fee + estimated_time

# qr.py
GET  /api/v1/qr/{place_id}/{table}     ← PNG QR Code
```

---

## MenuCatalog Component

```tsx
// src/restaurant/MenuCatalog.tsx
"use client"
import { useState } from "react"
import { ViewToggle } from "@tottemai/ui/primitives"
import { DataTable } from "@tottemai/ui/data-display"
import { DishCard } from "./DishCard"

interface MenuCategory { name: string; dishes: Dish[] }

interface MenuCatalogProps {
  categories:  MenuCategory[]
  tableNumber?: string
}

export function MenuCatalog({ categories, tableNumber }: MenuCatalogProps) {
  const [view, setView] = useState<"gallery" | "table">("gallery")
  const allDishes = categories.flatMap(c => c.dishes)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">התפריט שלנו</h2>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === "gallery" ? (
        /* Gallery — קטגוריות עם scroll anchor */
        <div className="space-y-10">
          {categories.map(cat => (
            <section key={cat.name} id={cat.name}>
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-muted)]">
                {cat.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.dishes.map(dish => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Table */
        <DataTable
          columns={[
            { key: "name",     label: "שם"        },
            { key: "category", label: "קטגוריה"   },
            { key: "price",    label: "מחיר",
              render: (v: number) => `₪${v}` },
            { key: "id", label: "",
              render: (_: string, row: Dish) => (
                <AddToCartButton dish={row} />
              )
            },
          ]}
          rows={allDishes}
        />
      )}

      {/* Category sticky sidebar (desktop) */}
      {view === "gallery" && (
        <nav className="hidden xl:flex fixed right-4 top-1/3 flex-col gap-2">
          {categories.map(cat => (
            <a key={cat.name} href={`#${cat.name}`}
               className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
              {cat.name}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
```

---

## DishCard Component

```tsx
// src/restaurant/DishCard.tsx
"use client"
import { useState } from "react"
import { MagneticButton } from "@tottemai/ui/motion"
import { DishVariantDrawer } from "./DishVariantDrawer"
import { useCart } from "./CartProvider"

const ALLERGEN_ICONS: Record<string, string> = {
  gluten: "🌾", dairy: "🥛", nuts: "🥜", sesame: "🌿", egg: "🥚",
}

const SPICY_ICONS = ["", "🌶", "🌶🌶", "🌶🌶🌶"]

export function DishCard({ dish }: { dish: Dish }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { add } = useCart()
  const hasVariants = dish.variant_groups && dish.variant_groups.length > 0

  const handleAdd = () => {
    if (hasVariants) {
      setDrawerOpen(true)
    } else {
      add(dish, [], "")
    }
  }

  return (
    <>
      <div
        className="rounded-2xl border border-[var(--color-border)] overflow-hidden
                   hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={handleAdd}
      >
        {/* תמונה */}
        <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
          <img
            src={dish.image_urls[0] ?? "/placeholder-dish.jpg"}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div dir="rtl" className="p-4 space-y-2">
          {/* שם + קטגוריה */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg leading-tight">{dish.name}</h3>
            <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-[var(--color-surface)]
                             text-[var(--color-text-muted)]">
              {dish.category}
            </span>
          </div>

          {/* תיאור */}
          {dish.description && (
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
              {dish.description}
            </p>
          )}

          {/* אלרגנים + חריפות + veg */}
          <div className="flex flex-wrap gap-1 items-center">
            {dish.allergens.map(a => (
              <span key={a} title={a} className="text-sm">{ALLERGEN_ICONS[a] ?? a}</span>
            ))}
            {dish.spicy_level > 0 && (
              <span title="חריפות">{SPICY_ICONS[dish.spicy_level]}</span>
            )}
            {dish.is_vegan     && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">טבעוני</span>}
            {dish.is_vegetarian && !dish.is_vegan && (
              <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded">צמחוני</span>
            )}
          </div>

          {/* מחיר + כפתור */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-xl text-[var(--color-primary)]">₪{dish.price}</span>
            <MagneticButton
              onClick={e => { e.stopPropagation(); handleAdd() }}
              className="text-sm px-4 py-1.5 rounded-full bg-[var(--color-primary)]
                         text-white hover:brightness-110 transition-all"
            >
              + הוסף
            </MagneticButton>
          </div>
        </div>
      </div>

      <DishVariantDrawer
        dish={dish}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
```

---

## DishVariantDrawer — לב ה-Feature (כמו וולט)

```tsx
// src/restaurant/DishVariantDrawer.tsx
"use client"
import { useState, useMemo } from "react"
import { Sheet } from "@tottemai/ui/surfaces"
import { useCart } from "./CartProvider"

export function DishVariantDrawer({ dish, open, onClose }: {
  dish: Dish
  open: boolean
  onClose: () => void
}) {
  const { add } = useCart()
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [special, setSpecial]       = useState("")

  // חישוב מחיר realtime
  const totalPrice = useMemo(() => {
    let extra = 0
    for (const [groupId, optionLabels] of Object.entries(selections)) {
      const group = dish.variant_groups.find(g => g.id === groupId)
      if (!group) continue
      for (const label of optionLabels) {
        const opt = group.options.find(o => o.label === label)
        if (opt) extra += opt.price_delta
      }
    }
    return dish.price + extra
  }, [selections, dish])

  const allRequiredFilled = dish.variant_groups
    .filter(g => g.is_required)
    .every(g => (selections[g.id] ?? []).length > 0)

  const toggle = (groupId: string, label: string, type: string) => {
    setSelections(prev => {
      const current = prev[groupId] ?? []
      if (type === "single_required") {
        return { ...prev, [groupId]: [label] }
      }
      return {
        ...prev,
        [groupId]: current.includes(label)
          ? current.filter(l => l !== label)
          : [...current, label],
      }
    })
  }

  const handleAdd = () => {
    const variantsList = Object.entries(selections).flatMap(([groupId, labels]) => {
      const group = dish.variant_groups.find(g => g.id === groupId)!
      return labels.map(label => {
        const opt = group.options.find(o => o.label === label)!
        return { group: group.name, option: label, delta: opt.price_delta }
      })
    })
    add(dish, variantsList, special)
    onClose()
    setSelections({})
    setSpecial("")
  }

  return (
    <Sheet open={open} onClose={onClose} side="bottom" className="max-h-[90vh] overflow-y-auto">
      <div dir="rtl" className="p-6 space-y-6 pb-safe">
        {/* תמונה + שם */}
        <div className="flex gap-4 items-start">
          <img src={dish.image_urls[0] ?? "/placeholder-dish.jpg"} alt={dish.name}
               className="w-24 h-24 rounded-xl object-cover shrink-0" />
          <div>
            <h2 className="text-xl font-bold">{dish.name}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{dish.description}</p>
          </div>
        </div>

        {/* Variant Groups */}
        {dish.variant_groups?.map(group => (
          <div key={group.id} className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{group.name}</h3>
              {group.is_required && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">חובה</span>
              )}
            </div>

            {group.selection_type === "single_required" ? (
              /* Radio Group */
              <div className="space-y-2">
                {group.options.map(opt => (
                  <label key={opt.id}
                    className="flex justify-between items-center p-3 rounded-xl border cursor-pointer
                               transition-colors"
                    style={{
                      borderColor: (selections[group.id] ?? [])[0] === opt.label
                        ? "var(--color-primary)" : "var(--color-border)",
                      background: (selections[group.id] ?? [])[0] === opt.label
                        ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={group.id}
                        value={opt.label}
                        checked={(selections[group.id] ?? [])[0] === opt.label}
                        onChange={() => toggle(group.id, opt.label, group.selection_type)}
                        className="accent-[var(--color-primary)]"
                      />
                      <span>{opt.label}</span>
                    </div>
                    {opt.price_delta !== 0 && (
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {opt.price_delta > 0 ? `+₪${opt.price_delta}` : `-₪${Math.abs(opt.price_delta)}`}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              /* Checkbox Group — תוספות או הסרות */
              <div className="space-y-2">
                {group.options.map(opt => {
                  const checked = (selections[group.id] ?? []).includes(opt.label)
                  return (
                    <label key={opt.id}
                      className="flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-colors"
                      style={{
                        borderColor: checked ? "var(--color-primary)" : "var(--color-border)",
                        background: checked
                          ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(group.id, opt.label, group.selection_type)}
                          className="accent-[var(--color-primary)]"
                        />
                        <span>{group.selection_type === "remove" ? `ללא ${opt.label}` : opt.label}</span>
                      </div>
                      {opt.price_delta > 0 && (
                        <span className="text-sm text-[var(--color-text-muted)]">+₪{opt.price_delta}</span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* הערה מיוחדת */}
        <div className="space-y-2">
          <label className="text-sm font-medium">הערה מיוחדת (אופציונלי)</label>
          <textarea
            value={special}
            onChange={e => setSpecial(e.target.value)}
            placeholder="ללא בצל, צד נפרד..."
            rows={2}
            className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        {/* כפתור הוסף */}
        <button
          onClick={handleAdd}
          disabled={!allRequiredFilled}
          className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl font-bold
                     text-lg disabled:opacity-40 transition-opacity"
        >
          הוסף לסל — ₪{totalPrice.toFixed(0)}
        </button>
      </div>
    </Sheet>
  )
}
```

---

## CartProvider — React Context

```tsx
// src/restaurant/CartProvider.tsx
"use client"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface CartItem {
  cartId:    string   // uuid לשורה בcart
  dishId:    string
  dishName:  string
  basePrice: number
  quantity:  number
  variants:  { group: string; option: string; delta: number }[]
  special:   string
  itemTotal: number
}

interface CartContextValue {
  items:    CartItem[]
  add:      (dish: Dish, variants: CartItem["variants"], special: string) => void
  remove:   (cartId: string) => void
  updateQty:(cartId: string, qty: number) => void
  clear:    () => void
  subtotal: number
  count:    number
}

const CartContext = createContext<CartContextValue | null>(null)
export const useCart = () => { const c = useContext(CartContext); if (!c) throw new Error("no CartProvider"); return c }

function calcTotal(item: Omit<CartItem, "itemTotal">) {
  const extra = item.variants.reduce((s, v) => s + v.delta, 0)
  return (item.basePrice + extra) * item.quantity
}

type Action =
  | { type: "ADD";    payload: Omit<CartItem, "cartId" | "itemTotal"> }
  | { type: "REMOVE"; cartId: string }
  | { type: "QTY";    cartId: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "ADD":
      const newItem: CartItem = {
        ...action.payload,
        cartId: crypto.randomUUID(),
        itemTotal: calcTotal(action.payload),
      }
      return [...state, newItem]
    case "REMOVE":
      return state.filter(i => i.cartId !== action.cartId)
    case "QTY":
      return state.map(i =>
        i.cartId === action.cartId
          ? { ...i, quantity: action.qty, itemTotal: calcTotal({ ...i, quantity: action.qty }) }
          : i
      )
    case "CLEAR":   return []
    case "HYDRATE": return action.items
    default:        return state
  }
}

const STORAGE_KEY = "maori_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])

  // hydrate מ-localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) })
    } catch {}
  }, [])

  // persist ל-localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const subtotal = items.reduce((s, i) => s + i.itemTotal, 0)
  const count    = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      add:       (dish, variants, special) => dispatch({ type: "ADD", payload: {
        dishId: dish.id, dishName: dish.name, basePrice: dish.price, quantity: 1, variants, special,
      }}),
      remove:    (cartId)      => dispatch({ type: "REMOVE", cartId }),
      updateQty: (cartId, qty) => dispatch({ type: "QTY", cartId, qty }),
      clear:     ()            => dispatch({ type: "CLEAR" }),
      subtotal,
      count,
    }}>
      {children}
    </CartContext.Provider>
  )
}
```

---

## CartDrawer

```tsx
// src/restaurant/CartDrawer.tsx
"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "./CartProvider"
import { useRouter } from "next/navigation"

export function CartDrawer() {
  const [open, setOpen]   = useState(false)
  const { items, remove, updateQty, subtotal, count } = useCart()
  const router = useRouter()

  return (
    <>
      {/* Floating trigger */}
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-[var(--color-primary)] text-white
                     px-5 py-3 rounded-full shadow-xl font-bold flex items-center gap-2"
        >
          🛒 {count} פריטים — ₪{subtotal.toFixed(0)}
        </button>
      )}

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[var(--color-bg)]
                         shadow-2xl z-50 flex flex-col"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                <h2 className="font-bold text-lg">העגלה שלך ({count})</h2>
                <button onClick={() => setOpen(false)} className="text-2xl">✕</button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map(item => (
                  <div key={item.cartId}
                       className="flex gap-3 p-3 rounded-xl border border-[var(--color-border)]">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.dishName}</p>
                      {item.variants.length > 0 && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {item.variants.map(v => v.option).join(", ")}
                        </p>
                      )}
                      {item.special && (
                        <p className="text-xs text-[var(--color-text-muted)]">📝 {item.special}</p>
                      )}
                      <p className="font-bold text-[var(--color-primary)] mt-1">₪{item.itemTotal.toFixed(0)}</p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.quantity === 1 ? remove(item.cartId) : updateQty(item.cartId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold"
                      >−</button>
                      <span className="w-5 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.cartId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white
                                   flex items-center justify-center font-bold"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>סה״כ</span>
                  <span>₪{subtotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={() => { setOpen(false); router.push("/order/checkout") }}
                  className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl
                             font-bold text-lg"
                >
                  לתשלום
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## OrderWidget — 4 שלבי Checkout

```tsx
// src/restaurant/OrderWidget.tsx
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCart } from "./CartProvider"

const schema = z.object({
  name:    z.string().min(2, "שם קצר מדי"),
  phone:   z.string().regex(/^05\d{8}$/, "פורמט: 05XXXXXXXX"),
  address: z.string().optional(),
  notes:   z.string().max(300).optional(),
})

type Step = 1 | 2 | 3 | 4
type OrderType = "delivery" | "pickup" | "dine_in"

interface OrderWidgetProps {
  placeId:       string
  businessPhone: string
  tableNumber?:  string    // מ-URL params
  paymentMode:   "tranzila" | "whatsapp"
}

export function OrderWidget({ placeId, businessPhone, tableNumber, paymentMode }: OrderWidgetProps) {
  const [step,      setStep]      = useState<Step>(1)
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? "dine_in" : "delivery")
  const [orderId,   setOrderId]   = useState<string | null>(null)
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(false)
  const { items, subtotal, clear } = useCart()

  const form = useForm({ resolver: zodResolver(schema) })

  const submit = async (details: z.infer<typeof schema>) => {
    setLoading(true)
    const body = {
      place_id:         placeId,
      customer_name:    details.name,
      customer_phone:   details.phone,
      customer_address: orderType === "delivery" ? (details.address ?? "") : "",
      order_type:       orderType,
      table_number:     orderType === "dine_in" ? Number(tableNumber) : null,
      items:            items.map(i => ({
        dish_id:         i.dishId,
        quantity:        i.quantity,
        variants:        i.variants,
        special_request: i.special,
      })),
      notes:        details.notes ?? "",
      payment_mode: paymentMode,
    }

    const res  = await fetch("/api/orders", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const data = await res.json()
    setOrderId(data.id)
    setTotal(data.total)

    if (paymentMode === "tranzila" && data.payment_url) {
      window.location.href = data.payment_url
    } else {
      clear()
      setStep(4)
    }
    setLoading(false)
  }

  // ── שלב 1: סוג הזמנה ────────────────────────────────────────
  if (step === 1) return (
    <div dir="rtl" className="space-y-4">
      <h2 className="text-xl font-bold">איך תרצה לקבל?</h2>
      <div className="grid grid-cols-3 gap-3">
        {([ ["delivery", "🚗", "שלח לבית"],
            ["pickup",   "🏃", "איסוף עצמי"],
            ["dine_in",  "🍽", "ישיבה"] ] as const).map(([type, icon, label]) => (
          <button
            key={type}
            onClick={() => { setOrderType(type); setStep(2) }}
            className={[
              "flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2",
              orderType === type
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                : "border-[var(--color-border)]",
            ].join(" ")}
          >
            <span className="text-3xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── שלב 2 + 3: פרטים + סיכום ──────────────────────────────
  if (step === 2 || step === 3) return (
    <div dir="rtl" className="space-y-5">
      <button onClick={() => setStep(step - 1 as Step)}
              className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h2 className="text-xl font-bold">{step === 2 ? "פרטים אישיים" : "סיכום ותשלום"}</h2>

      {step === 2 ? (
        <form onSubmit={form.handleSubmit(() => setStep(3))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם מלא *</label>
            <input {...form.register("name")}
                   className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2" />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">טלפון *</label>
            <input type="tel" dir="ltr" {...form.register("phone")} placeholder="05X-XXXXXXX"
                   className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2" />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          {orderType === "delivery" && (
            <div>
              <label className="block text-sm font-medium mb-1">כתובת למשלוח *</label>
              <input {...form.register("address")}
                     className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2" />
            </div>
          )}
          {orderType === "dine_in" && tableNumber && (
            <div className="bg-[var(--color-surface)] rounded-xl p-3 text-sm">
              🪑 שולחן מספר <strong>{tableNumber}</strong>
            </div>
          )}
          <textarea {...form.register("notes")} rows={2} placeholder="הערות נוספות..."
                    className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm" />
          <button type="submit"
                  className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold">
            המשך לסיכום
          </button>
        </form>
      ) : (
        /* שלב 3: סיכום */
        <div className="space-y-5">
          {/* פריטים */}
          <div className="space-y-2 border border-[var(--color-border)] rounded-xl p-4">
            {items.map(i => (
              <div key={i.cartId} className="flex justify-between text-sm">
                <span>{i.dishName} ×{i.quantity}
                  {i.variants.length > 0 && (
                    <span className="text-[var(--color-text-muted)]"> ({i.variants.map(v=>v.option).join(", ")})</span>
                  )}
                </span>
                <span>₪{i.itemTotal.toFixed(0)}</span>
              </div>
            ))}
            <hr className="border-[var(--color-border)]" />
            <div className="flex justify-between font-bold text-lg">
              <span>סה״כ</span><span>₪{subtotal.toFixed(0)}</span>
            </div>
          </div>

          <button
            onClick={form.handleSubmit(submit)}
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold
                       text-lg disabled:opacity-50"
          >
            {loading ? "שולח..." : paymentMode === "tranzila" ? `💳 שלם ₪${subtotal.toFixed(0)}` : "שלח הזמנה"}
          </button>
        </div>
      )}
    </div>
  )

  // ── שלב 4: אישור (WhatsApp mode) ─────────────────────────
  if (step === 4) return (
    <div dir="rtl" className="text-center space-y-6 py-10">
      <div className="text-6xl">✅</div>
      <h2 className="text-2xl font-bold">ההזמנה התקבלה!</h2>
      <p className="text-[var(--color-text-muted)]">מספר הזמנה: #{orderId?.slice(0, 8)}</p>
      <p>נשלח אישור ל-WhatsApp שלך</p>
      <a
        href={`https://wa.me/${businessPhone}?text=הזמנה+%23${orderId?.slice(0,8)}+אושרה`}
        target="_blank" rel="noopener noreferrer"
        className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold"
      >
        📱 WhatsApp לאישור
      </a>
    </div>
  )

  return null
}
```

---

## Next.js API Route Proxy

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"

const API = process.env.API_URL ?? "http://localhost:8000"

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString()
  const res = await fetch(`${API}/api/v1/orders?${params}`)
  return NextResponse.json(await res.json(), { status: res.status })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const parsed = JSON.parse(body)

  const orderRes = await fetch(`${API}/api/v1/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  const order = await orderRes.json()
  if (!orderRes.ok) return NextResponse.json(order, { status: orderRes.status })

  // Tranzila — זהה לPhase 07 (רק orderId במקום bookingId)
  if (parsed.payment_mode === "tranzila" && process.env.TRANZILA_TERMINAL) {
    const payRes = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/payments/tranzila/create-page`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId:       order.id,
          amount:        order.total,
          description:   `הזמנה #${order.id.slice(0, 8)}`,
          customerName:  parsed.customer_name,
          customerPhone: parsed.customer_phone,
        }),
      }
    )
    const pay = await payRes.json()
    return NextResponse.json({ ...order, payment_url: pay.payment_url })
  }

  return NextResponse.json(order)
}
```

---

## Tranzila — 100% Reuse מ-Phase 07

קבצים **לשכפל ללא שינוי** (רק `bookingId` → `orderId` בשם המשתנה):
- `app/api/payments/tranzila/create-page/route.ts`
- `app/api/payments/tranzila/success/route.ts`
- `app/api/payments/tranzila/webhook/route.ts`

---

## שילוב ב-site_generator.py

```python
# בCLAUDE.md כש-bookingType = "restaurant":

"""
## RESTAURANT MENU & ORDERING

The business is a restaurant. Add full menu ordering system.

import { CartProvider, MenuCatalog, CartDrawer, OrderWidget } from "@tottemai/ui/restaurant"

app/[locale]/menu/page.tsx:
  Wrap in CartProvider + fetch categories from /api/v1/dishes/?place_id=...
  <MenuCatalog categories={categories} tableNumber={searchParams.table} />
  <CartDrawer />

app/[locale]/order/checkout/page.tsx:
  <OrderWidget placeId={config.placeId} paymentMode="tranzila" tableNumber={...} />

Required API routes:
  app/api/orders/route.ts
  app/api/payments/tranzila/ (copy from Phase 07 template)
"""
```

---

## QR Codes לשולחנות

```python
# GET /api/v1/qr/{place_id}/{table_number} → PNG image
# Admin: /admin/settings → "הדפס QR Codes" → PDF עם QR לכל שולחן

import qrcode, io

def generate_qr(place_id: str, table: int, domain: str) -> bytes:
    url = f"https://{domain}/menu?table={table}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
```

---

## בדיקות סיום שלב 8

- [ ] `GET /api/v1/dishes/?place_id=X` מחזיר menu קבוץ לפי קטגוריות
- [ ] MenuCatalog gallery view: מציגה DishCards
- [ ] ViewToggle: gallery ↔ table
- [ ] DishCard ללא variants: לחיצת "הוסף" → מוסיף ישר לcart
- [ ] DishCard עם variants: פותח DishVariantDrawer
- [ ] DishVariantDrawer — RadioGroup לחובה, Checkbox לרשות
- [ ] מחיר מתעדכן realtime בDrawer
- [ ] "הוסף לסל" — מוסיף לcart עם variants
- [ ] CartDrawer נפתח עם פריטים
- [ ] qty controls − / + עובדים, ×1→0 מסיר
- [ ] localStorage: cart נשמר בין רענונים
- [ ] OrderWidget: שלב 1 → בחר delivery/pickup/dine_in
- [ ] delivery: שדה כתובת מופיע
- [ ] dine_in: table auto-fill מ-URL
- [ ] Zod: טלפון לא תקין → שגיאה בעברית
- [ ] `POST /api/v1/orders/` יוצר order בDB
- [ ] Telegram notification לעסק עם פרטי ההזמנה
- [ ] Tranzila: לחיצת "שלם" → redirect
- [ ] Tranzila success: order.status = "confirmed"
- [ ] WhatsApp mode: step 4 + deeplink
- [ ] QR Code נוצר ונפתח לדף תפריט נכון
- [ ] RTL: כל הUI בעברית מימין לשמאל
- [ ] mobile: CartDrawer + DishVariantDrawer נוחים לגעת

← [[07 - Phase 7 - Service Catalog & Booking]]
→ [[08.1 - Phase 8.1 - Restaurant Admin Dashboard]]
