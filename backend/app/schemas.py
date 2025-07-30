# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Annotated
from datetime import datetime
from enum import Enum

class TaskStatusEnum(str, Enum):
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review" 
    DONE = "done"
    WONT_DO = "wont_do"

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


# Task schemas
class TaskCreateSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200, description="Task title (required)")
    why: str | None = Field(None, description="Motivation or goal for the task")
    what: str | None = Field(None, description="Detailed task description")
    how: str | None = Field(None, description="Implementation ideas or approach")
    acceptance_criteria: str | None = Field(None, description="Success criteria or checklist")
    status: TaskStatusEnum = Field(TaskStatusEnum.BACKLOG, description="Task status")


class TaskUpdateSchema(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200, description="Task title")
    why: str | None = Field(None, description="Motivation or goal for the task")
    what: str | None = Field(None, description="Detailed task description")
    how: str | None = Field(None, description="Implementation ideas or approach")
    acceptance_criteria: str | None = Field(None, description="Success criteria or checklist")
    status: TaskStatusEnum | None = Field(None, description="Task status")


class TaskOutSchema(BaseModel):
    id: int
    title: str
    why: str | None
    what: str | None
    how: str | None
    acceptance_criteria: str | None
    status: str  # Changed from TaskStatusEnum to str for better JSON serialization
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def model_validate(cls, obj):
        # Convert enum to string value for JSON serialization
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            obj_dict = obj.__dict__.copy()
            obj_dict['status'] = obj.status.value
            return super().model_validate(obj_dict)
        return super().model_validate(obj)
