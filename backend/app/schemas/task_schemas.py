# app/schemas/task_schemas.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class TaskStatusEnum(str, Enum):
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review" 
    DONE = "done"
    WONT_DO = "wont_do"


# Task schemas
class TaskBaseSchema(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200, description="Task title")
    why: str | None = Field(None, description="Motivation or goal for the task")
    what: str | None = Field(None, description="Detailed task description")
    how: str | None = Field(None, description="Implementation ideas or approach")
    acceptance_criteria: str | None = Field(None, description="Success criteria or checklist")
    status: str | None = Field(None, description="Task status")
    due_date: datetime | None = Field(None, description="Task due date")


class TaskCreateSchema(TaskBaseSchema):
    title: str = Field(min_length=1, max_length=200, description="Task title (required)")
    status: str = Field("backlog", description="Task status")


class TaskUpdateSchema(TaskBaseSchema):
    pass


class TaskTableSchema(BaseModel):
    id: int
    title: str
    status: str
    created_at: datetime
    due_date: datetime | None

    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def model_validate(cls, obj):
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            obj_dict = {
                'id': obj.id,
                'title': obj.title,
                'status': obj.status.value,
                'created_at': obj.created_at,
                'due_date': obj.due_date
            }
            return super().model_validate(obj_dict)
        return super().model_validate(obj)


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
    updated_at: datetime | None
    due_date: datetime | None

    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def model_validate(cls, obj):
        # Convert enum to string value for JSON serialization
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            obj_dict = obj.__dict__.copy()
            obj_dict['status'] = obj.status.value
            return super().model_validate(obj_dict)
        return super().model_validate(obj)


class TaskReorderSchema(BaseModel):
    target_status: str = Field(..., description="Status column to move task to")
    target_position: int = Field(..., ge=0, description="0-based index position in target column")
    
    model_config = ConfigDict(str_strip_whitespace=True)