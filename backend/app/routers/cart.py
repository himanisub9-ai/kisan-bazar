from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import require_consumer
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Retrieve the current consumer's shopping cart with subtotals and product details."""
    return CartService.get_cart_response(db, current_user.id)


@router.post("/items", response_model=CartResponse)
def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Add a product with quantity to the consumer's cart."""
    return CartService.add_to_cart(db, current_user.id, data)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Update item quantity in cart. If quantity is 0 or less, the item is removed."""
    return CartService.update_cart_item(db, current_user.id, item_id, data)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Remove a specific item from the consumer's cart."""
    return CartService.remove_cart_item(db, current_user.id, item_id)


@router.delete("", response_model=CartResponse)
def clear_cart(
    current_user: User = Depends(require_consumer),
    db: Session = Depends(get_db),
):
    """Clear all items from the consumer's cart."""
    CartService.clear_cart(db, current_user.id)
    return CartService.get_cart_response(db, current_user.id)
