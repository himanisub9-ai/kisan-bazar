from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, FarmerProfile
from app.models.cart import Cart
from app.schemas.auth import UserRegister, UserLogin
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token


class AuthService:
    @staticmethod
    def register_user(db: Session, data: UserRegister) -> User:
        # Check existing email
        existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        # Validate farmer details if registering as farmer
        if data.role == "farmer":
            if not data.farm_name or not data.farm_location:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Farm name and farm location are required for farmer registration.",
                )

        new_user = User(
            name=data.name.strip(),
            email=data.email.lower().strip(),
            password_hash=hash_password(data.password),
            phone=data.phone.strip() if data.phone else None,
            role=data.role,
            address=data.address.strip() if data.address else None,
            is_active=True,
        )
        db.add(new_user)
        db.flush()  # to obtain new_user.id

        if data.role == "farmer":
            farmer_profile = FarmerProfile(
                user_id=new_user.id,
                farm_name=data.farm_name.strip(),
                farm_location=data.farm_location.strip(),
                description=data.farm_description.strip() if data.farm_description else None,
            )
            db.add(farmer_profile)

        # Automatically create cart for consumers
        if data.role == "consumer":
            cart = Cart(user_id=new_user.id)
            db.add(cart)

        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def login_user(db: Session, data: UserLogin):
        user = db.query(User).filter(User.email == data.email.lower().strip()).first()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Please contact support.",
            )

        # Generate JWT token
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.name,
        }
        token = create_access_token(token_payload)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
        }
