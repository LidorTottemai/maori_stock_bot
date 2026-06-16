from fastapi import HTTPException

FULFILLMENT_TRANSITIONS: dict[str, dict[str, set[str]]] = {
    "delivery": {
        "unfulfilled": {"processing"},
        "processing": {"shipped"},
        "shipped": {"fulfilled"},
    },
    "digital": {
        "unfulfilled": {"fulfilled"},
    },
    "pickup": {
        "unfulfilled": {"ready"},
        "ready": {"fulfilled"},
    },
}

CANCELLABLE_FULFILLMENT_STATUSES: set[str] = {"unfulfilled", "processing"}


def validate_fulfillment_transition(order_type: str, current: str, next_status: str) -> None:
    allowed = FULFILLMENT_TRANSITIONS.get(order_type, {}).get(current, set())
    if next_status not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid fulfillment transition: {current} → {next_status} for order_type={order_type}",
        )
