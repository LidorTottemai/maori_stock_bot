"""State machine tests — fulfillment transitions."""
import pytest
from fastapi import HTTPException

from app.shop.state_machine import CANCELLABLE_FULFILLMENT_STATUSES, validate_fulfillment_transition


def test_delivery_valid_transitions():
    validate_fulfillment_transition("delivery", "unfulfilled", "processing")
    validate_fulfillment_transition("delivery", "processing", "shipped")
    validate_fulfillment_transition("delivery", "shipped", "fulfilled")


def test_pickup_valid_transitions():
    validate_fulfillment_transition("pickup", "unfulfilled", "ready")
    validate_fulfillment_transition("pickup", "ready", "fulfilled")


def test_digital_valid_transitions():
    validate_fulfillment_transition("digital", "unfulfilled", "fulfilled")


def test_invalid_transition_raises():
    with pytest.raises(HTTPException) as exc:
        validate_fulfillment_transition("delivery", "unfulfilled", "fulfilled")
    assert exc.value.status_code == 422


def test_cannot_go_backwards():
    with pytest.raises(HTTPException):
        validate_fulfillment_transition("delivery", "shipped", "processing")


def test_cancellable_statuses():
    assert "unfulfilled" in CANCELLABLE_FULFILLMENT_STATUSES
    assert "processing" in CANCELLABLE_FULFILLMENT_STATUSES
    assert "shipped" not in CANCELLABLE_FULFILLMENT_STATUSES
    assert "fulfilled" not in CANCELLABLE_FULFILLMENT_STATUSES
