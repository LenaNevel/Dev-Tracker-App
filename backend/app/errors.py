# app/errors.py
import logging
from http import HTTPStatus
from flask import jsonify

class APIError(Exception):
    """Application‐level exception that carries a user message, status, and optional original exception."""
    def __init__(self, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST, original: Exception | None = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.original = original

def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(err: APIError):
        # Log the original exception if present
        if err.original:
            logging.exception("Underlying exception for APIError:")
        # Return the user-facing message and status
        return jsonify({"error": err.message}), err.status
