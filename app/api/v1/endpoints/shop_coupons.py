"""Coupon management — public validate + admin CRUD."""
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_admin_place_id, get_public_place_id, require_roles
from app.core.database import get_session
from app.models.shop_coupon import Coupon, CouponRedemption

router = APIRouter(prefix="/coupons", tags=["shop-coupons"])


class CouponCreate(BaseModel):
    code: str
    discount_type: str  # percent | fixed
    discount_value: Decimal
    min_order: Decimal = Decimal("0")
    max_discount: Decimal | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    max_uses: int | None = None
    per_customer_limit: int | None = None
    applies_to_all_products: bool = True
    applicable_product_ids: list[str] = []
    applicable_category_ids: list[str] = []


class ValidateRequest(BaseModel):
    code: str
    subtotal: Decimal
    customer_email: str = ""


@router.post("/validate")
def validate_coupon(
    body: ValidateRequest,
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> dict:
    coupon = session.exec(
        select(Coupon).where(
            Coupon.place_id == place_id,
            Coupon.code == body.code.upper(),
            Coupon.is_active == True,
        )
    ).first()
    if not coupon:
        raise HTTPException(status_code=422, detail="Invalid coupon code")

    now = datetime.utcnow()
    if coupon.starts_at and coupon.starts_at > now:
        raise HTTPException(status_code=422, detail="Coupon not yet active")
    if coupon.expires_at and coupon.expires_at < now:
        raise HTTPException(status_code=422, detail="Coupon expired")
    if body.subtotal < coupon.min_order:
        raise HTTPException(status_code=422, detail=f"Min order {coupon.min_order} required")

    if coupon.max_uses is not None:
        uses = session.exec(
            select(CouponRedemption).where(
                CouponRedemption.coupon_id == coupon.id,
                CouponRedemption.status != "reversed",
            )
        )
        if len(uses.all()) >= coupon.max_uses:
            raise HTTPException(status_code=422, detail="Coupon usage limit reached")

    if coupon.discount_type == "percent":
        discount = (body.subtotal * coupon.discount_value / 100).quantize(Decimal("0.01"))
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = min(coupon.discount_value, body.subtotal)

    return {
        "valid": True,
        "discount": str(discount),
        "discount_type": coupon.discount_type,
        "discount_value": str(coupon.discount_value),
    }


@router.get("/", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def list_coupons(
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    coupons = session.exec(select(Coupon).where(Coupon.place_id == place_id)).all()
    return [c.model_dump() for c in coupons]


@router.post("/", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def create_coupon(
    body: CouponCreate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    existing = session.exec(
        select(Coupon).where(Coupon.place_id == place_id, Coupon.code == body.code.upper())
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Coupon code already exists")
    coupon = Coupon(place_id=place_id, **{**body.model_dump(), "code": body.code.upper()})
    session.add(coupon)
    session.commit()
    session.refresh(coupon)
    return coupon.model_dump()


@router.put("/{coupon_id}", dependencies=[Depends(require_roles("owner", "admin", "manager"))])
def update_coupon(
    coupon_id: uuid.UUID,
    body: CouponCreate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    coupon = session.exec(
        select(Coupon).where(Coupon.id == coupon_id, Coupon.place_id == place_id)
    ).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for field, value in body.model_dump().items():
        setattr(coupon, field, value)
    session.add(coupon)
    session.commit()
    session.refresh(coupon)
    return coupon.model_dump()


@router.delete("/{coupon_id}", dependencies=[Depends(require_roles("owner", "admin"))])
def delete_coupon(
    coupon_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    coupon = session.exec(
        select(Coupon).where(Coupon.id == coupon_id, Coupon.place_id == place_id)
    ).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.is_active = False
    session.add(coupon)
    session.commit()
    return {"deleted": True}
