# 📅 Phase 7 — מערכת הזמנות + סליקה ישראלית

> **מתאים ל:** ספא, מספרה, פיזיותרפיה, יוגה, כושר, קליניקות, קוסמטיקה
> **bookingType:** "appointment"
> **מזוהה אוטומטית** ב-SiteArchaeology — אם יש שירותים + מחירים ואין הזמנות online

---

## שערי תשלום ישראליים

| שער | פופולריות | API | iframe | עמלה | בחירה |
|-----|-----------|-----|--------|------|-------|
| **CardCom** | #1 בישראל | REST | ✅ | ~1.5% | **ראשי** |
| **PayPlus** | מודרני | REST | ✅ | ~1.7% | **fallback** |
| Meshulam | קטן | REST | ✅ | ~1.5% | — |
| Tranzila | ותיק | legacy | ✅ | ~1.5% | — |

---

## Stack

```
Frontend (Next.js בכל אתר):
  ├── React Hook Form + Zod
  ├── shadcn/ui Calendar
  ├── date-fns/he לתאריכים בעברית
  ├── CardCom → redirect לדף תשלום מאובטח
  └── WhatsApp deeplink — mode ללא סליקה

Backend (FastAPI ב-maori_stock_bot):
  ├── model: Appointment
  ├── endpoints: slots, create, confirm, cancel, admin
  └── Telegram notification לעסק

Component (maori-ui):
  └── BookingWidget — plug-in לכל דף
```

---

## Model

```python
# app/models/appointment.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import uuid4

class Appointment(SQLModel, table=True):
    id:         str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id:   str = Field(index=True)
    name:       str
    phone:      str
    service:    str
    service_id: str
    date:       str                                  # "2026-06-15"
    time:       str                                  # "14:30"
    duration:   int = 60                            # דקות
    price:      float = 0
    status:     str = "pending"                     # pending/confirmed/paid/cancelled
    payment_id: str = ""                            # CardCom LowProfileId
    payment_mode: str = "whatsapp"                  # "cardcom" | "payplus" | "whatsapp"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes:      str = ""
```

---

## FastAPI Endpoints

```python
# app/api/v1/endpoints/bookings.py

GET  /api/v1/bookings/slots
     query: place_id, date, service_id
     response: [{ time: "09:00", available: true }, ...]

POST /api/v1/bookings/
     body: { place_id, name, phone, service, service_id, date, time, notes?, price, payment_mode }
     response: { id, payment_url?, whatsapp_url }
     side-effect: Telegram notification לעסק

GET  /api/v1/bookings/{id}
     response: Appointment

POST /api/v1/bookings/{id}/confirm
     body: { payment_id }
     response: { status: "paid" }
     side-effect: Telegram + WhatsApp לאישור

POST /api/v1/bookings/{id}/cancel
     response: { status: "cancelled" }

GET  /api/v1/bookings/admin/{place_id}
     query: date_from, date_to, status?
     response: Appointment[]
```

```python
# חישוב slots פנויים
async def get_available_slots(place_id: str, date: str, service_id: str) -> list[dict]:
    # קבל את כל ההזמנות לאותו יום
    booked = await get_appointments_by_date(place_id, date)
    booked_times = {a.time for a in booked if a.status != "cancelled"}
    
    service = await get_service(service_id)
    duration = service.duration  # דקות
    
    # שעות עבודה מ-config (ב-maori_stock_bot per place_id)
    slots = generate_slots(start="09:00", end="18:00", step=30)
    
    return [
        { "time": t, "available": t not in booked_times }
        for t in slots
    ]
```

---

## CardCom Flow

```
לקוח מזין פרטים (שם, טלפון, שירות, תאריך, שעה)
    ↓
POST /api/bookings/create                         ← Next.js API route
    → POST /api/v1/bookings/ (FastAPI)            ← יצירת appointment בDB, status=pending
    → POST /api/payments/cardcom/create-page      ← בקשה לCardCom
    → response: { bookingId, cardcom_url }
    ↓
לקוח מועבר לדף תשלום מאובטח של CardCom          ← HTTPS, PCI-DSS
    ↓
CardCom → redirect ל: /api/payments/cardcom/success?LowProfileId=...&bookingId=...
    → POST /api/v1/bookings/{id}/confirm
    → Telegram לעסק: "הזמנה אושרה ושולמה 💳"
    → WhatsApp ללקוח: "הזמנתך אושרה ✅"
    ↓
לקוח → /booking/success (עם פרטי ההזמנה)
```

