# 🍽 RestaurantService — FastAPI Backend

> **קבצים:**
> - `app/models/dish.py`
> - `app/models/dish_variant_group.py`
> - `app/models/order.py`
> - `app/models/order_item.py`
> - `app/api/v1/endpoints/dishes.py`
> - `app/api/v1/endpoints/orders.py`
> **תלויות:** [[services/tranzila]] [[services/booking]] (patterns)

---

## app/models/dish.py

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text
from datetime import datetime
from uuid import uuid4
import json


class Dish(SQLModel, table=True):
    __tablename__ = "dish"

    id:                str      = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id:          str      = Field(index=True)
    slug:              str      = Field(index=True)
    name:              str
    description:       str      = Field(default="", sa_column=Column(Text))
    price:             float    = 0.0
    category:          str      = ""        # "ראשונות" | "עיקריות" | "קינוחים" | "שתייה"
    image_urls_json:   str      = Field(default="[]", sa_column=Column(Text))
    allergens_json:    str      = Field(default="[]")  # ["gluten","dairy","nuts","sesame","egg"]
    spicy_level:       int      = 0         # 0=לא חריף, 1=קלות, 2=חריף, 3=🌶🌶🌶
    is_vegetarian:     bool     = False
    is_vegan:          bool     = False
    prep_time_minutes: int      = 15
    is_active:         bool     = True
    sort_order:        int      = 0
    created_at:        datetime = Field(default_factory=datetime.utcnow)

    @property
    def image_urls(self) -> list[str]:
        return json.loads(self.image_urls_json)

    @property
    def allergens(self) -> list[str]:
        return json.loads(self.allergens_json)
```

---

## app/models/dish_variant_group.py

```python
from sqlmodel import SQLModel, Field
from uuid import uuid4


class DishVariantGroup(SQLModel, table=True):
    """קבוצת אפשרויות עבור מנה — גודל, תוספות, הסרות."""
    __tablename__ = "dish_variant_group"

    id:             str  = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    dish_id:        str  = Field(foreign_key="dish.id", index=True)
    name:           str                  # "גודל" | "תוספות" | "הסרות" | "רמת בישול"
    selection_type: str                  # ← ראה הסבר למטה
    is_required:    bool = False
    sort_order:     int  = 0

    # selection_type values:
    # "single_required"  — RadioGroup, חייב לבחור אחד (גודל, רמת בישול)
    # "multi_optional"   — CheckboxGroup, אפשר לבחור כמה (תוספות)
    # "remove"           — CheckboxGroup, הסרת רכיבים (ללא בצל)


class DishVariantOption(SQLModel, table=True):
    """אפשרות ספציפית בקבוצה — גדול, פלאפל נוסף, ללא עגבנייה."""
    __tablename__ = "dish_variant_option"

    id:          str   = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    group_id:    str   = Field(foreign_key="dish_variant_group.id", index=True)
    label:       str                  # "גדול", "פלאפל נוסף", "ללא בצל"
    price_delta: float = 0.0          # +10₪ לתוספת, 0 לגודל בסיסי, 0 להסרה
    is_default:  bool  = False
    sort_order:  int   = 0
```

---

## app/models/order.py

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import uuid4


class Order(SQLModel, table=True):
    # "order" הוא reserved word ב-SQL — משתמשים ב-restaurant_order
    __tablename__ = "restaurant_order"

    id:               str       = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    place_id:         str       = Field(index=True)

    # לקוח
    customer_name:    str
    customer_phone:   str                            # "05XXXXXXXX"
    customer_address: str       = ""                 # למשלוח בלבד

    # סוג הזמנה
    order_type:       str                            # "delivery" | "pickup" | "dine_in"
    table_number:     int | None = None              # dine_in בלבד
    estimated_time:   str       = ""                 # "30" (דקות) או "HH:MM"

    # מחירים
    subtotal:         float     = 0.0
    delivery_fee:     float     = 0.0
    total:            float     = 0.0

    # סטטוס
    status:           str       = "pending"
    # pending → confirmed → preparing → ready → completed | cancelled

    # תשלום
    payment_id:       str       = ""                 # TranzilaTK
    payment_mode:     str       = "whatsapp"         # "tranzila" | "whatsapp"

    notes:            str       = ""
    created_at:       datetime  = Field(default_factory=datetime.utcnow)
```

---

## app/models/order_item.py

