# backend/app/utils.py
from datetime import datetime, date
import json
from functools import wraps
from flask import request, Response
from flask_jwt_extended import get_jwt_identity
from pydantic import BaseModel
from http import HTTPStatus

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

def validate_input(schema):
    """
    Decorator to validate request.json against a Pydantic schema.
    Works on both function-based and MethodView methods.
    Injects the validated model instance as the first argument after `self` (if present).
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Extract JSON payload
            payload = request.get_json() or {}
            # Validate/parse into Pydantic model (raises ValidationError on failure)
            validated = schema.model_validate(payload)

            # Detect MethodView: args[0] is `self`
            if args and hasattr(args[0], fn.__name__):
                self_obj, *rest = args
                return fn(self_obj, validated, *rest, **kwargs)

            # Else, function-based view: pass validated first
            return fn(validated, *args, **kwargs)

        return wrapper
    return decorator

def get_current_user_id():
    """
    Get the current authenticated user's ID as an integer.
    Requires @jwt_required() decorator to be applied to the calling function.
    """
    return int(get_jwt_identity())
