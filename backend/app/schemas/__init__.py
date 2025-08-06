# app/schemas/__init__.py
"""
Schema definitions for API request/response validation
"""

# Import all schemas for easy access
from .user_schemas import (
    Username,
    Password,
    UserRegisterSchema,
    UserLoginSchema,
    UserOutSchema,
    UserProfileUpdateSchema,
    UserPasswordChangeSchema,
)

from .task_schemas import (
    TaskStatusEnum,
    TaskBaseSchema,
    TaskCreateSchema,
    TaskUpdateSchema,
    TaskTableSchema,
    TaskOutSchema,
    TaskReorderSchema,
)

# Make all schemas available at package level
__all__ = [
    # User schemas
    "Username",
    "Password", 
    "UserRegisterSchema",
    "UserLoginSchema",
    "UserOutSchema",
    "UserProfileUpdateSchema",
    "UserPasswordChangeSchema",
    
    # Task schemas
    "TaskStatusEnum",
    "TaskBaseSchema",
    "TaskCreateSchema", 
    "TaskUpdateSchema",
    "TaskTableSchema",
    "TaskOutSchema",
    "TaskReorderSchema",
]