from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status
from app.models.product import Product, Category
from app.models.user import User, FarmerProfile
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.helpers import format_product_response


class ProductService:
    @staticmethod
    def get_products(
        db: Session,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        category_name: Optional[str] = None,
        farmer_id: Optional[int] = None,
        sort: Optional[str] = "newest",
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ):
        query = (
            db.query(Product)
            .join(Product.farmer)
            .join(Product.category)
            .options(
                joinedload(Product.farmer).joinedload(User.farmer_profile),
                joinedload(Product.category),
            )
        )

        if search:
            search_term = f"%{search.strip()}%"
            query = query.outerjoin(FarmerProfile, FarmerProfile.user_id == Product.farmer_id).filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    User.name.ilike(search_term),
                    FarmerProfile.farm_name.ilike(search_term),
                    FarmerProfile.farm_location.ilike(search_term),
                )
            )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if category_name:
            query = query.filter(Category.name.ilike(category_name.strip()))

        if farmer_id:
            query = query.filter(Product.farmer_id == farmer_id)

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Sorting
        if sort == "price_asc":
            query = query.order_by(asc(Product.price))
        elif sort == "price_desc":
            query = query.order_by(desc(Product.price))
        else:
            query = query.order_by(desc(Product.created_at))

        products = query.all()
        return [format_product_response(p) for p in products]

    @staticmethod
    def get_product_by_id(db: Session, product_id: int):
        product = (
            db.query(Product)
            .options(
                joinedload(Product.farmer).joinedload(User.farmer_profile),
                joinedload(Product.category),
            )
            .filter(Product.id == product_id)
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} was not found.",
            )
        return format_product_response(product)

    @staticmethod
    def create_product(db: Session, data: ProductCreate, farmer: User):
        # Verify category
        category = db.query(Category).filter(Category.id == data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {data.category_id} does not exist.",
            )

        product = Product(
            farmer_id=farmer.id,
            category_id=data.category_id,
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            price=data.price,
            unit=data.unit,
            quantity_available=data.quantity_available,
            image_url=data.image_url.strip() if data.image_url else None,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return ProductService.get_product_by_id(db, product.id)

    @staticmethod
    def update_product(db: Session, product_id: int, data: ProductUpdate, current_user: User):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} was not found.",
            )

        # Farmer must only be able to modify their own products (unless Admin)
        if current_user.role != "admin" and product.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this product. Farmers can only modify their own products.",
            )

        if data.category_id is not None:
            cat = db.query(Category).filter(Category.id == data.category_id).first()
            if not cat:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with ID {data.category_id} does not exist.",
                )
            product.category_id = data.category_id

        if data.name is not None:
            product.name = data.name.strip()
        if data.description is not None:
            product.description = data.description.strip()
        if data.price is not None:
            product.price = data.price
        if data.unit is not None:
            product.unit = data.unit
        if data.quantity_available is not None:
            product.quantity_available = data.quantity_available
        if data.image_url is not None:
            product.image_url = data.image_url.strip() if data.image_url else None

        db.commit()
        db.refresh(product)
        return ProductService.get_product_by_id(db, product.id)

    @staticmethod
    def delete_product(db: Session, product_id: int, current_user: User):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} was not found.",
            )

        # Farmer must only be able to delete their own products (unless Admin)
        if current_user.role != "admin" and product.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this product.",
            )

        db.delete(product)
        db.commit()
        return {"message": f"Product '{product.name}' was successfully deleted."}
