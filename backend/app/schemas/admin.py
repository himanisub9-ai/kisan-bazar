from typing import Optional, List
from pydantic import BaseModel
from app.schemas.auth import UserResponse
from app.schemas.order import OrderResponse
from app.schemas.product import ProductResponse


class AdminDashboardStats(BaseModel):
    total_users: int
    total_farmers: int
    total_consumers: int
    total_products: int
    total_orders: int
    total_sales: float
    pending_orders: int
    completed_orders: int


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
