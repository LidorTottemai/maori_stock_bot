from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, health, leads, rebuild, scanner, telegram_hook

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(leads.router)
api_router.include_router(scanner.router)
api_router.include_router(rebuild.router)
api_router.include_router(telegram_hook.router)
api_router.include_router(dashboard.router)
