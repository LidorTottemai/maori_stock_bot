# 💳 TranzilaService — שילוב תשלום ישראלי

> **קובץ:** `app/services/tranzila_service.py`
> **Next.js routes:** `app/api/payments/tranzila/`
> **ENV Demo:** `TRANZILA_TERMINAL=demo` (sandbox מובנה)
> **ראה:** [[07 - Phase 7 - Service Catalog & Booking]]

---

## למה טרנזילה

| קריטריון | טרנזילה |
|---------|--------|
| פופולריות בישראל | גדולה, ותיקה, נפוצה מאוד |
| Hosted page | ✅ — לקוח לא נשאר באתר שלנו |
| PCI-DSS נדרש | ❌ — Tranzila מטפלת |
| Iframe | ✅ |
| Sandbox | ✅ — terminal "0000000" לבדיקות |
| עמלה | ~1.5% |
| שפה | עברית + אנגלית |

---

## ENV Variables

```env
# .env (כל אתר שנבנה)
TRANZILA_TERMINAL=0000000          # demo terminal; החלף בreal
TRANZILA_SUCCESS_PASS=             # אופציונלי — לverification
NEXT_PUBLIC_DOMAIN=https://my-site.com
API_URL=http://localhost:8000
```

---

## Payment Flow

```
לקוח מאשר הזמנה (שלב 5 ב-BookingWidget)
  ↓
POST /api/bookings/                   ← Next.js proxy
  → POST /api/v1/bookings/ (FastAPI)  ← appointment, status=pending
  → POST /api/payments/tranzila/create-page
  → { bookingId, payment_url }
  ↓
redirect → Tranzila hosted page (HTTPS, PCI-DSS)
  ↓
לקוח משלם
  ↓
Tranzila → GET /api/payments/tranzila/success?TranzilaTK=...&bookingId=...
  → POST /api/v1/bookings/{id}/confirm
  → Telegram + WhatsApp notifications
  ↓
redirect → /booking/success?id={bookingId}

גיבוי (דפדפן נסגר):
Tranzila → POST /api/payments/tranzila/webhook
  → POST /api/v1/bookings/{id}/confirm
```

---

## app/services/tranzila_service.py

```python
# app/services/tranzila_service.py
import httpx
import logging
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

TRANZILA_BASE = "https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi"


async def create_payment_url(
    *,
    terminal: str,
    booking_id: str,
    amount: float,
    description: str,
    customer_name: str,
    customer_phone: str,
    success_url: str,
    fail_url: str,
    notify_url: str,
) -> str:
    """
    בונה URL לדף תשלום מאובטח של Tranzila.
    לקוח מועבר לשם — לא נדרש PCI-DSS מצדנו.
    """
    params = {
        "supplier":        terminal,
        "TranzilaPD":      description[:50],
        "sum":             f"{amount:.2f}",
        "cred_type":       "1",       # Visa/Mastercard
        "currency":        "1",       # ₪ שקל
        "lang":            "he",
        "contact":         customer_name,
        "phone":           customer_phone.replace("-", ""),
        "tranmode":        "A",       # Authorization + capture
        "SuccessURL":      success_url,
        "FailURL":         fail_url,
        "notify_url_address": notify_url,
        "myid":            booking_id,   # נחזיר בcallback
        "nologo":          "1",
    }
    return f"{TRANZILA_BASE}?{urlencode(params)}"


async def verify_transaction(terminal: str, tranzila_tk: str) -> bool:
    """
    מאמת שה-TranzilaTK תקין — שואל את Tranzila.
    מחזיר True אם התשלום אושר.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi",
                params={
                    "supplier":    terminal,
                    "TranzilaTK":  tranzila_tk,
                    "tranmode":    "V",   # Verify
                },
            )
            text = resp.text
            # Tranzila מחזירה "Response=000" להצלחה
            return "Response=000" in text or "Response=00" in text
    except Exception as e:
        logger.error(f"Tranzila verify failed: {e}")
        return False
```

