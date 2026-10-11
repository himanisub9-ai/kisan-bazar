from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.categories import router as categories_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.farmers import router as farmers_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "products_router",
    "categories_router",
    "cart_router",
    "orders_router",
    "farmers_router",
    "admin_router",
]
