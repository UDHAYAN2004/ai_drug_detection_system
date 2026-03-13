from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid
from app.constants.roles import UserRole, UserStatus


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    id: uuid.UUID
    status: UserStatus
    is_email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AthleteProfileUpdate(BaseModel):
    sport: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[str] = None
    team: Optional[str] = None
    bio: Optional[str] = None