---

## Next.js API Routes

```ts
// app/api/payments/cardcom/create-page/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"

const schema = z.object({
  bookingId: z.string().uuid(),
  amount:    z.number().positive(),
  description: z.string().min(2).max(200),
  customerName:  z.string().min(2),
  customerPhone: z.string().regex(/^05\d{8}$/),
})

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })

  const { bookingId, amount, description, customerName, customerPhone } = parsed.data

  const params = new URLSearchParams({
    TerminalNumber:      env.CARDCOM_TERMINAL!,
    UserName:            env.CARDCOM_USERNAME!,
    SumToBill:           String(amount),
    CoinID:              "1",          // ₪ שקל
    Language:            "he",
    ProductName:         description,
    CustomerName:        customerName,
    CustomerPhone:       customerPhone,
    SuccessRedirectUrl:  `${env.NEXT_PUBLIC_DOMAIN}/api/payments/cardcom/success?bookingId=${bookingId}`,
    ErrorRedirectUrl:    `${env.NEXT_PUBLIC_DOMAIN}/booking/error?bookingId=${bookingId}`,
    WebHookURL:          `${env.NEXT_PUBLIC_DOMAIN}/api/payments/cardcom/webhook`,
    ReturnValue:         bookingId,
    Operation:           "2",          // חיוב ישיר
    CardOwnerPhone:      customerPhone,
  })

  const res = await fetch("https://secure.cardcom.solutions/interface/BillGoldPost.aspx", {
    method: "POST",
    body: params,
  })

  const text = await res.text()
  const result = Object.fromEntries(new URLSearchParams(text))

  if (result.ResponseCode !== "0") {
    return NextResponse.json({ error: "CardCom error", code: result.ResponseCode }, { status: 502 })
  }

  return NextResponse.json({ url: result.url, lowProfileId: result.LowProfileId })
}
```

```ts
// app/api/payments/cardcom/success/route.ts
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId")
  const lowProfileId = req.nextUrl.searchParams.get("LowProfileId")

  if (!bookingId || !lowProfileId) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_DOMAIN}/booking/error`)
  }

  // אשר ב-backend
  await fetch(`${env.API_URL}/api/v1/bookings/${bookingId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_id: lowProfileId }),
  })

  return NextResponse.redirect(`${env.NEXT_PUBLIC_DOMAIN}/booking/success?id=${bookingId}`)
}
```

```ts
// app/api/payments/cardcom/webhook/route.ts
// CardCom שולח webhook גם בדפדפן סגור
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const bookingId = body.get("ReturnValue") as string
  const lowProfileId = body.get("LowProfileId") as string
  const responseCode = body.get("ResponseCode") as string

  if (responseCode === "0" && bookingId) {
    await fetch(`${env.API_URL}/api/v1/bookings/${bookingId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: lowProfileId }),
    })
  }

  return new Response("OK", { status: 200 })
}
```

---

## PayPlus (Fallback)

```ts
// app/api/payments/payplus/create-page/route.ts
// PayPlus REST API — מודרני יותר מCardCom
export async function POST(req: NextRequest) {
  const { bookingId, amount, description } = await req.json()

  const res = await fetch("https://restapi.payplus.co.il/api/v1.0/PaymentPages/generateLink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${env.PAYPLUS_API_KEY}:${env.PAYPLUS_SECRET}`,
    },
    body: JSON.stringify({
      payment_page_uid: env.PAYPLUS_PAGE_UID,
      charge_method: 1,
      amount,
      currency_code: "ILS",
      sendEmailApproval: false,
      more_info: bookingId,
      RedirectURL: `${env.NEXT_PUBLIC_DOMAIN}/api/payments/payplus/success?bookingId=${bookingId}`,
      CallbackURL: `${env.NEXT_PUBLIC_DOMAIN}/api/payments/payplus/webhook`,
    }),
  })

  const data = await res.json()
  return NextResponse.json({ url: data.data.payment_page_link })
}
```

---

## BookingWidget — 6 שלבים

```tsx
// src/booking/BookingWidget.tsx
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar } from "@/components/ui/calendar"
import { he } from "date-fns/locale"
import { format } from "date-fns"

