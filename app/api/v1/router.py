from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, health, leads, rebuild, scanner, telegram_hook
from app.api.v1.endpoints import (
    shop_products,
    shop_orders,
    shop_payments,
    shop_coupons,
    shop_staff,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(leads.router)
api_router.include_router(scanner.router)
api_router.include_router(rebuild.router)
api_router.include_router(telegram_hook.router)
api_router.include_router(dashboard.router)

# Phase 9 — E-commerce (api_router already mounted at /api/v1 in main.py)
api_router.include_router(shop_products.router)
api_router.include_router(shop_orders.router)
api_router.include_router(shop_coupons.router)
api_router.include_router(shop_staff.router)
api_router.include_router(shop_payments.router)
