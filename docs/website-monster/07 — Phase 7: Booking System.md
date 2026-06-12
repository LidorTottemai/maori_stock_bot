# Phase 7: Booking System — מערכת הזמנות דיגיטלית

> **תלות:** Phase 1 (maori-ui)  
> **מתאים ל:** ספא, מספרה, פיזיותרפיה, יוגה, כושר, קליניקות, עורכי דין  
> **תוצר:** `BookingWidget` ב-maori-ui + FastAPI endpoints

---

## ה-Stack

```
Frontend (Next.js):
  - React Hook Form + Zod validation
  - date-fns לבחירת תאריכים
  - shadcn Calendar component
  - WhatsApp deeplink כconfirmation

Backend (FastAPI → SQLite/Postgres):
  - model: Appointment
  - endpoints לslots + יצירה + ביטול

Admin:
  - עמוד ב-Dashboard הקיים (dashboard.hhippo.co.il)
```

---

## Model — Appointment

```python
# app/models/appointment.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Appointment(SQLModel, table=True):
    id:           str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    place_id:     str = Field(index=True)       # קישור לעסק
    client_name:  str
    client_phone: str
    service_name: str
    service_price: int = 0                      # ₪
    date:         str                           # "2026-06-15"
    time_slot:    str                           # "14:30"
    status:       str = "pending"              # pending | confirmed | cancelled
    notes:        Optional[str] = None
    created_at:   datetime = Field(default_factory=datetime.utcnow)
    whatsapp_sent: bool = False
```

---

## FastAPI Endpoints

```python
# app/api/v1/endpoints/booking.py

GET  /api/v1/booking/slots
     params: place_id, date (YYYY-MM-DD), service
     returns: [{ time: "09:00", available: true }, ...]

POST /api/v1/booking/
     body: { place_id, client_name, client_phone, service_name, date, time_slot, notes }
     returns: { id, status: "pending", whatsapp_url }

GET  /api/v1/booking/{id}
     returns: Appointment

POST /api/v1/booking/{id}/confirm    ← admin
POST /api/v1/booking/{id}/cancel     ← admin or client
GET  /api/v1/booking/admin?place_id= ← כל ההזמנות לעסק
```

---

## BookingWidget — הרכיב ב-maori-ui

```tsx
// @tottemai/maori-ui/src/booking/BookingWidget.tsx

interface Service {
  name: string
  duration: number  // דקות
  price: number     // ₪
  description?: string
}

interface BookingWidgetProps {
  services: Service[]
  phone: string
  businessName: string
  apiUrl?: string     // default: /api/booking (Next.js route שמדבר עם FastAPI)
  accentColor?: string // default: var(--color-primary)
}

// UX Flow:
// Step 1: בחר שירות (רשימה עם מחירים ומשכים)
// Step 2: בחר תאריך (Calendar, disabled: ימי עבר + ימי חופש)
// Step 3: בחר שעה (slots מה-API, disabled: תפוסים)
// Step 4: הכנס שם + טלפון (React Hook Form + Zod)
// Step 5: לחץ "הזמן" → POST /api/booking
// Step 6: ✅ "תודה! נשלחה הודעה לWhatsApp" + deeplink
```

### קוד ה-Widget (skeleton)

```tsx
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { MagneticButton, ScrollReveal } from "../motion"

const schema = z.object({
  client_name:  z.string().min(2, "שם נדרש"),
  client_phone: z.string().regex(/^0\d{9}$/, "טלפון לא תקין"),
})

export function BookingWidget({ services, phone, businessName, apiUrl = "/api/booking" }: BookingWidgetProps) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [slots, setSlots] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const steps = [
    { label: "שירות", icon: "✂️" },
    { label: "תאריך", icon: "📅" },
    { label: "שעה",   icon: "🕐" },
    { label: "פרטים", icon: "👤" },
  ]

  // ... implementation
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]" dir="rtl">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${step > i ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
        ))}
      </div>
      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 1 && <ServiceStep services={services} onSelect={(s) => { setSelectedService(s); setStep(2) }} />}
        {step === 2 && <DateStep onSelect={(d) => { setSelectedDate(d); setStep(3) }} />}
        {step === 3 && <TimeStep slots={slots} onSelect={(t) => { setSelectedTime(t); setStep(4) }} />}
        {step === 4 && <DetailsStep onSubmit={handleSubmit(async (data) => {
          const res = await fetch(apiUrl, { method: "POST", headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ ...data, service_name: selectedService!.name, date: selectedDate, time_slot: selectedTime })
          })
          const json = await res.json()
          if (json.whatsapp_url) window.open(json.whatsapp_url, "_blank")
          setDone(true)
        })} />}
      </AnimatePresence>
      {done && <ConfirmationStep businessName={businessName} phone={phone} />}
    </div>
  )
}
```

---

## WhatsApp Deeplink

```python
# app/api/v1/endpoints/booking.py
def _whatsapp_url(phone: str, appointment: Appointment) -> str:
    clean_phone = phone.replace("-", "").replace(" ", "").replace("+", "")
    if clean_phone.startswith("0"):
        clean_phone = "972" + clean_phone[1:]
    msg = (
        f"שלום! רציתי לאשר הזמנה:\n"
        f"שם: {appointment.client_name}\n"
        f"שירות: {appointment.service_name}\n"
        f"תאריך: {appointment.date} בשעה {appointment.time_slot}\n"
        f"טלפון: {appointment.client_phone}"
    )
    return f"https://wa.me/{clean_phone}?text={urllib.parse.quote(msg)}"
```

---

## Admin Dashboard (עתידי)

הוספת עמוד `/bookings` ב-`dashboard.hhippo.co.il`:
- טבלה עם כל ההזמנות
- פילטר: place_id, תאריך, סטטוס
- כפתורי "אשר" / "בטל"
- badge: ממתין / מאושר / בוטל

---

## שילוב אוטומטי בבנייה

ב-`site_generator.py`, כשה-`bookingType == "appointment"`:

```python
# CLAUDE.md מוסיף:
"""
## BOOKING WIDGET — install and use

The @tottemai/maori-ui package includes a BookingWidget.
In app/[locale]/booking/page.tsx:

import { BookingWidget } from "@tottemai/maori-ui/booking"

const services = [
  { name: "{SERVICE_1}", duration: 60, price: {PRICE_1} },
  { name: "{SERVICE_2}", duration: 45, price: {PRICE_2} },
]

export default function BookingPage() {
  return (
    <main>
      <BookingWidget
        services={services}
        phone="{PHONE}"
        businessName="{BUSINESS_NAME}"
        apiUrl="/api/booking"
      />
    </main>
  )
}

Also create: app/api/booking/route.ts — a Next.js API route that proxies to {BACKEND_URL}/api/v1/booking/
"""
```

---

## בדיקות סוף שלב

- [ ] `BookingWidget` מוצג ומאפשר לעבור בין 4 steps
- [ ] `GET /api/v1/booking/slots` מחזיר slots פנויים
- [ ] `POST /api/v1/booking/` שומר appointment ב-DB
- [ ] WhatsApp deeplink נפתח עם ההודעה הנכונה
- [ ] Admin dashboard מציג ההזמנות
- [ ] rebuild אוטומטי של אתר קליניקה → `BookingWidget` קיים בדף booking
