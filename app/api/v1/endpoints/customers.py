"""Customer management — admin CRUD + order history + CSV export."""
import csv
import io
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, func, select

from app.api.deps import get_admin_place_id, require_roles
from app.core.database import get_session
from app.models.shop_customer import Customer
from app.models.shop_order import ShopOrder

router = APIRouter(prefix="/customers", tags=["shop-customers"])


class CustomerUpdate(BaseModel):
    name: str | None = None
    notes: str | None = None
    tags: list[str] | None = None
    marketing_consent: bool | None = None
    address_default: dict | None = None


def _customer_dict(c: Customer) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "marketing_consent": c.marketing_consent,
        "notes": c.notes,
        "tags": c.tags,
        "address_default": c.address_default,
        "created_at": c.created_at.isoformat(),
        "updated_at": c.updated_at.isoformat(),
    }


@router.get("/", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def list_customers(
    search: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    stmt = select(Customer).where(Customer.place_id == place_id)
    if search:
        stmt = stmt.where(
            Customer.name.contains(search)
            | Customer.normalized_email.contains(search)
            | Customer.normalized_phone.contains(search)
        )
    if tag:
        # JSON array contains check — SQLite compatible
        stmt = stmt.where(Customer.tags.contains(tag))
    stmt = stmt.order_by(Customer.created_at.desc()).offset(offset).limit(limit)
    return [_customer_dict(c) for c in session.exec(stmt).all()]


@router.get("/export.csv", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def export_customers_csv(
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> StreamingResponse:
    customers = session.exec(
        select(Customer).where(Customer.place_id == place_id)
        .order_by(Customer.created_at.desc())
    ).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["name", "email", "phone", "marketing_consent", "created_at"])
    for c in customers:
        writer.writerow([
            c.name, c.email or "", c.phone or "",
            "yes" if c.marketing_consent else "no",
            c.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )


@router.get("/{customer_id}", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def get_customer(
    customer_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    customer = session.exec(
        select(Customer).where(Customer.id == customer_id, Customer.place_id == place_id)
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Compute totals from ShopOrder
    orders = session.exec(
        select(ShopOrder).where(
            ShopOrder.place_id == place_id,
            ShopOrder.customer_email == customer.normalized_email,
        )
    ).all()
    total_orders = len(orders)
    total_spent = sum(
        o.total for o in orders if o.payment_status == "paid" and o.order_status != "cancelled"
    )

    return {
        **_customer_dict(customer),
        "total_orders": total_orders,
        "total_spent": str(total_spent),
    }


@router.get("/{customer_id}/orders", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def customer_orders(
    customer_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    customer = session.exec(
        select(Customer).where(Customer.id == customer_id, Customer.place_id == place_id)
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    orders = session.exec(
        select(ShopOrder).where(
            ShopOrder.place_id == place_id,
            ShopOrder.customer_email == customer.normalized_email,
        ).order_by(ShopOrder.created_at.desc()).limit(20)
    ).all()

    return [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "fulfillment_status": o.fulfillment_status,
            "total": str(o.total),
            "created_at": o.created_at.isoformat(),
        }
        for o in orders
    ]


@router.put("/{customer_id}", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def update_customer(
    customer_id: uuid.UUID,
    body: CustomerUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    customer = session.exec(
        select(Customer).where(Customer.id == customer_id, Customer.place_id == place_id)
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(customer, field, value)
    customer.updated_at = datetime.utcnow()
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return _customer_dict(customer)
