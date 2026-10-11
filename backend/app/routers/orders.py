from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import require_authenticated, require_consumer
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    data: OrderCreate,
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Place an order from items currently in the consumer's cart."""
    return OrderService.create_order_from_cart(db, current_user, data)


@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """List orders relevant to the current user (consumer's orders, farmer's sales, or all for admin)."""
    return OrderService.get_orders_for_user(db, current_user)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """View detailed information and status tracking for a specific order."""
    return OrderService.get_order_by_id(db, order_id, current_user)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """Update order progress status (Pending -> Confirmed -> Packed -> Shipped -> Delivered)."""
    return OrderService.update_order_status(db, order_id, data, current_user)


@router.delete("/{order_id}", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """Cancel order (Only allowed if status is currently 'Pending'). Restores inventory."""
    return OrderService.cancel_order(db, order_id, current_user)