interface Service {
  id:           string
  name:         string
  duration:     number    // דקות
  price:        number    // ₪
  description?: string
}

interface BookingWidgetProps {
  services:      Service[]
  phone:         string
  businessName:  string
  placeId:       string
  paymentMode:   "cardcom" | "payplus" | "whatsapp_only"
  apiUrl?:       string
}

const detailsSchema = z.object({
  name:    z.string().min(2, "שם קצר מדי"),
  phone:   z.string().regex(/^05\d{8}$/, "מספר טלפון לא תקין"),
  notes:   z.string().max(500).optional(),
})

type Step = 1 | 2 | 3 | 4 | 5 | 6

export function BookingWidget({ services, phone, businessName, placeId, paymentMode, apiUrl = "/api/bookings" }: BookingWidgetProps) {
  const [step, setStep] = useState<Step>(1)
  const [service, setService] = useState<Service | null>(null)
  const [date,    setDate]    = useState<Date | null>(null)
  const [time,    setTime]    = useState<string | null>(null)
  const [slots,   setSlots]   = useState<{ time: string; available: boolean }[]>([])
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm({ resolver: zodResolver(detailsSchema) })

  const fetchSlots = async (selectedDate: Date, serviceId: string) => {
    const res = await fetch(
      `${apiUrl}/slots?place_id=${placeId}&date=${format(selectedDate, "yyyy-MM-dd")}&service_id=${serviceId}`
    )
    const data = await res.json()
    setSlots(data)
  }

  const submit = async (details: z.infer<typeof detailsSchema>) => {
    if (!service || !date || !time) return
    setLoading(true)
    
    const res = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: placeId,
        service:   service.name,
        service_id: service.id,
        date: format(date, "yyyy-MM-dd"),
        time,
        price: service.price,
        payment_mode: paymentMode,
        ...details,
      }),
    })

    const data = await res.json()
    setBookingId(data.id)

    if (paymentMode !== "whatsapp_only" && data.payment_url) {
      // מעבר לCardCom / PayPlus
      window.location.href = data.payment_url
    } else {
      setStep(6)
    }
    setLoading(false)
  }

  const whatsappUrl = () => {
    const text = `שלום ${businessName}, אני רוצה להזמין ${service?.name} לתאריך ${date ? format(date, "dd/MM/yyyy", { locale: he }) : ""} בשעה ${time}. שמי ${form.getValues("name")}.`
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
  }

  // ── שלב 1: בחר שירות ─────────────────────────────
  if (step === 1) return (
    <div dir="rtl" className="space-y-4">
      <h2 className="text-xl font-bold">בחר שירות</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => { setService(s); setStep(2) }}
            className="text-right p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-[var(--color-text-muted)]">{s.duration} דקות • ₪{s.price}</div>
            {s.description && <div className="text-sm mt-1">{s.description}</div>}
          </button>
        ))}
      </div>
    </div>
  )

  // ── שלב 2: בחר תאריך ─────────────────────────────
  if (step === 2) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={() => setStep(1)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h2 className="text-xl font-bold">בחר תאריך</h2>
      <Calendar
        mode="single"
        selected={date ?? undefined}
        onSelect={async (d) => {
          if (!d || !service) return
          setDate(d)
          await fetchSlots(d, service.id)
          setStep(3)
        }}
        disabled={(d) => {
          const day = d.getDay()
          return day === 6 || d < new Date()  // חסום שבת + עבר
        }}
        locale={he}
      />
    </div>
  )

  // ── שלב 3: בחר שעה ───────────────────────────────
  if (step === 3) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={() => setStep(2)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h2 className="text-xl font-bold">בחר שעה</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map(slot => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => { setTime(slot.time); setStep(4) }}
            className={[
              "py-2 rounded-lg text-sm font-medium transition-colors",
              slot.available
                ? "border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                : "bg-[var(--color-muted,#f3f4f6)] text-[var(--color-text-muted)] cursor-not-allowed line-through",
            ].join(" ")}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  )

  // ── שלב 4: פרטים אישיים ──────────────────────────
  if (step === 4) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={() => setStep(3)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h2 className="text-xl font-bold">פרטים אישיים</h2>
      <form onSubmit={form.handleSubmit(() => setStep(5))} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">שם מלא *</label>
          <input id="name" {...form.register("name")} className="w-full border rounded-lg px-3 py-2" />
          {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">טלפון *</label>
          <input id="phone" type="tel" {...form.register("phone")} placeholder="05X-XXXXXXX" className="w-full border rounded-lg px-3 py-2" dir="ltr" />
          {form.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
          <textarea id="notes" {...form.register("notes")} rows={3} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <button type="submit" className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold">
          המשך לתשלום
        </button>
      </form>
    </div>
  )

  // ── שלב 5: תשלום / אישור ──────────────────────────
  if (step === 5) return (
    <div dir="rtl" className="space-y-6">
      <button onClick={() => setStep(4)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h2 className="text-xl font-bold">סיכום הזמנה</h2>

      {/* תקציר */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 space-y-2 border border-[var(--color-border)]">
        <div className="flex justify-between"><span>שירות</span><span className="font-medium">{service?.name}</span></div>
        <div className="flex justify-between"><span>תאריך</span><span className="font-medium">{date ? format(date, "dd/MM/yyyy", { locale: he }) : ""}</span></div>
        <div className="flex justify-between"><span>שעה</span><span className="font-medium">{time}</span></div>
        <div className="flex justify-between"><span>משך</span><span className="font-medium">{service?.duration} דקות</span></div>
        <hr className="border-[var(--color-border)]" />
        <div className="flex justify-between font-bold text-lg"><span>לתשלום</span><span>₪{service?.price}</span></div>
      </div>

      {paymentMode === "whatsapp_only" ? (
        /* WhatsApp-only mode */
        <button
          onClick={async () => {
            await form.handleSubmit(submit)()
          }}
          className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <span>📱</span> שלח הזמנה ב-WhatsApp
        </button>
      ) : (
        /* CardCom payment */
        <button
          onClick={form.handleSubmit(submit)}
          disabled={loading}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "מעבד..." : `💳 שלם ₪${service?.price} בCardCom`}
        </button>
      )}
    </div>
  )

  // ── שלב 6: אישור (WhatsApp mode) ─────────────────
  if (step === 6) return (
    <div dir="rtl" className="text-center space-y-6 py-8">
      <div className="text-5xl">✅</div>
      <h2 className="text-2xl font-bold">ההזמנה נקלטה!</h2>
      <p className="text-[var(--color-text-muted)]">
        {service?.name} • {date ? format(date, "dd/MM/yyyy", { locale: he }) : ""} • {time}
      </p>
      <p>לאישור סופי שלח הודעת WhatsApp:</p>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-xl font-semibold"
      >
        📱 שלח הודעת WhatsApp
      </a>
    </div>
  )

  return null
}
```

---

## Next.js API Route Proxy

```ts
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

const BACKEND = env.API_URL

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString()
  const res = await fetch(`${BACKEND}/api/v1/bookings/slots?${params}`)
  return NextResponse.json(await res.json(), { status: res.status })
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  // יצירת appointment
  const bookingRes = await fetch(`${BACKEND}/api/v1/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  const booking = await bookingRes.json()

  if (!bookingRes.ok) return NextResponse.json(booking, { status: bookingRes.status })

  // אם CardCom — צור payment page
  const parsed = JSON.parse(body)
  if (parsed.payment_mode === "cardcom" && env.CARDCOM_TERMINAL) {
    const payRes = await fetch(`${env.NEXT_PUBLIC_DOMAIN}/api/payments/cardcom/create-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId:     booking.id,
        amount:        parsed.price,
        description:   `${parsed.service} — ${parsed.date} ${parsed.time}`,
        customerName:  parsed.name,
        customerPhone: parsed.phone,
      }),
    })
    const pay = await payRes.json()
    return NextResponse.json({ ...booking, payment_url: pay.url })
  }

  return NextResponse.json(booking)
}
```

---

## Telegram Notification (Backend)

```python
# app/services/telegram.py
import httpx
from app.core.config import settings

