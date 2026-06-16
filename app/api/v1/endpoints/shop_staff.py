"""Staff user auth, invitation, and management."""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import create_staff_token, get_admin_place_id, get_current_staff, require_roles
from app.core.database import get_session
from app.models.shop_staff import StaffAuditLog, StaffInvitation, StaffUser

router = APIRouter(prefix="/staff", tags=["shop-staff"])

_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_MINUTES = 15


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class InviteRequest(BaseModel):
    email: str
    role: str


class AcceptInviteRequest(BaseModel):
    invitation_id: uuid.UUID
    token: str
    name: str
    password: str


class ResetPasswordRequest(BaseModel):
    email: str
    place_id: str


class ConfirmResetRequest(BaseModel):
    invitation_id: uuid.UUID  # reuse StaffInvitation table for reset tokens
    token: str
    new_password: str


class RoleUpdate(BaseModel):
    role: str


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@router.post("/auth/login")
def login(
    body: LoginRequest,
    session: Session = Depends(get_session),
) -> dict:
    normalized = body.email.lower().strip()
    # We need place_id for login — find by email across places (or require place subdomain)
    staff = session.exec(
        select(StaffUser).where(StaffUser.normalized_email == normalized)
    ).first()
    if not staff:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if staff.locked_until and staff.locked_until > datetime.utcnow():
        raise HTTPException(status_code=403, detail="Account temporarily locked")

    if not staff.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    if not _verify_password(body.password, staff.hashed_password):
        staff.failed_login_attempts += 1
        if staff.failed_login_attempts >= _MAX_FAILED_ATTEMPTS:
            staff.locked_until = datetime.utcnow() + timedelta(minutes=_LOCKOUT_MINUTES)
        session.add(staff)
        session.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    staff.failed_login_attempts = 0
    staff.last_login = datetime.utcnow()
    session.add(staff)
    session.commit()

    token = create_staff_token(staff)
    return {"access_token": token, "token_type": "bearer", "role": staff.role}


# ---------------------------------------------------------------------------
# Invitation flow
# ---------------------------------------------------------------------------

@router.post("/invite", dependencies=[Depends(require_roles("owner"))])
def invite_staff(
    body: InviteRequest,
    place_id: str = Depends(get_admin_place_id),
    staff: StaffUser = Depends(get_current_staff),
    session: Session = Depends(get_session),
) -> dict:
    valid_roles = {"owner", "admin", "manager", "cashier", "viewer"}
    if body.role not in valid_roles:
        raise HTTPException(status_code=422, detail=f"Invalid role: {body.role}")

    secret_token = secrets.token_urlsafe(32)
    invitation = StaffInvitation(
        place_id=place_id,
        email=body.email.lower().strip(),
        role=body.role,
        token_hash=_sha256_hex(secret_token),
        expires_at=datetime.utcnow() + timedelta(hours=48),
        invited_by_staff_id=staff.id,
    )
    session.add(invitation)
    session.commit()
    session.refresh(invitation)

    # Return token for email (in production, send via email service)
    return {
        "invitation_id": str(invitation.id),
        "token": secret_token,  # send this via email
        "expires_at": invitation.expires_at.isoformat(),
    }


@router.post("/accept-invite")
def accept_invite(
    body: AcceptInviteRequest,
    session: Session = Depends(get_session),
) -> dict:
    invitation = session.get(StaffInvitation, body.invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.used_at:
        raise HTTPException(status_code=409, detail="Invitation already used")
    if invitation.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Invitation expired")
    if _sha256_hex(body.token) != invitation.token_hash:
        raise HTTPException(status_code=401, detail="Invalid token")

    normalized_email = invitation.email.lower().strip()
    existing = session.exec(
        select(StaffUser).where(
            StaffUser.place_id == invitation.place_id,
            StaffUser.normalized_email == normalized_email,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    staff = StaffUser(
        place_id=invitation.place_id,
        name=body.name,
        email=invitation.email,
        normalized_email=normalized_email,
        hashed_password=_hash_password(body.password),
        role=invitation.role,
    )
    session.add(staff)
    invitation.used_at = datetime.utcnow()
    session.add(invitation)
    session.commit()
    session.refresh(staff)

    token = create_staff_token(staff)
    return {"access_token": token, "token_type": "bearer", "role": staff.role}


# ---------------------------------------------------------------------------
# Staff management (owner only)
# ---------------------------------------------------------------------------

@router.get("/", dependencies=[Depends(require_roles("owner"))])
def list_staff(
    place_id: str = Depends(get_admin_place_id),
    session: Session = Depends(get_session),
) -> list[dict]:
    users = session.exec(select(StaffUser).where(StaffUser.place_id == place_id)).all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "last_login": u.last_login.isoformat() if u.last_login else None,
        }
        for u in users
    ]


@router.put("/{staff_id}/role", dependencies=[Depends(require_roles("owner"))])
def update_role(
    staff_id: uuid.UUID,
    body: RoleUpdate,
    place_id: str = Depends(get_admin_place_id),
    requester: StaffUser = Depends(get_current_staff),
    session: Session = Depends(get_session),
) -> dict:
    target = session.exec(
        select(StaffUser).where(StaffUser.id == staff_id, StaffUser.place_id == place_id)
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="Staff not found")

    old_role = target.role
    target.role = body.role
    session.add(target)

    session.add(StaffAuditLog(
        place_id=place_id,
        staff_id=requester.id,
        action="role_changed",
        target_id=str(staff_id),
        extra_data={"from": old_role, "to": body.role},
    ))
    session.commit()
    return {"id": str(target.id), "role": target.role}


@router.put("/{staff_id}/disable", dependencies=[Depends(require_roles("owner"))])
def disable_staff(
    staff_id: uuid.UUID,
    place_id: str = Depends(get_admin_place_id),
    requester: StaffUser = Depends(get_current_staff),
    session: Session = Depends(get_session),
) -> dict:
    target = session.exec(
        select(StaffUser).where(StaffUser.id == staff_id, StaffUser.place_id == place_id)
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="Staff not found")

    target.is_active = False
    session.add(target)
    session.add(StaffAuditLog(
        place_id=place_id,
        staff_id=requester.id,
        action="user_disabled",
        target_id=str(staff_id),
        extra_data={},
    ))
    session.commit()
    return {"disabled": True}
