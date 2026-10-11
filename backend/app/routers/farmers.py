from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies.auth import require_farmer
from app.models.user import User, FarmerProfile
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.auth import UserResponse
from app.schemas.product import ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("", response_model=List[UserResponse])
def get_all_farmers(db: Session = Depends(get_db)):
    """Retrieve list of registered farmers with farm profiles."""
    farmers = (
        db.query(User)
        .options(joinedload(User.farmer_profile))
        .filter(User.role == "farmer", User.is_active == True)
        .all()
    )
    return farmers


@router.get("/dashboard/stats")
def get_farmer_dashboard_stats(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    """Retrieve performance statistics for the logged-in farmer's dashboard."""
    # Total products and active products
    products = db.query(Product).filter(Product.farmer_id == current_user.id).all()
    total_products = len(products)
    active_products = sum(1 for p in products if p.quantity_available > 0)

    # Order items for this farmer
    order_items = (
        db.query(OrderItem)
        .join(OrderItem.order)
        .filter(OrderItem.farmer_id == current_user.id)
        .all()
    )

    # Unique orders
    distinct_order_ids = set(oi.order_id for oi in order_items)
    total_orders = len(distinct_order_ids)

    orders = db.query(Order).filter(Order.id.in_(distinct_order_ids)).all() if distinct_order_ids else []
    pending_orders = sum(1 for o in orders if o.order_status in ["Pending", "Confirmed", "Packed", "Shipped"])
    completed_orders = sum(1 for o in orders if o.order_status == "Delivered")

    # Total sales sum for this farmer
    total_sales = round(sum(oi.subtotal for oi in order_items if oi.order and oi.order.order_status != "Cancelled"), 2)

    return {
        "farmer_name": current_user.name,
        "farm_name": current_user.farmer_profile.farm_name if current_user.farmer_profile else None,
        "farm_location": current_user.farmer_profile.farm_location if current_user.farmer_profile else None,
        "total_products": total_products,
        "active_products": active_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_sales": total_sales,
    }


@router.get("/{farmer_id}", response_model=UserResponse)
def get_farmer_details(farmer_id: int, db: Session = Depends(get_db)):
    """Retrieve public farmer profile and details."""
    farmer = (
        db.query(User)
        .options(joinedload(User.farmer_profile))
        .filter(User.id == farmer_id, User.role == "farmer")
        .first()
    )
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID {farmer_id} was not found.",
        )
    return farmer


@router.get("/{farmer_id}/products", response_model=List[ProductResponse])
def get_farmer_products(farmer_id: int, db: Session = Depends(get_db)):
    """Retrieve all products offered by a specific farmer."""
    return ProductService.get_products(db, farmer_id=farmer_id)
