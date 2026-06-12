# 🍕 Phase 8 — מערכת הזמנה ממסעדות

> **מתאים ל:** מסעדות, קפה, מאפיות, קייטרינג, food trucks
> **bookingType:** "restaurant"

---

## Stack

```
Frontend:
  ├── CartContext (React Context + localStorage)
  ├── MenuSection — categories sidebar + items grid
  ├── CartDrawer — slide-in מימין
  ├── CheckoutForm — שם + טלפון + שולחן/כתובת
  └── Stripe Checkout (deposit or full payment)

Backend:
  ├── model: Order, OrderItem, MenuItem
  ├── endpoints: menu, create order, status, admin
  └── Stripe webhook

QR Code:
  └── Static QR per table → /menu?table=5
```

---

## Models

```python
class MenuItem(SQLModel, table=True):
    id: str = Field(default_factory=...)
    place_id: str = Field(index=True)
    category: str          # "ראשונות", "עיקריות", "קינוחים"
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    available: bool = True
    order_index: int = 0

class Order(SQLModel, table=True):
    id: str = Field(default_factory=...)
    place_id: str = Field(index=True)
    items: str             # JSON: [{ id, name, price, qty }]
    total: float
    status: str = "pending"  # pending/confirmed/preparing/ready/paid
    type: str = "dine_in"    # dine_in/takeaway/delivery
    table_number: str = ""
    address: str = ""
    customer_name: str
    customer_phone: str
    stripe_payment_intent: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## FastAPI Endpoints

```python
GET  /api/v1/menu/{place_id}
     response: { categories: [{ name, items: MenuItem[] }] }

POST /api/v1/orders/
     body: { place_id, items, type, table_number?, address?, customer_name, customer_phone }
     response: { id, stripe_payment_url? }

GET  /api/v1/orders/{id}
     response: Order

PUT  /api/v1/orders/{id}/status   (admin)
     body: { status: "confirmed" | "preparing" | "ready" | "paid" }

GET  /api/v1/orders/admin/{place_id}
     query: date, status?
     response: Order[]

POST /api/v1/webhooks/stripe
     Stripe webhook → update Order.status
```

---

## RestaurantMenu Component (maori-ui)

```tsx
// src/restaurant/RestaurantMenu.tsx

interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface RestaurantMenuProps {
  categories: MenuCategory[]
  currency?: string         // default "₪"
  onOrder: (items: CartItem[]) => void
  tableNumber?: string      // from URL params
}

export function RestaurantMenu({ categories, currency = "₪", onOrder, tableNumber }: RestaurantMenuProps) {
  // CartContext מסביב
  // layout: sticky sidebar (categories) + scrollable items grid
  // CartDrawer: AnimatePresence slide-in מימין
}
```

### UX Flow

```
1. /menu?table=5 (QR code)
   ← MenuSection: categories בצד שמאל (sticky)
   ← Items grid: תמונה + שם + מחיר + כפתור +
   ← כפתור + → CartDrawer נפתח (slide + spring animation)

2. CartDrawer
   ← item list עם qty controls
   ← total
   ← כפתור "להמשך" → Checkout

3. Checkout
   ← שם + טלפון (חובה)
   ← שולחן: auto-filled מURL
   ← בחר: כאן / טייק-אוויי / משלוח
   ← Stripe (אם configured) OR "שלח הזמנה"

4. אישור
   ← הודעה "הזמנתך התקבלה!"
   ← מספר הזמנה
   ← WhatsApp link להודעת אישור

5. Admin Dashboard (בדשבורד)
   ← הזמנות incoming real-time
   ← כפתורי סטטוס: אשר / מכין / מוכן / שולם
   ← צליל התראה על הזמנה חדשה
```

---

## CartContext

```tsx
// src/restaurant/CartContext.tsx
interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

interface CartContextValue {
  items: CartItem[]
  add: (item: MenuItem) => void
  remove: (id: string) => void
  update: (id: string, qty: number) => void
  clear: () => void
  total: number
  count: number
}

// persist to localStorage
// CartDrawer: useMotionValue + AnimatePresence
```

---

## QR Code Generation

```python
# FastAPI: generate QR per table
# GET /api/v1/qr/{place_id}/{table}
# returns: PNG image of QR code pointing to /{slug}.hhippo.co.il/menu?table={n}

import qrcode
qr = qrcode.make(f"https://{slug}.hhippo.co.il/menu?table={table}")
```

---

## בדיקות סיום שלב 8

- [ ] `GET /api/v1/menu/{place_id}` מחזיר menu
- [ ] הוספת item לcart → CartDrawer נפתח
- [ ] qty controls עובדים
- [ ] `POST /api/v1/orders/` יוצר order
- [ ] Telegram notification לעסק
- [ ] Stripe webhook מעדכן status
- [ ] QR code נוצר ונפתח נכון
- [ ] RTL Hebrew תקין
- [ ] mobile: layout עובד