async def notify_business(appointment, emoji="📅"):
    if not settings.TELEGRAM_BOT_TOKEN:
        return
    
    msg = f"""
{emoji} הזמנה חדשה — {appointment.place_id}

👤 {appointment.name} | 📞 {appointment.phone}
💆 {appointment.service}
📅 {appointment.date} בשעה {appointment.time}
💰 ₪{appointment.price:,.0f}
🔑 מזהה: #{appointment.id[:8]}
"""
    if appointment.notes:
        msg += f"\n📝 {appointment.notes}"
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": settings.TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"},
            timeout=10,
        )
```

---

## זיהוי אוטומטי ב-site_generator.py

```python
def detect_payment_needed(arch: SiteArchaeology) -> tuple[bool, str]:
    """
    מחזיר (needs_payment, payment_mode)
    """
    has_prices = any(s.price for s in arch.services)
    
    if not has_prices:
        return False, "whatsapp_only"
    
    if os.getenv("CARDCOM_TERMINAL"):
        return True, "cardcom"
    elif os.getenv("PAYPLUS_API_KEY"):
        return True, "payplus"
    else:
        return True, "whatsapp_only"


# ב-build_claude_md():
needs_payment, payment_mode = detect_payment_needed(arch)
if not arch.has_booking:
    claude_md += f"""
## BOOKING SYSTEM (לא היה באתר הישן — הוסף!)

הוסף מערכת הזמנות מלאה עם {len(arch.services)} שירותים שנמצאו:

```tsx
import {{ BookingWidget }} from "@tottemai/ui/booking"

<BookingWidget
  services={{config.services}}
  phone={{config.phone}}
  businessName={{config.name}}
  placeId={{config.placeId}}
  paymentMode="{payment_mode}"
/>
```

צור: app/api/bookings/route.ts, app/api/payments/cardcom/
"""
```

---

## שילוב אוטומטי ב-CLAUDE.md

```
## BOOKING SYSTEM

