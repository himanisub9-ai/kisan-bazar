from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=5, description="Full delivery address")
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    payment_method: str = Field(..., pattern="^(Cash on Delivery|Online Payment)$")


class OrderStatusUpdate(BaseModel):
    order_status: str = Field(..., pattern="^(Pending|Confirmed|Packed|Shipped|Delivered|Cancelled)$")


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int]
    farmer_id: Optional[int]
    quantity: float
    price: float
    subtotal: float
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    product_unit: Optional[str] = None
    farmer_name: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    payment_method: str
    payment_status: str
    transaction_reference: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    consumer_id: Optional[int]
    total_amount: float
    delivery_address: str
    payment_method: str
    payment_status: str
    order_status: str
    created_at: datetime
    consumer_name: Optional[str] = None
    consumer_email: Optional[str] = None
    consumer_phone: Optional[str] = None
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None

    class Config:
        from_attributes = True
