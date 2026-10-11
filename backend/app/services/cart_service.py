from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate
from app.utils.helpers import format_product_response


class CartService:
    @staticmethod
    def get_or_create_cart(db: Session, user_id: int) -> Cart:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_response(db: Session, user_id: int):
        cart = CartService.get_or_create_cart(db, user_id)
        # Load items with product and farmer
        items = (
            db.query(CartItem)
            .filter(CartItem.cart_id == cart.id)
            .join(CartItem.product)
            .options(
                joinedload(CartItem.product).joinedload(Product.farmer).joinedload(User.farmer_profile),
                joinedload(CartItem.product).joinedload(Product.category),
            )
            .all()
        )

        item_responses = []
        total_amount = 0.0
        total_items_count = 0

        for item in items:
            product = item.product
            subtotal = round(product.price * item.quantity, 2)
            total_amount += subtotal
            total_items_count += 1
            item_responses.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": format_product_response(product),
                "subtotal": subtotal,
            })

        return {
            "id": cart.id,
            "user_id": cart.user_id,
            "items": item_responses,
            "total_amount": round(total_amount, 2),
            "total_items": total_items_count,
        }

    @staticmethod
    def add_to_cart(db: Session, user_id: int, data: CartItemCreate):
        if data.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity to add must be greater than zero.",
            )

        product = db.query(Product).filter(Product.id == data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {data.product_id} does not exist.",
            )

        if product.quantity_available <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{product.name}' is currently out of stock.",
            )

        cart = CartService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == data.product_id,
        ).first()

        new_total_qty = (cart_item.quantity if cart_item else 0) + data.quantity
        if new_total_qty > product.quantity_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add {data.quantity} {product.unit}. Total quantity ({new_total_qty} {product.unit}) exceeds available stock ({product.quantity_available} {product.unit}).",
            )

        if cart_item:
            cart_item.quantity = new_total_qty
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=data.product_id,
                quantity=data.quantity,
            )
            db.add(cart_item)

        db.commit()
        return CartService.get_cart_response(db, user_id)

    @staticmethod
    def update_cart_item(db: Session, user_id: int, item_id: int, data: CartItemUpdate):
        cart = CartService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        # If quantity becomes zero or negative, remove the item
        if data.quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return CartService.get_cart_response(db, user_id)

        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            db.delete(cart_item)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The product in your cart is no longer available.",
            )

        if data.quantity > product.quantity_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot set quantity to {data.quantity} {product.unit}. Available stock is only {product.quantity_available} {product.unit}.",
            )

        cart_item.quantity = data.quantity
        db.commit()
        return CartService.get_cart_response(db, user_id)

    @staticmethod
    def remove_cart_item(db: Session, user_id: int, item_id: int):
        cart = CartService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        db.delete(cart_item)
        db.commit()
        return CartService.get_cart_response(db, user_id)

    @staticmethod
    def clear_cart(db: Session, user_id: int):
        cart = CartService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
