from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    delivery_address = Column(Text, nullable=False)
    payment_method = Column(String(50), nullable=False)  # 'Cash on Delivery', 'Online Payment'
    payment_status = Column(String(30), nullable=False, default="Pending")  # 'Pending', 'Paid'
    order_status = Column(String(30), nullable=False, default="Pending")  # 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    consumer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    farmer = relationship("User", foreign_keys=[farmer_id])


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(30), nullable=False)
    transaction_reference = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="payment")
