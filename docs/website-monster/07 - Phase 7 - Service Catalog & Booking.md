# 📅 Phase 7 — קטלוג שירותים + מערכת הזמנות

> **מתאים ל:** ספא, מספרה, פיזיותרפיה, יוגה, כושר, קוסמטיקה, קליניקות
> **bookingType:** `"appointment"`
> **מזוהה אוטומטית** ב-SiteArchaeology — אם יש שירותים + מחירים
> **ראה:** [[07.1 - Phase 7.1 - Booking Admin Dashboard]], [[services/booking]], [[services/tranzila]]

---

## המטרה

מודול גנרי — כל אתר שנבנה מקבל:

1. **קטלוג שירותים** — gallery cards ↔ table view (toggle)
2. **דף מוצר** לכל שירות — `/services/[slug]`
3. **BookingWidget** — flow הזמנה 6 שלבים
4. **תשלום דרך טרנזילה** — או WhatsApp כ-fallback אוטומטי
5. **Admin Dashboard** — ניהול הזמנות ושירותים (/admin) ← Phase 7.1

---

## ארכיטקטורה

```
Frontend (Next.js — כל אתר שנבנה)
├── app/[locale]/services/page.tsx          ← קטלוג שירותים
├── app/[locale]/services/[slug]/page.tsx   ← דף מוצר
├── app/[locale]/booking/success/page.tsx
├── app/[locale]/booking/error/page.tsx
├── app/api/bookings/route.ts               ← proxy → FastAPI
├── app/api/payments/tranzila/
│   ├── create-page/route.ts
│   ├── success/route.ts
│   └── webhook/route.ts
└── app/[locale]/admin/                     ← Phase 7.1

Backend (FastAPI ב-maori_stock_bot)
├── app/models/service.py
├── app/models/appointment.py
├── app/api/v1/endpoints/services.py
├── app/api/v1/endpoints/bookings.py
└── app/services/tranzila_service.py

Component Library (@tottemai/ui/booking)
├── BookingModule          ← entry point
├── ServiceCatalog         ← gallery + table toggle
├── ServiceCard            ← כרטיס אחד ב-gallery
├── ServiceDetailPage      ← דף מוצר מלא
├── BookingWidget          ← 6-step form
├── ViewToggle             ← כפתור gallery/table
├── BookingSuccess         ← דף אישור
└── BookingError           ← דף שגיאה
```

---

## Data Models

### Service

```python
class Service(SQLModel, table=True):
    id:              str      # uuid, PK
    place_id:        str      # index
    slug:            str      # unique per place_id ("עיסוי-שוודי" → "yswy-shwdy")
    name:            str
    description:     str      # Text — תיאור מלא
    duration:        int      # דקות (15–180)
    price:           float    # ₪
    category:        str      # "עיסוי" | "פנים" | "שיער" | ...
    image_urls_json: str      # JSON: ["url1", "url2"]
    is_active:       bool     # True
    sort_order:      int      # סדר תצוגה
    created_at:      datetime
```

### Appointment

```python
class Appointment(SQLModel, table=True):
    id:             str      # uuid, PK
    place_id:       str      # index
    service_id:     str      # FK → service.id
    customer_name:  str
    customer_phone: str      # "0521234567"
    date:           str      # "YYYY-MM-DD"
    time:           str      # "HH:MM"
    duration:       int      # מ-service
    price:          float    # מ-service
    status:         str      # pending / confirmed / paid / cancelled
    payment_id:     str      # TranzilaTK
    payment_mode:   str      # "tranzila" | "whatsapp"
    notes:          str
    created_at:     datetime
```

---

## ServiceCatalog Component

```tsx
// src/booking/ServiceCatalog.tsx
"use client"
import { useState } from "react"
import { ServiceCard } from "./ServiceCard"
import { ViewToggle } from "./ViewToggle"
import { DataTable } from "@tottemai/ui/data-display"
import type { Service } from "./types"

interface ServiceCatalogProps {
  services:     Service[]
  defaultView?: "gallery" | "table"
  onBook?:      (service: Service) => void
}

export function ServiceCatalog({
  services,
  defaultView = "gallery",
  onBook,
}: ServiceCatalogProps) {
  const [view, setView] = useState<"gallery" | "table">(defaultView)

  const tableColumns = [
    { key: "name",     label: "שירות",    sortable: true },
    { key: "category", label: "קטגוריה" },
    { key: "duration", label: "משך",      render: (v: number) => `${v} דקות` },
    { key: "price",    label: "מחיר",     render: (v: number) => `₪${v.toLocaleString("he-IL")}` },
    {
      key: "action",
      label: "",
      render: (_: unknown, row: Service) => (
        <button
          onClick={() => onBook?.(row)}
          className="text-[var(--color-primary)] font-medium hover:underline text-sm"
        >
          הזמן
        </button>
      ),
    },
  ]

  return (
    <div dir="rtl" className="space-y-6">
      {/* header + toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">השירותים שלנו</h2>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === "gallery" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <ServiceCard key={s.id} service={s} onBook={onBook} />
          ))}
        </div>
      ) : (
        <DataTable columns={tableColumns} rows={services} />
      )}
    </div>
  )
}
```

