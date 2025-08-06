# app/schemas/user_schemas.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Annotated
from datetime import datetime

# Define reusable annotated types
Username = Annotated[
    str,
    Field(
        min_length=3,
        strip_whitespace=True,
        description="Your public handle (3+ chars, no leading/trailing whitespace)"
    )
]
Password = Annotated[
    str,
    Field(
        min_length=6,
        description="Password (6+ characters)"
    )
]

# Authentication Schemas
class UserRegisterSchema(BaseModel):
    username: Username
    email: EmailStr
    password: Password


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: Password


class UserOutSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime | None = None

    # Tell Pydantic to read attributes off the ORM object
    model_config = ConfigDict(from_attributes=True)


# User Profile Management Schemas
class UserProfileUpdateSchema(BaseModel):
    """Schema for updating user profile information"""
    username: Username | None = None
    email: EmailStr | None = None
    
    model_config = ConfigDict(str_strip_whitespace=True)


class UserPasswordChangeSchema(BaseModel):
    """Schema for changing user password"""
    current_password: str = Field(..., description="Current password for verification")
    new_password: Password = Field(..., description="New password")
    confirm_password: str = Field(..., description="Confirm new password")
    
    def validate_password_match(self):
        """Validate that new password and confirmation match"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")