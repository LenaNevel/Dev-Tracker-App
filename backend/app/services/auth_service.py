# backend/app/services/auth_service.py
from http import HTTPStatus
from flask_jwt_extended import create_access_token
from app.models import User
from app.errors import APIError
from app.schemas import UserRegisterSchema, UserLoginSchema, UserOutSchema


class AuthService:
    @staticmethod
    def register_user(data: UserRegisterSchema) -> tuple[str, UserOutSchema]:
        """
        Register a new user and return access token and user data.
        
        Args:
            data: Validated user registration data
            
        Returns:
            tuple: (access_token, user_data)
            
        Raises:
            APIError: If email already exists
        """
        if User.query.filter_by(email=data.email).first():
            raise APIError("Email already registered", status=HTTPStatus.CONFLICT)

        user = User(username=data.username, email=data.email)
        user.set_password(data.password)
        user.save()

        token = create_access_token(identity=str(user.id))
        user_out = UserOutSchema.model_validate(user)
        
        return token, user_out

    @staticmethod
    def authenticate_user(data: UserLoginSchema) -> tuple[str, UserOutSchema]:
        """
        Authenticate user and return access token and user data.
        
        Args:
            data: Validated user login data
            
        Returns:
            tuple: (access_token, user_data)
            
        Raises:
            APIError: If credentials are invalid
        """
        user = User.query.filter_by(email=data.email).first()
        if not user or not user.check_password(data.password):
            raise APIError("Invalid credentials", status=HTTPStatus.UNAUTHORIZED)

        token = create_access_token(identity=str(user.id))
        user_out = UserOutSchema.model_validate(user)
        
        return token, user_out

    @staticmethod
    def refresh_user_token(user_id: int) -> tuple[str, UserOutSchema]:
        """
        Refresh access token for authenticated user.
        
        Args:
            user_id: ID of the authenticated user
            
        Returns:
            tuple: (new_access_token, user_data)
            
        Raises:
            APIError: If user not found
        """
        user = User.query.get(user_id)
        if not user:
            raise APIError("User not found", status=HTTPStatus.NOT_FOUND)
        
        new_token = create_access_token(identity=str(user.id))
        user_out = UserOutSchema.model_validate(user)
        
        return new_token, user_out