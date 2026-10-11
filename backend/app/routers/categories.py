from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import require_farmer_or_admin
from app.models.product import Category
from app.models.user import User
from app.schemas.product import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Retrieve all product categories."""
    return db.query(Category).order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(require_farmer_or_admin),
    db: Session = Depends(get_db),
):
    """Add a new category (Farmer or Admin)."""
    normalized_name = data.name.strip()
    existing = db.query(Category).filter(Category.name.ilike(normalized_name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{normalized_name}' already exists.",
        )

    category = Category(name=normalized_name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