{"הוסף BookingWidget — לא היה באתר הישן." if not has_booking else "האתר הישן כלל מערכת הזמנות — שדרג אותה."}

payment_mode: "{payment_mode}"
services: {json.dumps(services_list, ensure_ascii=False)}

קבצים שחייבים להיות:
- app/[locale]/booking/page.tsx      ← BookingWidget
- app/api/bookings/route.ts          ← proxy לbackend
- app/api/payments/cardcom/          ← אם payment_mode = "cardcom"
- app/booking/success/page.tsx
- app/booking/error/page.tsx
```

---

## בדיקות סיום שלב 7

- [ ] `POST /api/v1/bookings/` יוצר appointment ב-DB
- [ ] `GET /api/v1/bookings/slots` מחזיר slots נכונים
- [ ] BookingWidget: 6 שלבים עובדים ↔ חזור
- [ ] slots תפוסים — disabled
- [ ] שבת חסומה בcalendar
- [ ] validation: שם + טלפון חובה, שגיאות בעברית
- [ ] **CardCom mode:** לחיצת "שלם" → redirect לCardCom
- [ ] **CardCom success:** callback → appointment.status = "paid"
- [ ] **CardCom webhook:** עובד גם כשהדפדפן נסגר
- [ ] **WhatsApp mode:** כפתור נפתח עם טקסט מוכן
- [ ] Telegram notification לעסק עם כל הפרטים
- [ ] PayPlus fallback עובד כשCardCom לא מוגדר
- [ ] RTL: כל הטופס בעברית מימין לשמאל
- [ ] מובייל: 44×44px לכל כפתור, calendar נוח לגעת
- [ ] `/booking/success` ← הצגת פרטי ההזמנה
- [ ] `/booking/error` ← הודעת שגיאה ואפשרות לנסות שוב
- [ ] Rate limit: 5 הזמנות/דקה per IP
