"""Shop orders — public creation and admin management."""
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_admin_place_id, get_public_place_id, require_roles
from app.core.config import get_settings
from app.core.database import get_session
from app.models.shop_coupon import Coupon, CouponRedemption
from app.models.shop_order import ShopOrder, ShopOrderItem
from app.models.shop_product import Product
from app.models.shop_product_variant import ProductVariantSku
from app.models.shop_staff import StaffUser
from app.services.inventory_service import reserve_items, release_active_reservations
from app.services.refund_service import cancel_and_refund
from app.shop.state_machine import validate_fulfillment_transition

router = APIRouter(prefix="/shop-orders", tags=["shop-orders"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CartItem(BaseModel):
    product_id: uuid.UUID
    variant_sku_id: uuid.UUID | None = None
    addon_selections: dict = {}
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: dict | None = None
    order_type: str  # delivery | pickup | digital
    payment_mode: str  # tranzila | whatsapp | cash
    coupon_code: str | None = None
    notes: str | None = None
    items: list[CartItem]


class EstimateRequest(BaseModel):
    items: list[CartItem]
    coupon_code: str | None = None
    order_type: str = "delivery"


class FulfillmentUpdate(BaseModel):
    fulfillment_status: str


class CancelRequest(BaseModel):
    reason: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_order_number(session: Session, place_id: str) -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    count = len(session.exec(
        select(ShopOrder).where(
            ShopOrder.place_id == place_id,
            ShopOrder.order_number.startswith(f"ORD-{date_str}-"),
        )
    ).all())
    return f"ORD-{date_str}-{count + 1:04d}"


def _resolve_item(session: Session, place_id: str, cart_item: CartItem):
    product = session.exec(
        select(Product).where(
            Product.id == cart_item.product_id,
            Product.place_id == place_id,
            Product.is_active == True,
            Product.deleted_at.is_(None),
        )
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product not found: {cart_item.product_id}")

    unit_price = product.price
    sku = None
    if cart_item.variant_sku_id:
        sku = session.get(ProductVariantSku, cart_item.variant_sku_id)
        if sku and sku.price_override is not None:
            unit_price = sku.price_override

    item_total = unit_price * cart_item.quantity
    return ShopOrderItem(
        order_id=uuid.uuid4(),  # placeholder, set after order creation
        product_id=product.id,
        product_name=product.name,
        product_sku=sku.sku if sku else product.sku,
        product_type=product.product_type,
        unit_price=unit_price,
        variant_sku_id=cart_item.variant_sku_id,
        variant_sku_snapshot={},
        addon_selections=cart_item.addon_selections,
        quantity=cart_item.quantity,
        item_total=item_total,
    ), product


def _apply_coupon(
    session: Session,
    place_id: str,
    code: str,
    subtotal: Decimal,
    customer_identifier: str,
) -> tuple[Coupon, Decimal]:
    """Returns (coupon, discount_amount). Raises HTTPException on invalid."""
    coupon = session.exec(
        select(Coupon).where(
            Coupon.place_id == place_id,
            Coupon.code == code.upper(),
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
    if subtotal < coupon.min_order:
        raise HTTPException(
            status_code=422,
            detail=f"Minimum order {coupon.min_order} required for this coupon",
        )

    if coupon.max_uses is not None:
        uses = len(session.exec(
            select(CouponRedemption).where(
                CouponRedemption.coupon_id == coupon.id,
                CouponRedemption.status != "reversed",
            )
        ).all())
        if uses >= coupon.max_uses:
            raise HTTPException(status_code=422, detail="Coupon usage limit reached")

    if coupon.per_customer_limit is not None and customer_identifier:
        customer_uses = len(session.exec(
            select(CouponRedemption).where(
                CouponRedemption.coupon_id == coupon.id,
                CouponRedemption.customer_identifier == customer_identifier,
                CouponRedemption.status != "reversed",
            )
        ).all())
        if customer_uses >= coupon.per_customer_limit:
            raise HTTPException(status_code=422, detail="Coupon limit per customer reached")

    if coupon.discount_type == "percent":
        discount = (subtotal * coupon.discount_value / 100).quantize(Decimal("0.01"))
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = min(coupon.discount_value, subtotal)

    return coupon, discount


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.post("/estimate")
def estimate_order(
    body: EstimateRequest,
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> dict:
    """Server-authoritative price estimate. Browser must show THIS total at checkout."""
    subtotal = Decimal("0")
    for ci in body.items:
        _, product = _resolve_item(session, place_id, ci)
        price = product.price
        if ci.variant_sku_id:
            sku = session.get(ProductVariantSku, ci.variant_sku_id)
            if sku and sku.price_override is not None:
                price = sku.price_override
        subtotal += price * ci.quantity

    discount = Decimal("0")
    coupon_info = None
    if body.coupon_code:
        coupon, discount = _apply_coupon(session, place_id, body.coupon_code, subtotal, "")
        coupon_info = {"code": coupon.code, "discount": str(discount)}

    shipping_fee = Decimal("0")
    if body.order_type == "delivery":
        shipping_fee = Decimal("0")  # TODO: shipping zones

    total = subtotal - discount + shipping_fee
    return {
        "subtotal": str(subtotal),
        "discount": str(discount),
        "shipping_fee": str(shipping_fee),
        "total": str(total),
        "coupon": coupon_info,
    }


@router.post("/")
def create_order(
    body: OrderCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> dict:
    """
    Create order with inventory reservation.
    Idempotency-Key header prevents double-submit.
    """
    settings = get_settings()
    checkout_key = idempotency_key or str(uuid.uuid4())

    # Idempotency check
    existing = session.exec(
        select(ShopOrder).where(
            ShopOrder.place_id == place_id,
            ShopOrder.checkout_idempotency_key == checkout_key,
        )
    ).first()
    if existing:
        return existing.model_dump()

    if not body.items:
        raise HTTPException(status_code=422, detail="Order must have at least one item")

    # Build items and compute totals
    order_items: list[ShopOrderItem] = []
    subtotal = Decimal("0")
    for ci in body.items:
        item, _ = _resolve_item(session, place_id, ci)
        subtotal += item.item_total
        order_items.append(item)

    discount = Decimal("0")
    coupon: Coupon | None = None
    if body.coupon_code:
        coupon, discount = _apply_coupon(
            session, place_id, body.coupon_code, subtotal, body.customer_email
        )

    shipping_fee = Decimal("0")
    if body.order_type == "delivery":
        shipping_fee = Decimal("0")  # TODO: shipping zones

    tax_rate = Decimal(settings.shop_default_tax_rate)
    prices_include_tax = True
    # Tax component (included in price, for reporting only)
    tax_amount = (subtotal * tax_rate / (1 + tax_rate)).quantize(Decimal("0.01"))
    total = subtotal - discount + shipping_fee

    order = ShopOrder(
        place_id=place_id,
        order_number=_generate_order_number(session, place_id),
        customer_name=body.customer_name,
        customer_email=body.customer_email,
        customer_phone=body.customer_phone,
        shipping_address=body.shipping_address,
        order_type=body.order_type,
        payment_mode=body.payment_mode,
        coupon_code=body.coupon_code,
        notes=body.notes,
        subtotal=subtotal,
        discount=discount,
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        prices_include_tax=prices_include_tax,
        tax_rate=tax_rate,
        total=total,
        checkout_idempotency_key=checkout_key,
    )
    session.add(order)
    session.flush()  # Get order.id

    # Assign order_id to items
    for item in order_items:
        item.order_id = order.id
        session.add(item)

    # Atomic inventory reservation
    reserve_items(session, order, order_items)

    # Reserve coupon redemption
    if coupon:
        session.add(CouponRedemption(
            place_id=place_id,
            coupon_id=coupon.id,
            order_id=order.id,
            customer_identifier=body.customer_email,
            discount_amount=discount,
            status="reserved",
        ))

    session.commit()
    session.refresh(order)
    return order.model_dump()


@router.get("/track/{token}")
def track_order(
    token: str,
    place_id: str = Depends(get_public_place_id),
    session: Session = Depends(get_session),
) -> dict:
    """Public tracking — minimal DTO, no PII."""
    order = session.exec(
        select(ShopOrder).where(
            ShopOrder.public_tracking_token == token,
            ShopOrder.place_id == place_id,
        )
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = session.exec(
        select(ShopOrderItem).where(ShopOrderItem.order_id == order.id)
    ).all()

    return {
        "order_number": order.order_number,
        "order_status": order.order_status,
        "payment_status": order.payment_status,
        "fulfillment_status": order.fulfillment_status,
        "order_type": order.order_type,
        "tracking_number": order.tracking_number,
        "created_at": order.created_at.isoformat(),
        "items": [
            {
                "product_name": i.product_name,
                "quantity": i.quantity,
                "item_total": str(i.item_total),
            }
            for i in items
        ],
    }


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.get("/admin/", dependencies=[Depends(require_roles("owner", "admin", "manager", "cashier", "viewer"))])
def list_orders(
    order_status: str | None = Query(default=None),
    payment_status: str | None = Query(default=None),
    fulfillment_status: str | None = Query(default=None),
    order_type: str | None = Query(default=None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    stmt = select(ShopOrder).where(ShopOrder.place_id == place_id)
    if order_status:
        stmt = stmt.where(ShopOrder.order_status == order_status)
    if payment_status:
        stmt = stmt.where(ShopOrder.payment_status == payment_status)
    if fulfillment_status:
        stmt = stmt.where(ShopOrder.fulfillment_status == fulfillment_status)
    if order_type:
        stmt = stmt.where(ShopOrder.order_type == order_type)
    stmt = stmt.order_by(ShopOrder.created_at.desc()).offset(offset).limit(limit)
    return [o.model_dump() for o in session.exec(stmt).all()]


@router.put("/{order_id}/fulfillment", dependencies=[Depends(require_roles("owner", "admin", "manager", "cashier"))])
def update_fulfillment(
    order_id: uuid.UUID,
    body: FulfillmentUpdate,
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    order = session.exec(
        select(ShopOrder).where(ShopOrder.id == order_id, ShopOrder.place_id == place_id)
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    validate_fulfillment_transition(order.order_type, order.fulfillment_status, body.fulfillment_status)
    order.fulfillment_status = body.fulfillment_status
    order.updated_at = datetime.utcnow()

    if body.fulfillment_status == "fulfilled":
        order.order_status = "completed"

    session.add(order)
    session.commit()
    session.refresh(order)
    return order.model_dump()


@router.post("/{order_id}/cancel", dependencies=[Depends(require_roles("owner", "admin"))])
async def cancel_order(
    order_id: uuid.UUID,
    body: CancelRequest,
    place_id: str = Depends(get_admin_place_id),
    staff: StaffUser = Depends(require_roles("owner", "admin")),
    session: Session = Depends(get_session),
) -> dict:
    from app.services.refund_service import RefundError

    order = session.exec(
        select(ShopOrder).where(ShopOrder.id == order_id, ShopOrder.place_id == place_id)
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "pending":
        # Pre-payment cancellation — just release reservations
        release_active_reservations(session, order.id)
        order.order_status = "cancelled"
        order.payment_status = "failed"
        order.cancelled_at = datetime.utcnow()
        order.cancellation_reason = body.reason
        session.add(order)
        session.commit()
        return {"cancelled": True, "refund_status": None}

    if order.payment_status == "paid":
        try:
            refund_attempt = await cancel_and_refund(
                order_id=order_id,
                reason=body.reason,
                staff_id=staff.id,
                place_id=place_id,
                session=session,
            )
            return {
                "cancelled": refund_attempt.status == "succeeded",
                "refund_status": refund_attempt.status,
                "refund_id": str(refund_attempt.id),
            }
        except RefundError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    raise HTTPException(status_code=422, detail=f"Cannot cancel order with payment_status={order.payment_status}")
