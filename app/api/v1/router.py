from fastapi import APIRouter

from app.api.v1.endpoints import health, leads, rebuild, scanner

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(leads.router)
api_router.include_router(scanner.router)
api_router.include_router(rebuild.router)
