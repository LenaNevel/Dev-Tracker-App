# backend/app/services/user_service.py
from http import HTTPStatus
from flask_jwt_extended import create_access_token
from app.models import User
from app.errors import APIError
from app.schemas import UserOutSchema, UserProfileUpdateSchema, UserPasswordChangeSchema


class UserService:
    @staticmethod
    def get_user_profile(user_id: int) -> UserOutSchema:
        """
        Get user profile information.
        
        Args:
            user_id: ID of the authenticated user
            
        Returns:
            UserOutSchema: User profile data
            
        Raises:
            APIError: If user not found
        """
        user = User.query.get(user_id)
        if not user:
            raise APIError("User not found", status=HTTPStatus.NOT_FOUND)
        
        return UserOutSchema.model_validate(user)

    @staticmethod
    def update_user_profile(user_id: int, data: UserProfileUpdateSchema) -> UserOutSchema:
        """
        Update user profile information.
        
        Args:
            user_id: ID of the authenticated user
            data: Validated profile update data
            
        Returns:
            UserOutSchema: Updated user profile data
            
        Raises:
            APIError: If user not found or email already exists
        """
        user = User.query.get(user_id)
        if not user:
            raise APIError("User not found", status=HTTPStatus.NOT_FOUND)
        
        # Check if email is being updated and if it's already taken by another user
        if data.email and data.email != user.email:
            existing_user = User.query.filter_by(email=data.email).first()
            if existing_user and existing_user.id != user_id:
                raise APIError("Email already in use", status=HTTPStatus.CONFLICT)
            user.email = data.email
        
        # Update username if provided
        if data.username:
            user.username = data.username
        
        user.save()
        return UserOutSchema.model_validate(user)

    @staticmethod
    def change_user_password(user_id: int, data: UserPasswordChangeSchema) -> UserOutSchema:
        """
        Change user password.
        
        Args:
            user_id: ID of the authenticated user
            data: Validated password change data
            
        Returns:
            UserOutSchema: User profile data
            
        Raises:
            APIError: If user not found, current password incorrect, or passwords don't match
        """
        # Validate password match first
        try:
            data.validate_password_match()
        except ValueError as e:
            raise APIError(str(e), status=HTTPStatus.BAD_REQUEST)
        
        user = User.query.get(user_id)
        if not user:
            raise APIError("User not found", status=HTTPStatus.NOT_FOUND)
        
        # Verify current password
        if not user.check_password(data.current_password):
            raise APIError("Current password is incorrect", status=HTTPStatus.UNAUTHORIZED)
        
        # Set new password
        user.set_password(data.new_password)
        user.save()
        
        return UserOutSchema.model_validate(user)