"""JWT utility tests."""
import time

import pytest

from app.core.jwt_util import decode, encode


def test_encode_decode_roundtrip():
    payload = {"sub": "user-123", "role": "owner", "exp": int(time.time()) + 3600}
    token = encode(payload, "secret")
    decoded = decode(token, "secret")
    assert decoded["sub"] == "user-123"
    assert decoded["role"] == "owner"


def test_wrong_secret_raises():
    token = encode({"sub": "x", "exp": int(time.time()) + 3600}, "secret")
    with pytest.raises(ValueError, match="Invalid signature"):
        decode(token, "wrong-secret")


def test_expired_token_raises():
    token = encode({"sub": "x", "exp": int(time.time()) - 1}, "secret")
    with pytest.raises(ValueError, match="expired"):
        decode(token, "secret")


def test_tampered_payload_raises():
    token = encode({"sub": "x", "exp": int(time.time()) + 3600}, "secret")
    parts = token.split(".")
    # Tamper the body
    import base64, json
    new_body = base64.urlsafe_b64encode(json.dumps({"sub": "admin", "exp": int(time.time()) + 9999}).encode()).rstrip(b"=").decode()
    tampered = f"{parts[0]}.{new_body}.{parts[2]}"
    with pytest.raises(ValueError, match="Invalid signature"):
        decode(tampered, "secret")
