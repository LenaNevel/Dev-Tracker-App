# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
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

class UserRegisterSchema(BaseModel):
    username: Username
    email: EmailStr
    password: Password

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: Password

# app/schemas.py
from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict
from typing import Annotated
from datetime import datetime

# … keep your Username and Password Annotated types …

class UserOutSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    # Tell Pydantic to read attributes off the ORM object
    model_config = ConfigDict(from_attributes=True)