---

## ViewToggle Component

```tsx
// src/booking/ViewToggle.tsx
import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  value:    "gallery" | "table"
  onChange: (v: "gallery" | "table") => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="שנה תצוגה"
      className="flex rounded-lg border border-[var(--color-border)] overflow-hidden"
    >
      {(["gallery", "table"] as const).map(mode => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          className={[
            "p-2 transition-colors",
            value === mode
              ? "bg-[var(--color-primary)] text-white"
              : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]",
          ].join(" ")}
        >
          {mode === "gallery" ? <LayoutGrid size={18} /> : <List size={18} />}
        </button>
      ))}
    </div>
  )
}
```

---

## ServiceCard Component

```tsx
// src/booking/ServiceCard.tsx
import { useRouter } from "next/navigation"
import { MagneticButton } from "@tottemai/ui/motion"
import type { Service } from "./types"

interface ServiceCardProps {
  service: Service
  onBook?: (service: Service) => void
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/services/${service.slug}`)}
      className="rounded-2xl border border-[var(--color-border)] overflow-hidden
                 hover:shadow-xl transition-shadow cursor-pointer group"
    >
      {/* תמונה */}
      <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
        {service.image_urls[0] ? (
          <img
            src={service.image_urls[0]}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">💆</div>
        )}
      </div>

      {/* תוכן */}
      <div dir="rtl" className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
          {service.category && (
            <span className="shrink-0 text-xs px-2 py-1 rounded-full
                             bg-[var(--color-surface)] border border-[var(--color-border)]
                             text-[var(--color-text-muted)]">
              {service.category}
            </span>
          )}
        </div>

        {service.description && (
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted)]">
            ⏱ {service.duration} דקות
          </span>
          <span className="font-bold text-xl text-[var(--color-primary)]">
            ₪{service.price.toLocaleString("he-IL")}
          </span>
        </div>

        <MagneticButton
          onClick={e => {
            e.stopPropagation()
            onBook?.(service)
          }}
          className="w-full py-2.5 rounded-xl bg-[var(--color-primary)]
                     text-white font-semibold text-sm"
        >
          הזמן עכשיו
        </MagneticButton>
      </div>
    </div>
  )
}
```

---

## ServiceDetailPage — /services/[slug]

```tsx
// app/[locale]/services/[slug]/page.tsx
import { BookingWidget } from "@tottemai/ui/booking"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: { locale: string; slug: string }
}

async function fetchService(slug: string, placeId: string) {
  const res = await fetch(
    `${process.env.API_URL}/api/v1/services/${slug}?place_id=${placeId}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await fetchService(params.slug, process.env.PLACE_ID!)
  if (!service) return {}
  return {
    title: `${service.name} — ${process.env.BUSINESS_NAME}`,
    description: service.description || `הזמן ${service.name} אונליין`,
    openGraph: { images: service.image_urls[0] ? [service.image_urls[0]] : [] },
  }
}

export default async function ServicePage({ params }: Props) {
  const service = await fetchService(params.slug, process.env.PLACE_ID!)
  if (!service) notFound()

  return (
    <main dir="rtl" className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Hero */}
      {service.image_urls[0] && (
        <div className="rounded-3xl overflow-hidden aspect-[16/7]">
          <img
            src={service.image_urls[0]}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {service.category && (
            <span className="text-sm px-3 py-1 rounded-full
                             bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {service.category}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold">{service.name}</h1>

        <div className="flex items-center gap-6 text-lg">
          <span>⏱ {service.duration} דקות</span>
          <span className="font-bold text-[var(--color-primary)] text-2xl">
            ₪{service.price.toLocaleString("he-IL")}
          </span>
        </div>

        {service.description && (
          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed max-w-prose">
            {service.description}
          </p>
        )}
      </div>

      {/* Gallery */}
      {service.image_urls.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {service.image_urls.slice(1).map((url: string, i: number) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <img src={url} alt={`${service.name} ${i + 2}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Booking Widget */}
      <div className="border border-[var(--color-border)] rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-bold mb-8">הזמן תור</h2>
        <BookingWidget
          service={service}
          placeId={process.env.PLACE_ID!}
          businessName={process.env.BUSINESS_NAME!}
          businessPhone={process.env.BUSINESS_PHONE!}
          paymentMode={process.env.TRANZILA_TERMINAL ? "tranzila" : "whatsapp"}
          apiUrl="/api/bookings"
        />
      </div>
    </main>
  )
}
```

---

## BookingWidget — 6 שלבים (קוד מלא)

```tsx
// src/booking/BookingWidget.tsx
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar } from "@tottemai/ui/forms"
import { he } from "date-fns/locale"
import { format } from "date-fns"
import type { Service } from "./types"

