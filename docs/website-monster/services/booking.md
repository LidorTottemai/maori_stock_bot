# 📅 BookingService — FastAPI Backend

> **קבצים:**
> - `app/models/service.py`
> - `app/models/appointment.py`
> - `app/api/v1/endpoints/services.py`
> - `app/api/v1/endpoints/bookings.py`
> **ראה:** [[07 - Phase 7 - Service Catalog & Booking]], [[services/tranzila]]

---

## app/models/service.py

```python
# app/models/service.py
import json
from datetime import datetime
from uuid import uuid4
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import Text


class Service(SQLModel, table=True):
    __tablename__ = "service"

    id:               str      = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id:         str      = Field(index=True)
    slug:             str      = Field(index=True)          # unique per place_id
    name:             str
    description:      str      = Field(default="", sa_column=Column(Text))
    duration:         int      = 60                         # דקות
    price:            float    = 0.0                        # ₪
    category:         str      = ""
    image_urls_json:  str      = Field(default="[]", sa_column=Column(Text))
    is_active:        bool     = True
    sort_order:       int      = 0
    created_at:       datetime = Field(default_factory=datetime.utcnow)

    @property
    def image_urls(self) -> list[str]:
        return json.loads(self.image_urls_json)

    @property
    def slug_key(self) -> str:
        """slug ייחודי: place_id + slug"""
        return f"{self.place_id}:{self.slug}"
```

---

## app/models/appointment.py

```python
# app/models/appointment.py
from datetime import datetime
from uuid import uuid4
from sqlmodel import Field, SQLModel


class Appointment(SQLModel, table=True):
    __tablename__ = "appointment"

    id:             str      = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id:       str      = Field(index=True)
    service_id:     str      = Field(index=True, foreign_key="service.id")
    customer_name:  str
    customer_phone: str                                    # "05X-XXXXXXX" / "05XXXXXXXX"
    date:           str                                    # "YYYY-MM-DD"
    time:           str                                    # "HH:MM"
    duration:       int      = 60                         # דקות
    price:          float    = 0.0                        # ₪
    status:         str      = "pending"                  # pending/confirmed/paid/cancelled
    payment_id:     str      = ""                         # TranzilaTK
    payment_mode:   str      = "whatsapp"                 # "tranzila" | "whatsapp"
    notes:          str      = ""
    created_at:     datetime = Field(default_factory=datetime.utcnow)
```

---

## app/api/v1/endpoints/services.py

```python
# app/api/v1/endpoints/services.py
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.service import Service

router = APIRouter(prefix="/services", tags=["services"])


class ServiceCreate(BaseModel):
    place_id:    str
    name:        str
    description: str = ""
    duration:    int = 60
    price:       float = 0.0
    category:    str = ""
    image_urls:  list[str] = []
    sort_order:  int = 0


class ServiceUpdate(BaseModel):
    name:        str | None = None
    description: str | None = None
    duration:    int | None = None
    price:       float | None = None
    category:    str | None = None
    image_urls:  list[str] | None = None
    is_active:   bool | None = None
    sort_order:  int | None = None


def _slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"[^\w\-]", "", s, flags=re.UNICODE)
    return s[:80]


@router.get("/")
def list_services(place_id: str, session: Session = Depends(get_session)) -> list[Service]:
    return list(session.exec(
        select(Service)
        .where(Service.place_id == place_id, Service.is_active == True)
        .order_by(Service.sort_order, Service.created_at)
    ).all())


@router.get("/{slug}")
def get_service(slug: str, place_id: str, session: Session = Depends(get_session)) -> Service:
    svc = session.exec(
        select(Service).where(Service.place_id == place_id, Service.slug == slug)
    ).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return svc


@router.post("/", status_code=201)
def create_service(body: ServiceCreate, session: Session = Depends(get_session)) -> Service:
    import json
    slug = _slugify(body.name)
    # unique slug per place_id
    existing = session.exec(
        select(Service).where(Service.place_id == body.place_id, Service.slug == slug)
    ).first()
    if existing:
        slug = f"{slug}-{str(__import__('uuid').uuid4())[:4]}"

    svc = Service(
        place_id=body.place_id,
        slug=slug,
        name=body.name,
        description=body.description,
        duration=body.duration,
        price=body.price,
        category=body.category,
        image_urls_json=json.dumps(body.image_urls),
        sort_order=body.sort_order,
    )
    session.add(svc)
    session.commit()
    session.refresh(svc)
    return svc


@router.put("/{service_id}")
def update_service(
    service_id: str,
    body: ServiceUpdate,
    session: Session = Depends(get_session),
) -> Service:
    import json
    svc = session.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    if body.name        is not None: svc.name        = body.name
    if body.description is not None: svc.description = body.description
    if body.duration    is not None: svc.duration    = body.duration
    if body.price       is not None: svc.price       = body.price
    if body.category    is not None: svc.category    = body.category
    if body.image_urls  is not None: svc.image_urls_json = json.dumps(body.image_urls)
    if body.is_active   is not None: svc.is_active   = body.is_active
    if body.sort_order  is not None: svc.sort_order  = body.sort_order

    session.add(svc)
    session.commit()
    session.refresh(svc)
    return svc


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: str, session: Session = Depends(get_session)) -> None:
    svc = session.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    session.delete(svc)
    session.commit()
```

