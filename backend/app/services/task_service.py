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
            ).order_by(Task.status, Task.sort_order).all()
            
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
            due_date=data.due_date,
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
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(task, field) and value is not None:
                if field == 'status':
                    task.status = TaskStatus(value)
                else:
                    setattr(task, field, value)
            
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

    @staticmethod
    def reorder_task(task_id: int, target_status: str, target_position: int, user_id: int) -> TaskOutSchema:
        """
        Reorder a task to a new position within its status column.
        
        Args:
            task_id: ID of the task to reorder
            target_status: Status column to move to (can be same as current)
            target_position: 0-based index position in the target column
            user_id: ID of the user (for authorization)
            
        Returns:
            Updated task data
            
        Raises:
            APIError: If task not found or database error
        """
        from app.extensions import db
        
        try:
            # Get the task to reorder
            task = Task.query.filter_by(
                id=task_id, 
                user_id=user_id, 
                is_deleted=False
            ).first()
            
            if not task:
                raise APIError("Task not found", status=HTTPStatus.NOT_FOUND)
            
            # Validate target status
            try:
                target_status_enum = TaskStatus(target_status)
            except ValueError:
                raise APIError("Invalid status", status=HTTPStatus.BAD_REQUEST)
            
            # Get all tasks in target status column ordered by sort_order
            target_tasks = Task.query.filter_by(
                user_id=user_id,
                status=target_status_enum,
                is_deleted=False
            ).filter(Task.id != task_id).order_by(Task.sort_order).all()
            
            # Calculate new sort_order based on target position
            if target_position <= 0:
                # Moving to beginning
                if target_tasks:
                    new_sort_order = target_tasks[0].sort_order - 1000.0
                else:
                    new_sort_order = 1000.0
                    
            elif target_position >= len(target_tasks):
                # Moving to end
                if target_tasks:
                    new_sort_order = target_tasks[-1].sort_order + 1000.0
                else:
                    new_sort_order = 1000.0
                    
            else:
                # Moving to middle - find fractional position
                before_task = target_tasks[target_position - 1]
                after_task = target_tasks[target_position]
                new_sort_order = (before_task.sort_order + after_task.sort_order) / 2.0
            
            # Update task
            task.status = target_status_enum
            task.sort_order = new_sort_order
            task.save()
            
            return TaskOutSchema.model_validate(task)
            
        except APIError:
            raise
        except Exception as e:
            raise APIError(
                "Database error during reorder",
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
                original=e
            )