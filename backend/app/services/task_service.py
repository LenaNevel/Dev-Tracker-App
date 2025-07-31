# backend/app/services/task_service.py
from http import HTTPStatus
from typing import List
from app.models import Task, TaskStatus
from app.errors import APIError
from app.schemas import TaskCreateSchema, TaskUpdateSchema, TaskOutSchema, TaskTableSchema


class TaskService:
    @staticmethod
    def get_user_tasks(user_id: int) -> List[TaskTableSchema]:
        """
        Get all non-deleted tasks for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of task table data
        """
        try:
            tasks = Task.query.filter_by(
                user_id=user_id, 
                is_deleted=False
            ).order_by(Task.created_at.desc()).all()
            
            return [TaskTableSchema.model_validate(task) for task in tasks]
        except Exception as e:
            if "not among the defined enum values" in str(e):
                raise APIError(
                    "Database contains corrupted task status data. Please contact support.",
                    status=HTTPStatus.INTERNAL_SERVER_ERROR
                )
            raise

    @staticmethod
    def get_task_by_id(task_id: int, user_id: int) -> TaskOutSchema:
        """
        Get a specific task by ID for a user.
        
        Args:
            task_id: ID of the task
            user_id: ID of the user (for authorization)
            
        Returns:
            Full task data
            
        Raises:
            APIError: If task not found or database error
        """
        try:
            task = Task.query.filter_by(
                id=task_id, 
                user_id=user_id, 
                is_deleted=False
            ).first()
        except Exception as e:
            if "not among the defined enum values" in str(e):
                raise APIError(
                    "This task has corrupted status data. Please contact support.",
                    status=HTTPStatus.INTERNAL_SERVER_ERROR
                )
            raise APIError("Database error", status=HTTPStatus.INTERNAL_SERVER_ERROR)
        
        if not task:
            raise APIError("Task not found", status=HTTPStatus.NOT_FOUND)
        
        return TaskOutSchema.model_validate(task)

    @staticmethod
    def create_task(data: TaskCreateSchema, user_id: int) -> TaskOutSchema:
        """
        Create a new task for a user.
        
        Args:
            data: Validated task creation data
            user_id: ID of the user
            
        Returns:
            Created task data
        """
        task = Task(
            title=data.title,
            why=data.why,
            what=data.what,
            how=data.how,
            acceptance_criteria=data.acceptance_criteria,
            status=TaskStatus(data.status),
            user_id=user_id
        )
        task.save()
        
        return TaskOutSchema.model_validate(task)

    @staticmethod
    def update_task(task_id: int, data: TaskUpdateSchema, user_id: int) -> TaskOutSchema:
        """
        Update an existing task.
        
        Args:
            task_id: ID of the task to update
            data: Validated task update data
            user_id: ID of the user (for authorization)
            
        Returns:
            Updated task data
            
        Raises:
            APIError: If task not found or database error
        """
        try:
            task = Task.query.filter_by(
                id=task_id, 
                user_id=user_id, 
                is_deleted=False
            ).first()
        except Exception as e:
            raise APIError(
                "Database error - task may have corrupted data",
                status=HTTPStatus.INTERNAL_SERVER_ERROR
            )
        
        if not task:
            raise APIError("Task not found", status=HTTPStatus.NOT_FOUND)
        
        # Update fields if provided
        if data.title is not None:
            task.title = data.title
        if data.why is not None:
            task.why = data.why
        if data.what is not None:
            task.what = data.what
        if data.how is not None:
            task.how = data.how
        if data.acceptance_criteria is not None:
            task.acceptance_criteria = data.acceptance_criteria
        if data.status is not None:
            task.status = TaskStatus(data.status)
            
        task.save()
        return TaskOutSchema.model_validate(task)

    @staticmethod
    def delete_task(task_id: int, user_id: int) -> None:
        """
        Soft delete a task.
        
        Args:
            task_id: ID of the task to delete
            user_id: ID of the user (for authorization)
            
        Raises:
            APIError: If task not found
        """
        task = Task.query.filter_by(
            id=task_id, 
            user_id=user_id, 
            is_deleted=False
        ).first()
        
        if not task:
            raise APIError("Task not found", status=HTTPStatus.NOT_FOUND)
        
        task.is_deleted = True
        task.save()