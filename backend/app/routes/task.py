from http import HTTPStatus
from flask import Blueprint, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, JWTManager
from flask_jwt_extended.exceptions import JWTExtendedException
from app.models import Task, User
from app.schemas import TaskCreateSchema, TaskUpdateSchema, TaskOutSchema
from app.utils import validate_input, to_json, get_current_user_id

task_bp = Blueprint("task", __name__, url_prefix="/tasks")

@task_bp.before_request
def debug_request():
    from flask import request
    print(f"DEBUG: Request to {request.method} {request.path}")
    print(f"DEBUG: Headers: {dict(request.headers)}")

@task_bp.errorhandler(JWTExtendedException)
def handle_jwt_exceptions(error):
    print(f"DEBUG: JWT Error: {error}")
    return jsonify(msg=str(error)), 422

class TaskAPI(MethodView):
    
    def options(self):
        """Handle CORS preflight requests"""
        print("DEBUG: OPTIONS /tasks called")
        return jsonify({}), 200
    
    @jwt_required()
    def get(self):
        """Get all tasks for the logged-in user"""
        print("DEBUG: GET /tasks called")
        try:
            user_id = get_current_user_id()
            print(f"DEBUG: Got user_id: {user_id}")
            tasks = Task.query.filter_by(user_id=user_id, is_deleted=False).order_by(Task.created_at.desc()).all()
            print(f"DEBUG: Found {len(tasks)} tasks")
            tasks_out = [TaskOutSchema.model_validate(task) for task in tasks]
            print(f"DEBUG: Serialized {len(tasks_out)} tasks")
            result = to_json({"tasks": tasks_out})
            print("DEBUG: Returning successful response")
            return result
        except Exception as e:
            print(f"DEBUG: Error in GET /tasks: {str(e)}")
            print(f"DEBUG: Error type: {type(e)}")
            raise
    
    @jwt_required()
    @validate_input(TaskCreateSchema)
    def post(self, data: TaskCreateSchema):
        """Create a new task for the logged-in user"""
        user_id = get_current_user_id()
        
        task = Task(
            title=data.title,
            why=data.why,
            what=data.what,
            how=data.how,
            acceptance_criteria=data.acceptance_criteria,
            status=data.status,
            user_id=user_id
        )
        task.save()
        
        task_out = TaskOutSchema.model_validate(task)
        return to_json({"task": task_out}, status=HTTPStatus.CREATED)

class SingleTaskAPI(MethodView):
    @jwt_required()
    @validate_input(TaskUpdateSchema)
    def put(self, task_id: int, data: TaskUpdateSchema):
        """Update a specific task"""
        user_id = get_current_user_id()
        task = Task.query.filter_by(id=task_id, user_id=user_id, is_deleted=False).first()
        
        if not task:
            return to_json({"error": "Task not found"}, status=HTTPStatus.NOT_FOUND)
        
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
            task.status = data.status
            
        task.save()
        task_out = TaskOutSchema.model_validate(task)
        return to_json({"task": task_out})
    
    @jwt_required()
    def delete(self, task_id: int):
        """Soft delete a specific task"""
        user_id = get_current_user_id()
        task = Task.query.filter_by(id=task_id, user_id=user_id, is_deleted=False).first()
        
        if not task:
            return to_json({"error": "Task not found"}, status=HTTPStatus.NOT_FOUND)
        
        task.is_deleted = True
        task.save()
        return to_json({"message": "Task deleted successfully"})

# Register the views
task_view = TaskAPI.as_view("task_api")
task_bp.add_url_rule("", view_func=task_view, methods=["GET", "POST", "OPTIONS"])

single_task_view = SingleTaskAPI.as_view("single_task_api")
task_bp.add_url_rule("/<int:task_id>", view_func=single_task_view, methods=["PUT", "DELETE"])