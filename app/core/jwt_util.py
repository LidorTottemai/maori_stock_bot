"""
Minimal JWT HS256 implementation using Python stdlib only.
No dependency on PyJWT or cryptography package.
"""
import base64
import hashlib
import hmac
import json
import time


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    padding = "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)


def encode(payload: dict, secret: str) -> str:
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = _b64url_encode(json.dumps(payload).encode())
    signing_input = f"{header}.{body}"
    sig = hmac.new(
        secret.encode(),
        signing_input.encode(),
        hashlib.sha256,
    ).digest()
    return f"{signing_input}.{_b64url_encode(sig)}"


def decode(token: str, secret: str) -> dict:
    """Verifies signature and expiry. Raises ValueError on failure."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format")

    header_b64, body_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{body_b64}"

    expected_sig = hmac.new(
        secret.encode(),
        signing_input.encode(),
        hashlib.sha256,
    ).digest()
    actual_sig = _b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid signature")

    payload = json.loads(_b64url_decode(body_b64))
    exp = payload.get("exp")
    if exp and time.time() > exp:
        raise ValueError("Token expired")

    return payload
