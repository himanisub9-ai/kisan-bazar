from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0, description="Quantity to add, must be greater than 0")


class CartItemUpdate(BaseModel):
    quantity: float = Field(..., description="Updated quantity; 0 or less will remove item")


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    product: ProductResponse
    subtotal: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_amount: float
    total_items: int

    class Config:
        from_attributes = True
