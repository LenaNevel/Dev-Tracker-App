from http import HTTPStatus
from flask import Blueprint
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from app.schemas import UserRegisterSchema, UserLoginSchema
from app.services.auth_service import AuthService
from app.utils import validate_input, to_json, get_current_user_id

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

class AuthAPI(MethodView):
    """User registration endpoint"""
    
    @validate_input(UserRegisterSchema)
    def post(self, data: UserRegisterSchema):
        """Register a new user"""
        token, user_out = AuthService.register_user(data)
        return to_json(
            {"access_token": token, "user": user_out}, 
            status=HTTPStatus.CREATED
        )

class AuthLoginAPI(MethodView):
    """User authentication endpoint"""
    
    @validate_input(UserLoginSchema)
    def post(self, data: UserLoginSchema):
        """Authenticate user and return access token"""
        token, user_out = AuthService.authenticate_user(data)
        return to_json({"access_token": token, "user": user_out})

class AuthRefreshAPI(MethodView):
    """Token refresh endpoint"""
    
    @jwt_required()
    def post(self):
        """Refresh the access token for the current user"""
        user_id = get_current_user_id()
        new_token, user_out = AuthService.refresh_user_token(user_id)
        return to_json({"access_token": new_token, "user": user_out})

# register
auth_view = AuthAPI.as_view("register_api")
auth_bp.add_url_rule("/register", view_func=auth_view, methods=["POST"])

# login
login_view = AuthLoginAPI.as_view("login_api")
auth_bp.add_url_rule("/login", view_func=login_view, methods=["POST"])

# refresh token
refresh_view = AuthRefreshAPI.as_view("refresh_api")
auth_bp.add_url_rule("/refresh", view_func=refresh_view, methods=["POST"])