---

## Next.js API Routes

### create-page — יצירת דף תשלום

```typescript
// app/api/payments/tranzila/create-page/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  bookingId:     z.string().uuid(),
  amount:        z.number().positive(),
  description:   z.string().min(2).max(50),
  customerName:  z.string().min(2),
  customerPhone: z.string().regex(/^05\d{8}$/, "טלפון לא תקין"),
})

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { bookingId, amount, description, customerName, customerPhone } = parsed.data
  const terminal = process.env.TRANZILA_TERMINAL

  if (!terminal) {
    // fallback — אין Tranzila, WhatsApp mode
    return NextResponse.json({ payment_url: null, fallback: "whatsapp" })
  }

  const base = process.env.NEXT_PUBLIC_DOMAIN!
  const params = new URLSearchParams({
    supplier:            terminal,
    TranzilaPD:          description.slice(0, 50),
    sum:                 amount.toFixed(2),
    cred_type:           "1",
    currency:            "1",
    lang:                "he",
    contact:             customerName,
    phone:               customerPhone.replace(/-/g, ""),
    tranmode:            "A",
    SuccessURL:          `${base}/api/payments/tranzila/success?bookingId=${bookingId}`,
    FailURL:             `${base}/booking/error?bookingId=${bookingId}`,
    notify_url_address:  `${base}/api/payments/tranzila/webhook`,
    myid:                bookingId,
    nologo:              "1",
  })

  const payment_url = `https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?${params}`
  return NextResponse.json({ payment_url })
}
```

### success — אחרי תשלום מוצלח

```typescript
// app/api/payments/tranzila/success/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const bookingId   = req.nextUrl.searchParams.get("bookingId")
  const tranzilaTK  = req.nextUrl.searchParams.get("TranzilaTK")
  const base        = process.env.NEXT_PUBLIC_DOMAIN!
  const api         = process.env.API_URL!

  if (!bookingId || !tranzilaTK) {
    return NextResponse.redirect(`${base}/booking/error`)
  }

  // אשר ב-backend
  await fetch(`${api}/api/v1/bookings/${bookingId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_id: tranzilaTK }),
  })

  return NextResponse.redirect(`${base}/booking/success?id=${bookingId}`)
}
```

### webhook — גיבוי (דפדפן סגור)

```typescript
// app/api/payments/tranzila/webhook/route.ts
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body       = await req.formData()
  const bookingId  = body.get("myid") as string
  const tranzilaTK = body.get("TranzilaTK") as string
  const response   = body.get("Response") as string   // "000" = success
  const api        = process.env.API_URL!

  if ((response === "000" || response === "00") && bookingId && tranzilaTK) {
    await fetch(`${api}/api/v1/bookings/${bookingId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: tranzilaTK }),
    })
  }

  return new Response("OK", { status: 200 })
}
```

---

## WhatsApp Fallback

כשאין `TRANZILA_TERMINAL` בenv — BookingWidget עובר למצב WhatsApp:

```typescript
// ב-BookingWidget, שלב 5
const paymentMode = bookingData.payment_url ? "tranzila" : "whatsapp"

if (paymentMode === "whatsapp") {
  const text = `שלום, אני רוצה להזמין ${service.name} לתאריך ${date} בשעה ${time}. שמי ${name}.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank")
}
```

---

## Error Handling

| שגיאה | פעולה |
|-------|-------|
| Tranzila לא זמינה (timeout) | fallback WhatsApp + log |
| Response ≠ 000 | redirect לbooking/error |
| bookingId חסר בcallback | redirect לbooking/error |
| webhook duplicate | `confirm` idempotent — status=paid לא משתנה שוב |

---

## Sandbox Testing

```
Terminal Demo: 0000000
כרטיס בדיקה:  4580 0000 0000 0000
תוקף:          12/28
CVV:           123
Expected:      Response=000 (success)
```

← [[07 - Phase 7 - Service Catalog & Booking]]
← [[services/booking]]