interface BookingWidgetProps {
  service:       Service
  placeId:       string
  businessName:  string
  businessPhone: string
  paymentMode:   "tranzila" | "whatsapp"
  apiUrl?:       string
}

const schema = z.object({
  name:  z.string().min(2, "שם קצר מדי"),
  phone: z.string().regex(/^05\d{8}$/, "פורמט: 05XXXXXXXX"),
  notes: z.string().max(500).optional(),
})

type Step = 1 | 2 | 3 | 4 | 5 | 6
type FormData = z.infer<typeof schema>

export function BookingWidget({
  service, placeId, businessName, businessPhone, paymentMode, apiUrl = "/api/bookings",
}: BookingWidgetProps) {
  const [step,      setStep]      = useState<Step>(1)
  const [date,      setDate]      = useState<Date | null>(null)
  const [time,      setTime]      = useState<string | null>(null)
  const [slots,     setSlots]     = useState<{ time: string; available: boolean }[]>([])
  const [loading,   setLoading]   = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const fetchSlots = async (d: Date) => {
    const res = await fetch(
      `${apiUrl}/slots?place_id=${placeId}&date=${format(d, "yyyy-MM-dd")}&service_id=${service.id}`
    )
    setSlots(await res.json())
  }

  const submit = async (data: FormData) => {
    if (!date || !time) return
    setLoading(true)
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id:       placeId,
          service_id:     service.id,
          customer_name:  data.name,
          customer_phone: data.phone,
          date:           format(date, "yyyy-MM-dd"),
          time,
          payment_mode:   paymentMode,
          notes:          data.notes ?? "",
        }),
      })
      const result = await res.json()
      setBookingId(result.id)

      if (paymentMode === "tranzila" && result.payment_url) {
        window.location.href = result.payment_url
      } else {
        setStep(6)
      }
    } finally {
      setLoading(false)
    }
  }

  const whatsappText = () => {
    const d = date ? format(date, "dd/MM/yyyy", { locale: he }) : ""
    return `שלום ${businessName}, אני רוצה לאשר הזמנה של ${service.name} לתאריך ${d} בשעה ${time}. שמי ${form.getValues("name")}.`
  }

  const back = (s: Step) => () => setStep(s)

  // ── שלב 1: שירות נבחר (תצוגה) ──────────────────────────────
  if (step === 1) return (
    <div dir="rtl" className="space-y-6">
      <div className="p-4 rounded-xl border border-[var(--color-border)] flex justify-between items-center">
        <div>
          <div className="font-bold text-lg">{service.name}</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            ⏱ {service.duration} דקות
          </div>
        </div>
        <div className="font-bold text-xl text-[var(--color-primary)]">
          ₪{service.price.toLocaleString("he-IL")}
        </div>
      </div>
      <button
        onClick={() => setStep(2)}
        className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold"
      >
        בחר תאריך ושעה
      </button>
    </div>
  )

  // ── שלב 2: בחר תאריך ────────────────────────────────────────
  if (step === 2) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={back(1)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h3 className="font-bold text-xl">בחר תאריך</h3>
      <Calendar
        mode="single"
        selected={date ?? undefined}
        onSelect={async d => {
          if (!d) return
          setDate(d)
          await fetchSlots(d)
          setStep(3)
        }}
        disabled={d => d.getDay() === 6 || d < new Date()}
        locale={he}
        className="mx-auto"
      />
    </div>
  )

  // ── שלב 3: בחר שעה ──────────────────────────────────────────
  if (step === 3) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={back(2)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h3 className="font-bold text-xl">בחר שעה</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map(slot => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => { setTime(slot.time); setStep(4) }}
            className={[
              "py-2.5 rounded-xl text-sm font-medium transition-colors",
              slot.available
                ? "border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] line-through cursor-not-allowed",
            ].join(" ")}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  )

  // ── שלב 4: פרטים אישיים ─────────────────────────────────────
  if (step === 4) return (
    <div dir="rtl" className="space-y-4">
      <button onClick={back(3)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h3 className="font-bold text-xl">פרטים אישיים</h3>
      <form onSubmit={form.handleSubmit(() => setStep(5))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם מלא *</label>
          <input {...form.register("name")} className="w-full border rounded-lg px-3 py-2.5" />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">טלפון *</label>
          <input
            type="tel"
            dir="ltr"
            placeholder="0521234567"
            {...form.register("phone")}
            className="w-full border rounded-lg px-3 py-2.5"
          />
          {form.formState.errors.phone && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
          <textarea
            {...form.register("notes")}
            rows={3}
            className="w-full border rounded-lg px-3 py-2.5 resize-none"
          />
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold">
          המשך לסיכום
        </button>
      </form>
    </div>
  )

  // ── שלב 5: סיכום + תשלום ────────────────────────────────────
  if (step === 5) return (
    <div dir="rtl" className="space-y-6">
      <button onClick={back(4)} className="text-sm text-[var(--color-primary)]">← חזור</button>
      <h3 className="font-bold text-xl">סיכום הזמנה</h3>

      <div className="rounded-xl border border-[var(--color-border)] p-4 space-y-2.5">
        <Row label="שירות"  value={service.name} />
        <Row label="תאריך"  value={date ? format(date, "dd/MM/yyyy", { locale: he }) : ""} />
        <Row label="שעה"    value={time ?? ""} />
        <Row label="משך"    value={`${service.duration} דקות`} />
        <hr className="border-[var(--color-border)]" />
        <Row label="לתשלום" value={`₪${service.price.toLocaleString("he-IL")}`} bold />
      </div>

      {paymentMode === "tranzila" ? (
        <button
          onClick={form.handleSubmit(submit)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold disabled:opacity-50"
        >
          {loading ? "מעבד..." : `💳 שלם ₪${service.price.toLocaleString("he-IL")} בטרנזילה`}
        </button>
      ) : (
        <button
          onClick={form.handleSubmit(submit)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "שולח..." : <><span>📱</span> שלח הזמנה ב-WhatsApp</>}
        </button>
      )}
    </div>
  )

  // ── שלב 6: אישור (WhatsApp mode) ────────────────────────────
  if (step === 6) return (
    <div dir="rtl" className="text-center space-y-6 py-8">
      <div className="text-6xl">✅</div>
      <h3 className="text-2xl font-bold">ההזמנה נקלטה!</h3>
      <p className="text-[var(--color-text-muted)]">
        {service.name} · {date ? format(date, "dd/MM/yyyy", { locale: he }) : ""} · {time}
      </p>
      <p>לאישור סופי שלח הודעת WhatsApp לעסק:</p>
      <a
        href={`https://wa.me/${businessPhone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappText())}`}
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-lg" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
```

---

## Next.js Proxy Route

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server"

const API = process.env.API_URL!

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString()
  const res = await fetch(`${API}/api/v1/bookings/slots?${params}`)
  return NextResponse.json(await res.json(), { status: res.status })
}

export async function POST(req: NextRequest) {
  const body   = await req.text()
  const parsed = JSON.parse(body)

  // צור appointment
  const bookingRes = await fetch(`${API}/api/v1/bookings/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  const booking = await bookingRes.json()
  if (!bookingRes.ok) return NextResponse.json(booking, { status: bookingRes.status })

  // אם tranzila — בקש payment URL
  if (parsed.payment_mode === "tranzila" && process.env.TRANZILA_TERMINAL) {
    const payRes = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/payments/tranzila/create-page`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId:     booking.id,
          amount:        parsed.price ?? 0,
          description:   `${parsed.service_name ?? "שירות"} — ${parsed.date} ${parsed.time}`,
          customerName:  parsed.customer_name,
          customerPhone: parsed.customer_phone,
        }),
      }
    )
    const pay = await payRes.json()
    return NextResponse.json({ ...booking, payment_url: pay.payment_url })
  }

  return NextResponse.json(booking)
}
```

---

## Success & Error Pages

```tsx
// app/[locale]/booking/success/page.tsx
export default async function BookingSuccess({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  let appointment = null
  if (searchParams.id) {
    const res = await fetch(`${process.env.API_URL}/api/v1/bookings/${searchParams.id}`)
    if (res.ok) appointment = await res.json()
  }

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">ההזמנה אושרה!</h1>
        {appointment && (
          <div className="rounded-xl border p-4 text-right space-y-2">
            <p><strong>שירות:</strong> {appointment.service_id}</p>
            <p><strong>תאריך:</strong> {appointment.date} בשעה {appointment.time}</p>
            <p><strong>שולם:</strong> ₪{appointment.price}</p>
          </div>
        )}
        <a href="/" className="inline-block mt-4 text-[var(--color-primary)] underline">חזור לדף הבית</a>
      </div>
    </main>
  )
}
```

```tsx
// app/[locale]/booking/error/page.tsx
export default function BookingError({ searchParams }: { searchParams: { bookingId?: string } }) {
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-6xl">❌</div>
        <h1 className="text-3xl font-bold">התשלום נכשל</h1>
        <p className="text-[var(--color-text-muted)]">
          לא חויבת. תוכל לנסות שוב או לפנות אלינו ישירות.
        </p>
        <a href="/services" className="inline-block py-3 px-8 rounded-xl
                                       bg-[var(--color-primary)] text-white font-semibold">
          חזור לשירותים
        </a>
      </div>
    </main>
  )
}
```

---

## שילוב ב-site_generator.py

```python
# ב-build_claude_md() — מוסיף אוטומטית אם יש שירותים:

def detect_booking_needed(arch: SiteArchaeology) -> tuple[bool, str]:
    has_prices = any(s.price for s in arch.services)
    if not arch.services:
        return False, "whatsapp"
    import os
    if os.getenv("TRANZILA_TERMINAL"):
        return True, "tranzila"
    return True, "whatsapp"


# CLAUDE.md template section:
BOOKING_SECTION = """
## SERVICE CATALOG & BOOKING

The business has {n} services requiring online booking.

Use @tottemai/ui/booking:

```tsx
import {{ BookingModule }} from "@tottemai/ui/booking"
// or individual components:
import {{ ServiceCatalog, BookingWidget }} from "@tottemai/ui/booking"
```

Required files to generate:
- app/[locale]/services/page.tsx          ← ServiceCatalog (gallery + table toggle)
- app/[locale]/services/[slug]/page.tsx   ← ServiceDetailPage + BookingWidget
- app/[locale]/booking/success/page.tsx
- app/[locale]/booking/error/page.tsx
- app/api/bookings/route.ts               ← proxy to backend
- app/api/payments/tranzila/create-page/route.ts
- app/api/payments/tranzila/success/route.ts
- app/api/payments/tranzila/webhook/route.ts

Services found:
{services_json}

payment_mode: "{payment_mode}"
"""
```

---

## בדיקות סיום שלב 7

- [ ] `GET /api/v1/services?place_id=X` מחזיר שירותים
- [ ] `GET /api/v1/services/{slug}?place_id=X` מחזיר שירות בודד
- [ ] `/services` — gallery mode מציג ServiceCards
- [ ] ViewToggle — עבר gallery ↔ table
- [ ] לחיצה על ServiceCard → navigate ל-`/services/[slug]`
- [ ] ServiceDetailPage — hero, פרטים, BookingWidget embedded
- [ ] BookingWidget שלב 1→2→3→4→5→6: הכל עובד
- [ ] slots תפוסים disabled
- [ ] שבת חסומה ב-Calendar
- [ ] validation: שם + טלפון (05XXXXXXXX) חובה
- [ ] **Tranzila mode:** לחיצת "שלם" → redirect לטרנזילה
- [ ] **Tranzila success:** `/api/payments/tranzila/success` → `appointment.status=paid`
- [ ] **Tranzila webhook:** פועל גם כשדפדפן נסגר
- [ ] **WhatsApp fallback:** כפתור נפתח עם טקסט מוכן
- [ ] Telegram notification לעסק עם כל הפרטים
- [ ] `/booking/success?id=...` מציג פרטי ההזמנה
- [ ] `/booking/error` מציג הודעה + לחזור לשירותים
- [ ] RTL: הכל dir="rtl", ניווט מימין לשמאל
- [ ] מובייל: כל כפתור 44×44px לפחות
- [ ] `generateMetadata()` בדף שירות (SEO)

→ [[07.1 - Phase 7.1 - Booking Admin Dashboard]]
← [[05 - Phase 5 - Quality Loop & AI Review]]
← [[services/booking]], [[services/tranzila]]
