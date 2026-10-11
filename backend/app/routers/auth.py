from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdate
from app.services.auth_service import AuthService
from app.models.user import User, FarmerProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new consumer or farmer account."""
    user = AuthService.register_user(db, data)
    # Auto-login upon registration
    login_info = AuthService.login_user(db, UserLogin(email=data.email, password=data.password))
    return login_info


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and obtain a JWT bearer token."""
    return AuthService.login_user(db, data)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile information for the authenticated user."""
    if data.name:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip() if data.phone else None
    if data.address is not None:
        current_user.address = data.address.strip() if data.address else None

    if current_user.role == "farmer":
        if not current_user.farmer_profile:
            current_user.farmer_profile = FarmerProfile(user_id=current_user.id)
            db.add(current_user.farmer_profile)
        if data.farm_name:
            current_user.farmer_profile.farm_name = data.farm_name.strip()
        if data.farm_location:
            current_user.farmer_profile.farm_location = data.farm_location.strip()
        if data.farm_description is not None:
            current_user.farmer_profile.description = data.farm_description.strip() if data.farm_description else None

    db.commit()
    db.refresh(current_user)
    return current_user
