from http import HTTPStatus
from flask import Blueprint, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_jwt_extended.exceptions import JWTExtendedException
from app.schemas import TaskCreateSchema, TaskUpdateSchema
from app.services.task_service import TaskService
from app.utils import validate_input, to_json, get_current_user_id

task_bp = Blueprint("task", __name__, url_prefix="/tasks")

@task_bp.errorhandler(JWTExtendedException)
def handle_jwt_exceptions(error):
    """Handle JWT-related errors"""
    return jsonify(msg=str(error)), 422

class TaskAPI(MethodView):
    """Task collection endpoint"""
    
    def options(self):
        """Handle CORS preflight requests"""
        return jsonify({}), 200
    
    @jwt_required()
    def get(self):
        """Get all tasks for the logged-in user (table view with limited data)"""
        user_id = get_current_user_id()
        tasks_out = TaskService.get_user_tasks(user_id)
        return to_json({"tasks": tasks_out})
    
    @jwt_required()
    @validate_input(TaskCreateSchema)
    def post(self, data: TaskCreateSchema):
        """Create a new task for the logged-in user"""
        user_id = get_current_user_id()
        task_out = TaskService.create_task(data, user_id)
        return to_json({"task": task_out}, status=HTTPStatus.CREATED)

class SingleTaskAPI(MethodView):
    """Individual task endpoint"""
    
    @jwt_required()
    def get(self, task_id: int):
        """Get full details for a specific task"""
        user_id = get_current_user_id()
        task_out = TaskService.get_task_by_id(task_id, user_id)
        return to_json({"task": task_out})

    @jwt_required()
    @validate_input(TaskUpdateSchema)  
    def put(self, data: TaskUpdateSchema, task_id: int):
        """Update a specific task"""
        user_id = get_current_user_id()
        task_out = TaskService.update_task(task_id, data, user_id)
        return to_json({"task": task_out})
    
    @jwt_required()
    def delete(self, task_id: int):
        """Soft delete a specific task"""
        user_id = get_current_user_id()
        TaskService.delete_task(task_id, user_id)
        return to_json({"message": "Task deleted successfully"})

# Register the views
task_view = TaskAPI.as_view("task_api")
task_bp.add_url_rule("", view_func=task_view, methods=["GET", "POST", "OPTIONS"])

single_task_view = SingleTaskAPI.as_view("single_task_api")
task_bp.add_url_rule("/<int:task_id>", view_func=single_task_view, methods=["GET", "PUT", "DELETE"])