```python
from sqlmodel import SQLModel, Field
from uuid import uuid4
import json


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_item"

    id:              str   = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    order_id:        str   = Field(foreign_key="restaurant_order.id", index=True)
    dish_id:         str   = Field(foreign_key="dish.id")

    # snapshot — מחיר לא משתנה גם אם הדיש יתעדכן
    dish_name:       str
    dish_price:      float = 0.0

    quantity:        int   = 1
    variants_json:   str   = Field(default="[]")
    # [{"group": "גודל", "option": "גדול", "delta": 10}, ...]
    special_request: str   = ""                     # "ללא בצל"
    item_total:      float = 0.0                    # (dish_price + sum(deltas)) × quantity

    @property
    def variants(self) -> list[dict]:
        return json.loads(self.variants_json)
```

---

## app/api/v1/endpoints/dishes.py

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.dish import Dish
from app.models.dish_variant_group import DishVariantGroup, DishVariantOption
import json

router = APIRouter(prefix="/dishes", tags=["dishes"])


class DishCreate(BaseModel):
    place_id:          str
    slug:              str
    name:              str
    description:       str = ""
    price:             float
    category:          str = ""
    image_urls:        list[str] = []
    allergens:         list[str] = []
    spicy_level:       int  = 0
    is_vegetarian:     bool = False
    is_vegan:          bool = False
    prep_time_minutes: int  = 15
    sort_order:        int  = 0


class VariantOptionSchema(BaseModel):
    label:       str
    price_delta: float = 0.0
    is_default:  bool  = False
    sort_order:  int   = 0


class VariantGroupSchema(BaseModel):
    name:           str
    selection_type: str   # "single_required" | "multi_optional" | "remove"
    is_required:    bool  = False
    sort_order:     int   = 0
    options:        list[VariantOptionSchema] = []


@router.get("/")
def list_dishes(place_id: str, active_only: bool = True, session: Session = Depends(get_session)):
    stmt = select(Dish).where(Dish.place_id == place_id)
    if active_only:
        stmt = stmt.where(Dish.is_active == True)
    stmt = stmt.order_by(Dish.sort_order)
    dishes = session.exec(stmt).all()

    # קבץ לפי קטגוריה
    categories: dict[str, list] = {}
    for d in dishes:
        cat = d.category or "כללי"
        categories.setdefault(cat, []).append({
            "id": d.id, "slug": d.slug, "name": d.name,
            "description": d.description, "price": d.price,
            "category": d.category, "image_urls": d.image_urls,
            "allergens": d.allergens, "spicy_level": d.spicy_level,
            "is_vegetarian": d.is_vegetarian, "is_vegan": d.is_vegan,
            "prep_time_minutes": d.prep_time_minutes,
        })
    return [{"name": k, "dishes": v} for k, v in categories.items()]


@router.get("/{slug}")
def get_dish(slug: str, place_id: str, session: Session = Depends(get_session)):
    dish = session.exec(
        select(Dish).where(Dish.slug == slug, Dish.place_id == place_id)
    ).first()
    if not dish:
        raise HTTPException(404, "Dish not found")

    groups = session.exec(
        select(DishVariantGroup)
        .where(DishVariantGroup.dish_id == dish.id)
        .order_by(DishVariantGroup.sort_order)
    ).all()

    groups_data = []
    for g in groups:
        options = session.exec(
            select(DishVariantOption)
            .where(DishVariantOption.group_id == g.id)
            .order_by(DishVariantOption.sort_order)
        ).all()
        groups_data.append({
            "id": g.id, "name": g.name,
            "selection_type": g.selection_type,
            "is_required": g.is_required,
            "options": [
                {"id": o.id, "label": o.label,
                 "price_delta": o.price_delta, "is_default": o.is_default}
                for o in options
            ],
        })

    return {
        "id": dish.id, "slug": dish.slug, "name": dish.name,
        "description": dish.description, "price": dish.price,
        "category": dish.category, "image_urls": dish.image_urls,
        "allergens": dish.allergens, "spicy_level": dish.spicy_level,
        "is_vegetarian": dish.is_vegetarian, "is_vegan": dish.is_vegan,
        "prep_time_minutes": dish.prep_time_minutes,
        "variant_groups": groups_data,
    }


@router.post("/", status_code=201)
def create_dish(body: DishCreate, session: Session = Depends(get_session)):
    dish = Dish(
        **body.model_dump(exclude={"image_urls", "allergens"}),
        image_urls_json=json.dumps(body.image_urls, ensure_ascii=False),
        allergens_json=json.dumps(body.allergens, ensure_ascii=False),
    )
    session.add(dish)
    session.commit()
    session.refresh(dish)
    return {"id": dish.id}


