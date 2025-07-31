# backend/app/utils.py
from datetime import datetime, date
import json
import logging
from functools import wraps
from typing import Any, Dict, Optional, Union, Type
from flask import request, Response
from flask_jwt_extended import get_jwt_identity
from pydantic import BaseModel, ValidationError
from http import HTTPStatus
from app.errors import APIError

# Configure logging
logger = logging.getLogger(__name__)

def to_json(data, status=HTTPStatus.OK):
    """
    Recursively serialize Pydantic models, dicts, lists, and datetimes into JSON.
    """
    def serialize(obj):
        if isinstance(obj, BaseModel):
            return serialize(obj.model_dump())
        if isinstance(obj, dict):
            return {k: serialize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [serialize(v) for v in obj]
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        # add more type checks here if needed
        return obj

    plain = serialize(data)
    body = json.dumps(plain)
    return Response(body, status=status, mimetype="application/json")

def validate_input(schema: Type[BaseModel]):
    """
    Decorator to validate request.json against a Pydantic schema.
    Works on both function-based and MethodView methods.
    Injects the validated model instance as the first argument after `self` (if present).
    
    Args:
        schema: Pydantic model class for validation
        
    Raises:
        APIError: If validation fails or request format is invalid
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                # Extract JSON payload
                payload = request.get_json()
                if payload is None:
                    raise APIError(
                        "Request must contain valid JSON", 
                        status=HTTPStatus.BAD_REQUEST
                    )
                
                # Validate/parse into Pydantic model
                validated = schema.model_validate(payload)

                # Detect MethodView: args[0] is `self`
                if args and hasattr(args[0], fn.__name__):
                    self_obj, *rest = args
                    return fn(self_obj, validated, *rest, **kwargs)

                # Else, function-based view: pass validated first
                return fn(validated, *args, **kwargs)
                
            except ValidationError as e:
                logger.warning(f"Validation error in {fn.__name__}: {e}")
                raise APIError(
                    f"Validation error: {format_validation_error(e)}", 
                    status=HTTPStatus.BAD_REQUEST
                )
            except json.JSONDecodeError:
                raise APIError(
                    "Invalid JSON format", 
                    status=HTTPStatus.BAD_REQUEST
                )

        return wrapper
    return decorator

def format_validation_error(error: ValidationError) -> str:
    """
    Format Pydantic validation error into user-friendly message.
    
    Args:
        error: Pydantic ValidationError
        
    Returns:
        Formatted error message
    """
    messages = []
    for err in error.errors():
        field = ".".join(str(loc) for loc in err["loc"])
        message = err["msg"]
        messages.append(f"{field}: {message}")
    return "; ".join(messages)

def get_current_user_id() -> int:
    """
    Get the current authenticated user's ID as an integer.
    Requires @jwt_required() decorator to be applied to the calling function.
    
    Returns:
        User ID as integer
        
    Raises:
        APIError: If user identity is invalid
    """
    try:
        identity = get_jwt_identity()
        if not identity:
            raise APIError("No user identity found", status=HTTPStatus.UNAUTHORIZED)
        return int(identity)
    except (ValueError, TypeError):
        raise APIError("Invalid user identity", status=HTTPStatus.UNAUTHORIZED)

def handle_database_error(error: Exception, context: str = "") -> None:
    """
    Handle database errors with consistent logging and error raising.
    
    Args:
        error: The database exception
        context: Additional context for logging
        
    Raises:
        APIError: Appropriate API error based on the database error
    """
    logger.error(f"Database error{' in ' + context if context else ''}: {error}")
    
    if "not among the defined enum values" in str(error):
        raise APIError(
            "Database contains corrupted data. Please contact support.",
            status=HTTPStatus.INTERNAL_SERVER_ERROR
        )
    
    # Add more specific error handling as needed
    raise APIError(
        "Database operation failed",
        status=HTTPStatus.INTERNAL_SERVER_ERROR
    )

def success_response(
    data: Any, 
    message: Optional[str] = None, 
    status: HTTPStatus = HTTPStatus.OK
) -> Response:
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        message: Optional success message
        status: HTTP status code
        
    Returns:
        JSON response
    """
    response_data = {"data": data}
    if message:
        response_data["message"] = message
    
    return to_json(response_data, status=status)

def paginate_query(query, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
    """
    Helper function to paginate SQLAlchemy queries.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        per_page: Items per page
        
    Returns:
        Dictionary with paginated results and metadata
    """
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return {
        "items": pagination.items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_prev": pagination.has_prev,
            "has_next": pagination.has_next
        }
    }
