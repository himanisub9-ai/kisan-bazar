from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import require_farmer, require_authenticated
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search term for product name, description or farm"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    farmer_id: Optional[int] = Query(None, description="Filter by farmer ID"),
    sort: Optional[str] = Query("newest", description="Sort order: newest, price_asc, price_desc"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    db: Session = Depends(get_db),
):
    """Browse agricultural products with search, category filtering, and price sorting."""
    return ProductService.get_products(
        db=db,
        search=search,
        category_id=category_id,
        category_name=category,
        farmer_id=farmer_id,
        sort=sort,
        min_price=min_price,
        max_price=max_price,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    """Retrieve full details of a specific agricultural product."""
    return ProductService.get_product_by_id(db, product_id)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    """Add a new agricultural product to marketplace (Farmer only)."""
    return ProductService.create_product(db, data, current_user)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """Update agricultural product details (Only the owning farmer or admin)."""
    return ProductService.update_product(db, product_id, data, current_user)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    """Delete a product from the marketplace (Only the owning farmer or admin)."""
    return ProductService.delete_product(db, product_id, current_user)