@router.post("/{dish_id}/variants", status_code=201)
def add_variant_group(dish_id: str, body: VariantGroupSchema, session: Session = Depends(get_session)):
    dish = session.get(Dish, dish_id)
    if not dish:
        raise HTTPException(404)

    group = DishVariantGroup(
        dish_id=dish_id,
        name=body.name,
        selection_type=body.selection_type,
        is_required=body.is_required,
        sort_order=body.sort_order,
    )
    session.add(group)
    session.flush()

    for opt in body.options:
        session.add(DishVariantOption(group_id=group.id, **opt.model_dump()))

    session.commit()
    return {"id": group.id}


@router.put("/{dish_id}")
def update_dish(dish_id: str, body: DishCreate, session: Session = Depends(get_session)):
    dish = session.get(Dish, dish_id)
    if not dish:
        raise HTTPException(404)
    for k, v in body.model_dump(exclude={"image_urls", "allergens"}).items():
        setattr(dish, k, v)
    dish.image_urls_json = json.dumps(body.image_urls, ensure_ascii=False)
    dish.allergens_json  = json.dumps(body.allergens,  ensure_ascii=False)
    session.add(dish)
    session.commit()
    return {"ok": True}


@router.delete("/{dish_id}", status_code=204)
def delete_dish(dish_id: str, session: Session = Depends(get_session)):
    dish = session.get(Dish, dish_id)
    if not dish:
        raise HTTPException(404)
    dish.is_active = False   # soft delete
    session.add(dish)
    session.commit()
```

---

## app/api/v1/endpoints/orders.py

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlmodel import Session, select
from datetime import datetime
from app.core.database import get_session
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.dish import Dish
from app.services.telegram import notify_restaurant
import json, re

router = APIRouter(prefix="/orders", tags=["orders"])


class VariantSelection(BaseModel):
    group: str
    option: str
    delta: float = 0.0


class CartItemBody(BaseModel):
    dish_id:         str
    quantity:        int
    variants:        list[VariantSelection] = []
    special_request: str = ""


class OrderCreate(BaseModel):
    place_id:         str
    customer_name:    str
    customer_phone:   str
    customer_address: str  = ""
    order_type:       str         # "delivery" | "pickup" | "dine_in"
    table_number:     int | None  = None
    items:            list[CartItemBody]
    notes:            str  = ""
    payment_mode:     str  = "whatsapp"

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^05\d{8}$", v):
            raise ValueError("מספר טלפון לא תקין — נדרש פורמט 05XXXXXXXX")
        return v

    @field_validator("order_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("delivery", "pickup", "dine_in"):
            raise ValueError("order_type חייב להיות delivery, pickup, או dine_in")
        return v


class EstimateBody(BaseModel):
    place_id:     str
    order_type:   str
    items_count:  int


@router.post("/", status_code=201)
async def create_order(body: OrderCreate, session: Session = Depends(get_session)):
    subtotal = 0.0
    items_out: list[OrderItem] = []

    for item in body.items:
        dish = session.get(Dish, item.dish_id)
        if not dish or not dish.is_active:
            raise HTTPException(400, f"Dish {item.dish_id} not found or inactive")

        variants_delta = sum(v.delta for v in item.variants)
        item_total = (dish.price + variants_delta) * item.quantity
        subtotal  += item_total

        items_out.append(OrderItem(
            dish_id=dish.id,
            dish_name=dish.name,
            dish_price=dish.price,
            quantity=item.quantity,
            variants_json=json.dumps(
                [v.model_dump() for v in item.variants], ensure_ascii=False
            ),
            special_request=item.special_request,
            item_total=item_total,
        ))

    # delivery fee — flat per place (מוגדר ב-settings, כרגע 15₪ default)
    delivery_fee = 15.0 if body.order_type == "delivery" else 0.0
    total = subtotal + delivery_fee

    order = Order(
        place_id=body.place_id,
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        customer_address=body.customer_address,
        order_type=body.order_type,
        table_number=body.table_number,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        payment_mode=body.payment_mode,
        notes=body.notes,
    )
    session.add(order)
    session.flush()   # order.id נוצר

    for item in items_out:
        item.order_id = order.id
        session.add(item)

    session.commit()
    session.refresh(order)

    await notify_restaurant(order, items_out)

    return {
        "id": order.id,
        "total": total,
        "whatsapp_url": _whatsapp_url(order, items_out),
    }


@router.get("/{order_id}")
def get_order(order_id: str, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    items = session.exec(select(OrderItem).where(OrderItem.order_id == order_id)).all()
    return {**order.model_dump(), "items": [i.model_dump() for i in items]}


@router.post("/{order_id}/confirm")
def confirm_order(order_id: str, payment_id: str, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    order.status     = "confirmed"
    order.payment_id = payment_id
    session.add(order)
    session.commit()
    return {"status": "confirmed"}


@router.put("/{order_id}/status")
def update_status(order_id: str, status: str, session: Session = Depends(get_session)):
    """Admin: עדכון סטטוס הזמנה."""
    valid = {"confirmed", "preparing", "ready", "completed", "cancelled"}
    if status not in valid:
        raise HTTPException(400, f"status חייב להיות אחד מ: {valid}")
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    order.status = status
    session.add(order)
    session.commit()
    return {"status": status}


@router.post("/{order_id}/cancel")
def cancel_order(order_id: str, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(404)
    order.status = "cancelled"
    session.add(order)
    session.commit()
    return {"status": "cancelled"}


@router.get("/admin/{place_id}")
def admin_list_orders(
    place_id: str,
    date: str | None = None,
    status: str | None = None,
    order_type: str | None = None,
    session: Session = Depends(get_session),
):
    stmt = select(Order).where(Order.place_id == place_id)
    if date:
        stmt = stmt.where(Order.created_at >= f"{date} 00:00:00",
                          Order.created_at <= f"{date} 23:59:59")
    if status:
        stmt = stmt.where(Order.status == status)
    if order_type:
        stmt = stmt.where(Order.order_type == order_type)
    stmt = stmt.order_by(Order.created_at.desc())
    return session.exec(stmt).all()


@router.post("/estimate")
def estimate_order(body: EstimateBody):
    """חישוב delivery_fee ו-estimated_time — flat rate לעת עתה."""
    delivery_fee    = 15.0 if body.order_type == "delivery" else 0.0
    estimated_time  = 45   if body.order_type == "delivery" else 20
    return {"delivery_fee": delivery_fee, "estimated_minutes": estimated_time}


# ─── helpers ───────────────────────────────────────────────────────────────

def _whatsapp_url(order: Order, items: list[OrderItem]) -> str:
    lines = [f"הזמנה חדשה #{order.id[:8]}"]
    for item in items:
        variants_str = " + ".join(v["option"] for v in item.variants) if item.variants else ""
        lines.append(f"• {item.dish_name} ×{item.quantity}"
                     + (f" ({variants_str})" if variants_str else "")
                     + (f" — {item.special_request}" if item.special_request else ""))
    lines += [
        f"סה״כ: ₪{order.total:.0f}",
        f"סוג: {order.order_type}",
        order.customer_address or f"שולחן {order.table_number}" or "",
    ]
    text = "\n".join(filter(None, lines))
    return f"https://wa.me/?text={text}"   # frontend יוסיף מספר טלפון העסק
```

