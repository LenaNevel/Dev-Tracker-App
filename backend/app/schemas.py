# app/schemas.py
from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

# Input schema for registration
class UserRegisterSchema(BaseModel):
    username: constr(strip_whitespace=True, min_length=3)
    email: EmailStr
    password: constr(min_length=6)

# Output schema for user data
class UserOutSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
