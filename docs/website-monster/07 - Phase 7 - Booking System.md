# 📅 Phase 7 — מערכת הזמנות דיגיטלית

> **מתאים ל:** ספא, מספרה, פיזיותרפיה, יוגה, כושר, קליניקות
> **bookingType:** "appointment"

---

## Stack

```
Frontend (Next.js בכל אתר):
  ├── React Hook Form + Zod validation
  ├── date-fns לבחירת תאריכים
  ├── shadcn Calendar component
  └── WhatsApp deeplink כconfirmation

Backend (FastAPI ב-maori_stock_bot):
  ├── model: Appointment
  ├── endpoints: slots, create, cancel
  └── Telegram notification לעסק

Component (maori-ui):
  └── BookingWidget — plug-in לכל דף
```

---

## Model

```python
# app/models/appointment.py
class Appointment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id: str = Field(index=True)        # place_id של העסק
    name: str
    phone: str
    service: str
    date: str                                 # "2026-06-15"
    time: str                                 # "14:30"
    status: str = "pending"                  # pending/confirmed/cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: str = ""
```

---

## FastAPI Endpoints

```python
# app/api/v1/endpoints/bookings.py

GET  /api/v1/bookings/slots
     query: place_id, date, service
     response: [{ time: "09:00", available: true }, ...]

POST /api/v1/bookings/
     body: { place_id, name, phone, service, date, time, notes? }
     response: { id, whatsapp_url }
     side-effect: Telegram notification לעסק

GET  /api/v1/bookings/{id}
     response: Appointment

POST /api/v1/bookings/{id}/cancel
     response: { status: "cancelled" }

GET  /api/v1/bookings/admin/{place_id}
     query: date_from, date_to
     response: Appointment[]   (לdashboard של העסק)
```

---

## BookingWidget (maori-ui)

```tsx
// src/booking/BookingWidget.tsx
interface Service {
  id: string
  name: string
  duration: number   // דקות
  price: number      // ₪
  description?: string
}

interface BookingWidgetProps {
  services: Service[]
  phone: string
  businessName: string
  apiUrl?: string    // default: /api/bookings (local Next.js route)
  primaryColor?: string  // default: var(--color-primary)
}

export function BookingWidget({ services, phone, businessName, apiUrl = "/api/bookings" }: BookingWidgetProps) {
  // state: step (1=service, 2=date, 3=time, 4=details, 5=confirm)
  // WhatsApp URL: `https://wa.me/${phone}?text=...`
}
```

### UX Flow — 5 צעדים

```
שלב 1: בחר שירות
  ← grid of services עם מחיר ומשך
  ← ScrollReveal + Stagger animation

שלב 2: בחר תאריך
  ← Calendar מ-shadcn
  ← חסום ימי שבת + ימי חופש
  ← ClipReveal animation

שלב 3: בחר שעה
  ← grid of time slots (09:00, 09:30, ...)
  ← slots שתפוסים ← disabled
  ← MagneticButton על כל slot

שלב 4: פרטים אישיים
  ← שם + טלפון + הערות
  ← React Hook Form + Zod

שלב 5: אישור
  ← תקציר ההזמנה
  ← כפתור "שלח הודעת WhatsApp"
  ← deeplink: wa.me/{phone}?text=שלום, הזמנתי {שירות} ל-{תאריך} {שעה}
```

---

## Next.js API Route (בכל אתר)

```ts
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.API_URL ?? "http://localhost:8000"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString()
  const res = await fetch(`${BACKEND}/api/v1/bookings/slots?${params}`)
  return NextResponse.json(await res.json())
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const res = await fetch(`${BACKEND}/api/v1/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
```

---

## שילוב אוטומטי ב-site_generator.py

```python
# בCLAUDE.md — כשbookingType = "appointment":
"""
## BOOKING SYSTEM

The business requires online appointment booking.
@tottemai/maori-ui includes BookingWidget — use it:

import { BookingWidget } from "@tottemai/maori-ui/booking"

In app/[locale]/booking/page.tsx:
<BookingWidget
  services={config.services}
  phone={config.phone}
  businessName={config.businessName}
  apiUrl="/api/bookings"
/>

Create app/api/bookings/route.ts to proxy to backend.
"""
```

---

## בדיקות סיום שלב 7

- [ ] `POST /api/v1/bookings/` יוצר appointment ב-DB
- [ ] `GET /api/v1/bookings/slots` מחזיר slots נכונים
- [ ] BookingWidget step 1→2→3→4→5 עובד
- [ ] WhatsApp URL נפתח עם טקסט נכון
- [ ] Telegram notification לעסק
- [ ] slots תפוסים disabled
- [ ] validation: שם + טלפון חובה
- [ ] RTL Hebrew תקין
- [ ] אנגלית: LTR תקין
