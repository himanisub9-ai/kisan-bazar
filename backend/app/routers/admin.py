from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.dependencies.db import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.schemas.auth import UserResponse
from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse
from app.schemas.admin import AdminDashboardStats, AdminUserUpdate
from app.services.product_service import ProductService
from app.services.order_service import OrderService

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard_metrics(db: Session = Depends(get_db)):
    """Retrieve platform-wide aggregated metrics and statistics."""
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_consumers = db.query(User).filter(User.role == "consumer").count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()

    # Total sales sum excluding cancelled
    orders = db.query(Order).filter(Order.order_status != "Cancelled").all()
    total_sales = round(sum(o.total_amount for o in orders), 2)

    all_orders = db.query(Order).all()
    pending_orders = sum(1 for o in all_orders if o.order_status in ["Pending", "Confirmed", "Packed", "Shipped"])
    completed_orders = sum(1 for o in all_orders if o.order_status == "Delivered")

    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_consumers": total_consumers,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
    }


@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    role: Optional[str] = Query(None, description="Filter by role: consumer, farmer, admin"),
    db: Session = Depends(get_db),
):
    """List all platform users with optional role filtering."""
    query = db.query(User).options(joinedload(User.farmer_profile))
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
):
    """Enable or disable a user account or alter permissions."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found.",
        )

    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role is not None:
        user.role = data.role

    db.commit()
    db.refresh(user)
    return user


@router.get("/products", response_model=List[ProductResponse])
def get_admin_products(db: Session = Depends(get_db)):
    """List all products in the system across all farmers."""
    return ProductService.get_products(db)


@router.delete("/products/{product_id}")
def delete_admin_product(
    product_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Remove a product from the platform as administrator."""
    return ProductService.delete_product(db, product_id, current_admin)


@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(db: Session = Depends(get_db)):
    """List all customer orders across the platform."""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [OrderService.format_order_response(o) for o in orders]
