# Phase 8: Restaurant Ordering System — הזמנה ממסעדות

> **תלות:** Phase 1 (maori-ui)  
> **מתאים ל:** מסעדות, קפה, מאפיות, קייטרינג, פיצריות  
> **תוצר:** `RestaurantMenu` ב-maori-ui + FastAPI endpoints

---

## ה-Stack

```
Frontend:
  - Cart Context (React Context + localStorage)
  - MenuSection: categories sidebar + items grid
  - CartDrawer: slide-in from right
  - CheckoutFlow: שם + טלפון + כתובת/שולחן + Stripe
  - OrderConfirmation: WhatsApp + email

Backend (FastAPI):
  - Menu management (static JSON or DB)
  - Order creation + status tracking
  - Stripe webhook → order confirmed

Payments:
  - Stripe: deposit או תשלום מלא
  - env: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## Models

```python
# app/models/menu_item.py
class MenuItem(SQLModel, table=True):
    id:          str = Field(default_factory=..., primary_key=True)
    place_id:    str = Field(index=True)
    category:    str          # "ראשונות", "עיקריות", "קינוחים"
    name:        str
    description: str = ""
    price:       int          # ₪, in agorot (multiply by 100 for Stripe)
    image_url:   str = ""
    available:   bool = True
    sort_order:  int = 0

# app/models/order.py
class Order(SQLModel, table=True):
    id:             str = Field(default_factory=..., primary_key=True)
    place_id:       str = Field(index=True)
    items_json:     str   # JSON: [{ name, qty, price }]
    total_agorot:   int   # total in agorot
    client_name:    str
    client_phone:   str
    delivery_type:  str   # "table" | "takeaway" | "delivery"
    table_number:   Optional[str] = None
    address:        Optional[str] = None
    status:         str = "pending"   # pending | paid | preparing | ready | delivered
    stripe_pi_id:   Optional[str] = None
    created_at:     datetime = Field(default_factory=datetime.utcnow)
```

---

## FastAPI Endpoints

```python
GET  /api/v1/menu/{place_id}
     returns: { categories: [{ name, items: [MenuItem] }] }

POST /api/v1/orders/
     body: { place_id, items: [{id, qty}], client_name, client_phone,
             delivery_type, table_number?, address? }
     returns: { order_id, stripe_payment_intent_client_secret?, total }

GET  /api/v1/orders/{id}
     returns: Order

PUT  /api/v1/orders/{id}/status   ← admin
     body: { status }

POST /api/v1/stripe/webhook
     ← Stripe sends here on payment success
     → updates order status to "paid"

GET  /api/v1/orders/admin?place_id=  ← כל ההזמנות
```

---

## RestaurantMenu Widget — maori-ui

```tsx
// @tottemai/maori-ui/src/restaurant/RestaurantMenu.tsx

interface MenuItem { id: string; name: string; description: string; price: number; image_url?: string; category: string }
interface Category { name: string; items: MenuItem[] }

interface RestaurantMenuProps {
  categories: Category[]
  currency?: string      // default: "₪"
  placeId: string
  apiUrl?: string        // default: "/api/orders"
  stripePublicKey?: string
}
```

### Layout

```tsx
<div className="flex gap-8 min-h-screen" dir="rtl">
  {/* Sidebar — categories */}
  <aside className="hidden md:block w-48 sticky top-24 h-fit">
    {categories.map(cat => (
      <button key={cat.name} onClick={() => scrollToCategory(cat.name)}
        className={`block w-full text-right py-2 px-4 rounded-lg transition-colors
          ${activeCategory === cat.name ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-surface-2)]"}`}>
        {cat.name}
      </button>
    ))}
  </aside>

  {/* Items grid */}
  <main className="flex-1">
    {categories.map(cat => (
      <section key={cat.name} id={`cat-${cat.name}`} className="mb-12">
        <SectionTitle title={cat.name} />
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cat.items.map(item => (
            <StaggerItem key={item.id}>
              <MenuItemCard item={item} onAdd={() => addToCart(item)} currency={currency} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    ))}
  </main>

  {/* Cart FAB */}
  <CartFab itemCount={cartCount} total={cartTotal} onClick={() => setCartOpen(true)} />
</div>

{/* Cart Drawer */}
<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
  items={cart} onCheckout={handleCheckout} currency={currency} />
```

### MenuItemCard

```tsx
function MenuItemCard({ item, onAdd, currency }) {
  return (
    <Reveal3D>
      <Card className="flex gap-4 p-4 cursor-pointer group">
        {item.image_url && (
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img src={item.image_url} alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text)]">{item.name}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-[var(--color-primary)]">{currency}{item.price}</span>
            <MagneticButton>
              <button onClick={onAdd}
                className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-full text-sm font-medium
                  hover:bg-[var(--color-primary-hover)] transition-colors">
                + הוסף
              </button>
            </MagneticButton>
          </div>
        </div>
      </Card>
    </Reveal3D>
  )
}
```

### CartDrawer

```tsx
// slide-in מהשמאל (RTL)
<motion.div
  initial={{ x: "-100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  className="fixed inset-y-0 left-0 w-96 bg-[var(--color-surface)] z-50 shadow-2xl"
>
  {/* items list + total + checkout button */}
</motion.div>
```

---

## Checkout Flow

```
1. CartDrawer: רשימה + סיכום + כפתור "לתשלום"
2. CheckoutModal: שם + טלפון + delivery_type (שולחן/איסוף/משלוח)
3. Stripe Elements (אם stripePublicKey מוגדר) OR "שלם בהגעה"
4. POST /api/orders → { stripe_client_secret }
5. Stripe payment → webhook → order confirmed
6. WhatsApp deeplink + confirmation screen
```

---

## WhatsApp Deeplink — הזמנה

```python
def _order_whatsapp_url(phone: str, order: Order) -> str:
    items = json.loads(order.items_json)
    items_text = "\n".join(f"  {i['qty']}× {i['name']} - ₪{i['price']}" for i in items)
    msg = (
        f"הזמנה חדשה! #{order.id[:8]}\n"
        f"לקוח: {order.client_name} | {order.client_phone}\n"
        f"סוג: {order.delivery_type}\n"
        f"פריטים:\n{items_text}\n"
        f"סה\"כ: ₪{order.total_agorot // 100}"
    )
    return f"https://wa.me/{_clean_phone(phone)}?text={urllib.parse.quote(msg)}"
```

---

## QR Menu (Bonus)

```tsx
// app/[locale]/menu/page.tsx — static page, no cart
// URL: https://{restaurant}.hhippo.co.il/menu
// QR code מוצב על השולחנות

// generate QR:
import QRCode from "qrcode"
const qr = await QRCode.toDataURL(`https://{restaurant}.hhippo.co.il/menu`)
```

---

## בדיקות סוף שלב

- [ ] `GET /api/v1/menu/{place_id}` מחזיר categories + items
- [ ] הוספת item לcart עובדת (cart state נשמר)
- [ ] CartDrawer מציג items ומחשב total נכון
- [ ] Checkout יוצר Order ב-DB
- [ ] WhatsApp deeplink נפתח עם ההזמנה
- [ ] Stripe webhook מעדכן order status
- [ ] Admin: `GET /api/v1/orders/admin` מציג הזמנות
- [ ] rebuild אוטומטי של אתר מסעדה → `RestaurantMenu` קיים
