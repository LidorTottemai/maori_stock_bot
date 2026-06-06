import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.dashboard_user import DashboardUser

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest, session: Session = Depends(get_session)) -> UserResponse:
    if session.exec(select(DashboardUser).where(DashboardUser.username == body.username)).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    user = DashboardUser(
        username=body.username,
        hashed_password=_hash(body.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserResponse(id=user.id, name=user.username)


@router.post("/login", response_model=UserResponse)
def login(body: LoginRequest, session: Session = Depends(get_session)) -> UserResponse:
    user = session.exec(
        select(DashboardUser).where(DashboardUser.username == body.username)
    ).first()
    if not user or not _verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserResponse(id=user.id, name=user.username)