---

## app/api/v1/endpoints/bookings.py

```python
# app/api/v1/endpoints/bookings.py
from datetime import datetime, date as date_type
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.appointment import Appointment
from app.models.service import Service
from app.services.telegram import notify_business

router = APIRouter(prefix="/bookings", tags=["bookings"])

# ── Helpers ──────────────────────────────────────────────────────

def _generate_slots(start: str, end: str, step_minutes: int = 30) -> list[str]:
    """מייצר רשימת slots: "09:00", "09:30", ..., עד end (לא כולל)."""
    slots = []
    h, m = map(int, start.split(":"))
    eh, em = map(int, end.split(":"))
    while (h, m) < (eh, em):
        slots.append(f"{h:02d}:{m:02d}")
        m += step_minutes
        if m >= 60:
            h += 1
            m -= 60
    return slots


# ── Schemas ───────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    place_id:       str
    service_id:     str
    customer_name:  str
    customer_phone: str
    date:           str           # "YYYY-MM-DD"
    time:           str           # "HH:MM"
    payment_mode:   str = "whatsapp"
    notes:          str = ""

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        import re
        if not re.match(r"^05\d{8}$", v.replace("-", "").replace(" ", "")):
            raise ValueError("מספר טלפון לא תקין — נדרש 05XXXXXXXX")
        return v.replace("-", "").replace(" ", "")


class ConfirmBody(BaseModel):
    payment_id: str


class SlotResponse(BaseModel):
    time:      str
    available: bool


# ── Endpoints ─────────────────────────────────────────────────────

@router.get("/slots", response_model=list[SlotResponse])
def get_slots(
    place_id:   str,
    date:       str,
    service_id: str,
    session:    Session = Depends(get_session),
) -> list[SlotResponse]:
    """מחזיר slots פנויים לתאריך ולשירות."""
    svc = session.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    # כל הזמנות קיימות לאותו יום ועסק
    booked = session.exec(
        select(Appointment).where(
            Appointment.place_id == place_id,
            Appointment.date == date,
            Appointment.status != "cancelled",
        )
    ).all()
    booked_times = {a.time for a in booked}

    all_slots = _generate_slots(start="09:00", end="18:00", step_minutes=30)
    return [
        SlotResponse(time=t, available=(t not in booked_times))
        for t in all_slots
    ]


@router.post("/", status_code=201)
async def create_appointment(
    body:    AppointmentCreate,
    session: Session = Depends(get_session),
) -> dict:
    svc = session.get(Service, body.service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    appt = Appointment(
        place_id=body.place_id,
        service_id=body.service_id,
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        date=body.date,
        time=body.time,
        duration=svc.duration,
        price=svc.price,
        payment_mode=body.payment_mode,
        notes=body.notes,
    )
    session.add(appt)
    session.commit()
    session.refresh(appt)

    # Telegram notification לעסק
    await notify_business(appt, emoji="📅")

    whatsapp_text = (
        f"שלום, אני רוצה לאשר הזמנה: {svc.name} "
        f"ל-{body.date} בשעה {body.time}. שמי {body.customer_name}."
    )
    whatsapp_url = (
        f"https://wa.me/{body.customer_phone}"
        f"?text={__import__('urllib.parse', fromlist=['quote']).parse.quote(whatsapp_text)}"
    )

    return {"id": appt.id, "whatsapp_url": whatsapp_url}


@router.get("/{appointment_id}")
def get_appointment(
    appointment_id: str,
    session: Session = Depends(get_session),
) -> Appointment:
    appt = session.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.post("/{appointment_id}/confirm")
async def confirm_appointment(
    appointment_id: str,
    body:           ConfirmBody,
    session:        Session = Depends(get_session),
) -> dict:
    appt = session.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appt.status == "paid":
        return {"status": "paid"}   # idempotent

    appt.status     = "paid"
    appt.payment_id = body.payment_id
    session.add(appt)
    session.commit()

    await notify_business(appt, emoji="💳")
    return {"status": "paid"}


@router.post("/{appointment_id}/cancel", status_code=200)
def cancel_appointment(
    appointment_id: str,
    session:        Session = Depends(get_session),
) -> dict:
    appt = session.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = "cancelled"
    session.add(appt)
    session.commit()
    return {"status": "cancelled"}


@router.get("/admin/{place_id}")
def admin_list_appointments(
    place_id:   str,
    date_from:  str | None = None,
    date_to:    str | None = None,
    status:     str | None = None,
    session:    Session    = Depends(get_session),
) -> list[Appointment]:
    q = select(Appointment).where(Appointment.place_id == place_id)
    if date_from:
        q = q.where(Appointment.date >= date_from)
    if date_to:
        q = q.where(Appointment.date <= date_to)
    if status:
        q = q.where(Appointment.status == status)
    q = q.order_by(Appointment.date, Appointment.time)
    return list(session.exec(q).all())
```

