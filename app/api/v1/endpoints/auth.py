from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.dashboard_user import DashboardUser

router = APIRouter(prefix="/auth", tags=["auth"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    """One-time registration — 409 forever once any user exists."""
    if session.exec(select(DashboardUser)).first():
        raise HTTPException(status_code=409, detail="Admin account already exists")
    user = DashboardUser(
        username=body.username,
        hashed_password=_pwd.hash(body.password),
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
    if not user or not _pwd.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserResponse(id=user.id, name=user.username)
