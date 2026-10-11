from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class FarmerProfileCreate(BaseModel):
    farm_name: str = Field(..., min_length=2, max_length=150)
    farm_location: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str = Field("consumer", pattern="^(consumer|farmer|admin)$")
    # Optional farmer specific fields when registering as farmer
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None


class FarmerProfileResponse(BaseModel):
    id: int
    farm_name: str
    farm_location: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    address: Optional[str] = None
    is_active: bool
    created_at: datetime
    farmer_profile: Optional[FarmerProfileResponse] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