---

## app/api/v1/router.py — עדכון

```python
# הוסף לrouter.py הקיים:
from app.api.v1.endpoints import services, bookings

api_router.include_router(services.router)
api_router.include_router(bookings.router)
```

---

## app/services/telegram.py — notify_business

```python
# app/services/telegram.py (עדכון)
import httpx
from app.core.config import settings


async def notify_business(appointment, emoji: str = "📅") -> None:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        return

    msg = (
        f"{emoji} הזמנה — {appointment.place_id}\n\n"
        f"👤 {appointment.customer_name} | 📞 {appointment.customer_phone}\n"
        f"📅 {appointment.date} בשעה {appointment.time}\n"
        f"⏱ {appointment.duration} דקות\n"
        f"💰 ₪{appointment.price:,.0f}\n"
        f"🔑 #{appointment.id[:8]}"
    )
    if appointment.notes:
        msg += f"\n📝 {appointment.notes}"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": settings.TELEGRAM_CHAT_ID, "text": msg},
            )
    except Exception:
        pass   # notification failure never blocks the booking flow
```

---

## Working Hours Config

שעות עבודה נשמרות כ-JSON ב-`lead.findings_json` (interim) עד שנוסיף model נפרד:

```python
# מבנה שעות עבודה (per place_id)
working_hours = {
    "0": {"open": False, "from": "09:00", "to": "18:00"},  # ראשון
    "1": {"open": True,  "from": "09:00", "to": "18:00"},  # שני
    "2": {"open": True,  "from": "09:00", "to": "18:00"},
    "3": {"open": True,  "from": "09:00", "to": "18:00"},
    "4": {"open": True,  "from": "09:00", "to": "18:00"},
    "5": {"open": True,  "from": "09:00", "to": "14:00"},  # שישי
    "6": {"open": False, "from": "09:00", "to": "18:00"},  # שבת
}
blocked_dates = ["2026-09-22", "2026-09-23"]   # ימי חג
```

`get_slots()` יבדוק `working_hours[weekday].open` ו-`blocked_dates` לפני החזרת slots.

← [[07 - Phase 7 - Service Catalog & Booking]]
← [[07.1 - Phase 7.1 - Booking Admin Dashboard]]
← [[services/tranzila]]