---

## Telegram Notification (הרחבה לApp קיים)

```python
# app/services/telegram.py — הוסף לקובץ הקיים

async def notify_restaurant(order, items):
    if not settings.TELEGRAM_BOT_TOKEN:
        return

    type_label = {"delivery": "🚗 משלוח", "pickup": "🏃 איסוף", "dine_in": "🍽 שולחן"}.get(order.order_type, "")
    items_text = "\n".join(
        f"  • {i.dish_name} ×{i.quantity} — ₪{i.item_total:.0f}"
        + (f"\n    {i.special_request}" if i.special_request else "")
        for i in items
    )

    msg = f"""🍽 הזמנה חדשה #{order.id[:8]}

{type_label}
👤 {order.customer_name} | 📞 {order.customer_phone}
{f"📍 {order.customer_address}" if order.customer_address else f"🪑 שולחן {order.table_number}" if order.table_number else ""}

{items_text}

💰 סה״כ: ₪{order.total:.0f}
{f"📝 {order.notes}" if order.notes else ""}"""

    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": settings.TELEGRAM_CHAT_ID, "text": msg},
            timeout=10,
        )
```

---

## עדכון router.py

```python
# app/api/v1/router.py — הוסף:
from app.api.v1.endpoints import dishes, orders

api_router.include_router(dishes.router)
api_router.include_router(orders.router)
```

---

## QR Code Endpoint

```python
# app/api/v1/endpoints/qr.py
from fastapi import APIRouter
from fastapi.responses import Response
import qrcode, io

router = APIRouter(prefix="/qr", tags=["qr"])

@router.get("/{place_id}/{table_number}")
def get_qr(place_id: str, table_number: int, domain: str = ""):
    url = f"https://{domain or place_id}.hhippo.co.il/menu?table={table_number}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")
```
