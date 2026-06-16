"""FastAPI dependencies for tenant isolation and RBAC."""
import time
from datetime import timedelta

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.database import get_session
from app.core.jwt_util import decode as jwt_decode, encode as jwt_encode
from app.models.site import Site
from app.models.shop_staff import StaffUser

_bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_staff_token(staff: StaffUser) -> str:
    settings = get_settings()
    payload = {
        "sub": str(staff.id),
        "place_id": staff.place_id,
        "role": staff.role,
        "exp": int(time.time()) + int(timedelta(days=settings.jwt_expiry_days).total_seconds()),
    }
    return jwt_encode(payload, settings.jwt_secret)


def _decode_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt_decode(token, settings.jwt_secret)
    except ValueError as exc:
        msg = str(exc)
        if "expired" in msg:
            raise HTTPException(status_code=401, detail="Token expired")
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Public shop dependency — place_id from hostname
# ---------------------------------------------------------------------------

_site_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 60.0  # seconds


def _normalize_hostname(raw: str) -> str:
    return raw.split(":")[0].lower().strip()


async def get_public_place_id(
    request: Request,
    session: Session = Depends(get_session),
) -> str:
    import time

    hostname = _normalize_hostname(request.headers.get("host", ""))
    now = time.monotonic()

    cached = _site_cache.get(hostname)
    if cached and (now - cached[1]) < _CACHE_TTL:
        return cached[0]

    site = session.exec(select(Site).where(Site.hostname == hostname)).first()
    if not site or not site.is_active:
        raise HTTPException(status_code=404, detail=f"No active site for host: {hostname}")

    _site_cache[hostname] = (site.place_id, now)
    return site.place_id


# ---------------------------------------------------------------------------
# Admin dependencies — place_id from JWT
# ---------------------------------------------------------------------------

async def get_current_staff(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: Session = Depends(get_session),
) -> StaffUser:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header required")

    payload = _decode_token(credentials.credentials)
    staff_id = payload.get("sub")

    import uuid as _uuid
    staff = session.exec(
        select(StaffUser).where(StaffUser.id == _uuid.UUID(staff_id))
    ).first()
    if not staff or not staff.is_active:
        raise HTTPException(status_code=401, detail="Staff account inactive or not found")
    if staff.locked_until and staff.locked_until > datetime.utcnow():
        raise HTTPException(status_code=403, detail="Account temporarily locked")

    return staff


async def get_admin_place_id(staff: StaffUser = Depends(get_current_staff)) -> str:
    return staff.place_id


def require_roles(*roles: str):
    async def dep(staff: StaffUser = Depends(get_current_staff)) -> StaffUser:
        if staff.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{staff.role}' is not permitted. Required: {roles}",
            )
        return staff

    return dep
