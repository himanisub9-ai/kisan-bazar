from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)


class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class FarmerSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category_id: int
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be strictly positive")
    unit: str = Field("kg", description="Unit of measurement: kg, gram, litre, piece, dozen")
    quantity_available: float = Field(..., ge=0, description="Available inventory count")
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    category_id: Optional[int] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    quantity_available: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    farmer_id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    unit: str
    quantity_available: float
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    farmer: Optional[FarmerSummary] = None

    class Config:
        from_attributes = True
