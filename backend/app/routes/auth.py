from http import HTTPStatus
from app.errors import APIError
from flask import Blueprint, Response
from flask.views import MethodView
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app.extensions import db
from app.schemas import UserRegisterSchema, UserOutSchema, UserLoginSchema
from app.utils import validate_input, to_json

# 1️⃣ Define your Blueprint first
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

class AuthAPI(MethodView):
    @validate_input(UserRegisterSchema)
    def post(self, data: UserRegisterSchema):
        if User.query.filter_by(email=data.email).first():
            raise APIError("Email already registered", status=HTTPStatus.CONFLICT)

        user = User(username=data.username, email=data.email)
        user.set_password(data.password)
        user.save()

        token = create_access_token(identity=user.id)
        user_out = UserOutSchema.model_validate(user)
        return to_json({"access_token": token, "user": user_out}, status=HTTPStatus.CREATED)

class AuthLoginAPI(MethodView):
    @validate_input(UserLoginSchema)
    def post(self, data: UserLoginSchema):
        user = User.query.filter_by(email=data.email).first()
        if not user or not user.check_password(data.password):
            raise APIError("Invalid credentials", status=HTTPStatus.UNAUTHORIZED)

        token = create_access_token(identity=user.id)
        user_out = UserOutSchema.model_validate(user)
        return to_json({"access_token": token, "user": user_out})

class AuthMeAPI(MethodView):
    @jwt_required()
    def get(self) -> Response:
        # Retrieve the user ID stored in the token
        user_id: int = get_jwt_identity()
        # Fetch user or 404
        user = User.query.get_or_404(user_id)
        # Serialize via Pydantic ORM mode
        user_out = UserOutSchema.model_validate(user)
        return to_json(user_out, status=HTTPStatus.OK)

# Register the /me route
me_view = AuthMeAPI.as_view("me_api")
auth_bp.add_url_rule("/me", view_func=me_view, methods=["GET"])

# register
auth_view = AuthAPI.as_view("register_api")
auth_bp.add_url_rule("/register", view_func=auth_view, methods=["POST"])

# login
login_view = AuthLoginAPI.as_view("login_api")
auth_bp.add_url_rule("/login", view_func=login_view, methods=["POST"])
