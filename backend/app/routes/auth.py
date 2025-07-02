from http import HTTPStatus
from app.errors import APIError
from flask import Blueprint, Response
from flask.views import MethodView
from flask_jwt_extended import create_access_token
from app.models import User
from app.extensions import db
from app.schemas import UserRegisterSchema, UserOutSchema, UserLoginSchema
from app.utils import validate_input, to_json

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

# register
auth_view = AuthAPI.as_view("register_api")
auth_bp.add_url_rule("/register", view_func=auth_view, methods=["POST"])

# login
login_view = AuthLoginAPI.as_view("login_api")
auth_bp.add_url_rule("/login", view_func=login_view, methods=["POST"])
