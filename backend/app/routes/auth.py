from flask import Blueprint, request, jsonify
from app.models import User
from app.extensions import db
from flask_jwt_extended import create_access_token
from app.schemas import UserRegisterSchema, UserOutSchema
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = UserRegisterSchema.model_validate(request.get_json())
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    if User.query.filter_by(email=data.email).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(username=data.username, email=data.email)
    user.set_password(data.password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "User could not be created"}), 500

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "user": UserOutSchema.model_validate(user.to_dict()).model_dump()
    }), 201
