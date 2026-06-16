"""Shop analytics — revenue, top products, summary. Admin JWT required."""
from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.api.deps import get_admin_place_id, require_roles
from app.core.database import get_session
from app.models.shop_order import ShopOrder, ShopOrderItem

router = APIRouter(prefix="/shop-analytics", tags=["shop-analytics"])

ALLOWED_ROLES = ("owner", "admin", "manager", "viewer")


@router.get("/summary", dependencies=[Depends(require_roles(*ALLOWED_ROLES))])
def analytics_summary(
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> dict:
    orders = session.exec(
        select(ShopOrder).where(ShopOrder.place_id == place_id)
    ).all()

    total_orders = len(orders)
    paid_orders = [o for o in orders if o.payment_status == "paid" and o.order_status != "cancelled"]
    revenue_net = sum(o.total - (o.tax_amount or Decimal("0")) for o in paid_orders)
    aov = revenue_net / len(paid_orders) if paid_orders else Decimal("0")

    payment_counts: dict[str, int] = {}
    for o in paid_orders:
        payment_counts[o.payment_mode] = payment_counts.get(o.payment_mode, 0) + 1
    top_payment_mode = max(payment_counts, key=lambda k: payment_counts[k]) if payment_counts else None

    return {
        "total_orders": total_orders,
        "paid_orders": len(paid_orders),
        "revenue_net": str(revenue_net.quantize(Decimal("0.01"))),
        "aov": str(aov.quantize(Decimal("0.01"))),
        "top_payment_mode": top_payment_mode,
    }


@router.get("/revenue", dependencies=[Depends(require_roles(*ALLOWED_ROLES))])
def analytics_revenue(
    days: int = Query(default=30, ge=7, le=365),
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    orders = session.exec(
        select(ShopOrder).where(
            ShopOrder.place_id == place_id,
            ShopOrder.payment_status == "paid",
            ShopOrder.order_status != "cancelled",
            ShopOrder.created_at >= since,
        )
    ).all()

    # Bucket by date
    buckets: dict[str, dict] = {}
    for o in orders:
        day = o.created_at.strftime("%Y-%m-%d")
        if day not in buckets:
            buckets[day] = {"date": day, "revenue_net": Decimal("0"), "order_count": 0}
        buckets[day]["revenue_net"] += o.total - (o.tax_amount or Decimal("0"))
        buckets[day]["order_count"] += 1

    # Fill all days in range (including zeros)
    result = []
    for i in range(days):
        day = (since + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        b = buckets.get(day, {"date": day, "revenue_net": Decimal("0"), "order_count": 0})
        result.append({
            "date": b["date"],
            "revenue_net": str(b["revenue_net"].quantize(Decimal("0.01"))),
            "order_count": b["order_count"],
        })
    return result


@router.get("/top-products", dependencies=[Depends(require_roles(*ALLOWED_ROLES))])
def analytics_top_products(
    limit: int = Query(default=10, le=50),
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    # Get paid non-cancelled orders for this place
    paid_order_ids = {
        o.id
        for o in session.exec(
            select(ShopOrder).where(
                ShopOrder.place_id == place_id,
                ShopOrder.payment_status == "paid",
                ShopOrder.order_status != "cancelled",
            )
        ).all()
    }
    if not paid_order_ids:
        return []

    items = session.exec(
        select(ShopOrderItem).where(ShopOrderItem.order_id.in_(paid_order_ids))
    ).all()

    # Aggregate by product_name
    agg: dict[str, dict] = {}
    for item in items:
        key = item.product_name
        if key not in agg:
            agg[key] = {"product_name": key, "total_qty": 0, "total_revenue": Decimal("0")}
        agg[key]["total_qty"] += item.quantity
        agg[key]["total_revenue"] += item.item_total

    sorted_items = sorted(agg.values(), key=lambda x: x["total_revenue"], reverse=True)
    return [
        {
            "product_name": row["product_name"],
            "total_qty": row["total_qty"],
            "total_revenue": str(row["total_revenue"].quantize(Decimal("0.01"))),
        }
        for row in sorted_items[:limit]
    ]
