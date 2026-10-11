from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem, Payment
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User, FarmerProfile
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.utils.helpers import generate_transaction_reference


class OrderService:
    @staticmethod
    def format_order_response(order: Order):
        items = []
        for it in order.items:
            product_name = it.product.name if it.product else "Unknown Product"
            product_image = it.product.image_url if it.product else None
            product_unit = it.product.unit if it.product else "unit"
            farmer_name = it.farmer.name if it.farmer else "Unknown Farmer"

            items.append({
                "id": it.id,
                "order_id": it.order_id,
                "product_id": it.product_id,
                "farmer_id": it.farmer_id,
                "quantity": it.quantity,
                "price": it.price,
                "subtotal": it.subtotal,
                "product_name": product_name,
                "product_image": product_image,
                "product_unit": product_unit,
                "farmer_name": farmer_name,
            })

        payment_data = None
        if order.payment:
            payment_data = {
                "id": order.payment.id,
                "order_id": order.payment.order_id,
                "amount": order.payment.amount,
                "payment_method": order.payment.payment_method,
                "payment_status": order.payment.payment_status,
                "transaction_reference": order.payment.transaction_reference,
                "created_at": order.payment.created_at,
            }

        return {
            "id": order.id,
            "consumer_id": order.consumer_id,
            "total_amount": order.total_amount,
            "delivery_address": order.delivery_address,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "created_at": order.created_at,
            "consumer_name": order.consumer.name if order.consumer else "Customer",
            "consumer_email": order.consumer.email if order.consumer else None,
            "consumer_phone": order.consumer.phone if order.consumer else None,
            "items": items,
            "payment": payment_data,
        }

    @staticmethod
    def create_order_from_cart(db: Session, consumer: User, data: OrderCreate):
        # Retrieve consumer's cart
        cart = db.query(Cart).filter(Cart.user_id == consumer.id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your cart is empty. Please add items before checking out.",
            )

        # Validate stock and compute totals on backend
        total_amount = 0.0
        order_items_to_create = []

        for cart_item in cart.items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A product in your cart (ID {cart_item.product_id}) is no longer available.",
                )

            if cart_item.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid quantity for {product.name}.",
                )

            if cart_item.quantity > product.quantity_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Requested: {cart_item.quantity} {product.unit}, Available: {product.quantity_available} {product.unit}.",
                )

            subtotal = round(product.price * cart_item.quantity, 2)
            total_amount += subtotal

            # Deduct inventory immediately
            product.quantity_available = round(product.quantity_available - cart_item.quantity, 2)

            order_items_to_create.append({
                "product_id": product.id,
                "farmer_id": product.farmer_id,
                "quantity": cart_item.quantity,
                "price": product.price,
                "subtotal": subtotal,
            })

        total_amount = round(total_amount, 2)

        # Determine payment details
        is_online = data.payment_method == "Online Payment"
        payment_status = "Paid" if is_online else "Pending"
        order_status = "Confirmed" if is_online else "Pending"
        txn_ref = generate_transaction_reference("TXN" if is_online else "COD")

        # Create Order
        new_order = Order(
            consumer_id=consumer.id,
            total_amount=total_amount,
            delivery_address=data.delivery_address.strip(),
            payment_method=data.payment_method,
            payment_status=payment_status,
            order_status=order_status,
        )
        db.add(new_order)
        db.flush()

        # Create Order Items
        for item_info in order_items_to_create:
            oi = OrderItem(
                order_id=new_order.id,
                product_id=item_info["product_id"],
                farmer_id=item_info["farmer_id"],
                quantity=item_info["quantity"],
                price=item_info["price"],
                subtotal=item_info["subtotal"],
            )
            db.add(oi)

        # Create Payment Record
        payment = Payment(
            order_id=new_order.id,
            amount=total_amount,
            payment_method=data.payment_method,
            payment_status=payment_status,
            transaction_reference=txn_ref,
        )
        db.add(payment)

        # Clear consumer's cart items
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        db.commit()
        db.refresh(new_order)
        return OrderService.get_order_by_id(db, new_order.id, consumer)

    @staticmethod
    def get_orders_for_user(db: Session, current_user: User):
        if current_user.role == "consumer":
            orders = (
                db.query(Order)
                .filter(Order.consumer_id == current_user.id)
                .order_by(Order.created_at.desc())
                .all()
            )
        elif current_user.role == "farmer":
            # Orders containing items produced by this farmer
            orders = (
                db.query(Order)
                .join(Order.items)
                .filter(OrderItem.farmer_id == current_user.id)
                .distinct()
                .order_by(Order.created_at.desc())
                .all()
            )
        elif current_user.role == "admin":
            orders = db.query(Order).order_by(Order.created_at.desc()).all()
        else:
            orders = []

        return [OrderService.format_order_response(o) for o in orders]

    @staticmethod
    def get_order_by_id(db: Session, order_id: int, current_user: User):
        order = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.items).joinedload(OrderItem.farmer),
                joinedload(Order.consumer),
                joinedload(Order.payment),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} was not found.",
            )

        # Authorization check
        if current_user.role == "consumer" and order.consumer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own orders.",
            )
        elif current_user.role == "farmer":
            # Farmer must have at least one product in this order
            farmer_has_product = any(item.farmer_id == current_user.id for item in order.items)
            if not farmer_has_product:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. This order does not contain your products.",
                )

        return OrderService.format_order_response(order)

    @staticmethod
    def update_order_status(db: Session, order_id: int, data: OrderStatusUpdate, current_user: User):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} was not found.",
            )

        # Authorization: Farmer or Admin
        if current_user.role == "farmer":
            farmer_has_product = any(item.farmer_id == current_user.id for item in order.items)
            if not farmer_has_product:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update status for orders containing your products.",
                )
        elif current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and administrators can update order status.",
            )

        order.order_status = data.order_status
        if data.order_status == "Delivered" and order.payment:
            order.payment.payment_status = "Paid"
            order.payment_status = "Paid"

        db.commit()
        db.refresh(order)
        return OrderService.get_order_by_id(db, order.id, current_user)

    @staticmethod
    def cancel_order(db: Session, order_id: int, current_user: User):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} was not found.",
            )

        # Only consumer of the order or admin can cancel
        if current_user.role == "consumer" and order.consumer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only cancel your own orders.",
            )

        # Order cancellation is ONLY permitted when order is still Pending
        if order.order_status != "Pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel order. Orders can only be cancelled while status is 'Pending' (current status: '{order.order_status}').",
            )

        # Restore product inventory
        for item in order.items:
            if item.product_id:
                prod = db.query(Product).filter(Product.id == item.product_id).first()
                if prod:
                    prod.quantity_available = round(prod.quantity_available + item.quantity, 2)

        order.order_status = "Cancelled"
        if order.payment:
            order.payment.payment_status = "Cancelled/Refunded"
            order.payment_status = "Cancelled"

        db.commit()
        db.refresh(order)
        return OrderService.get_order_by_id(db, order.id, current_user)
