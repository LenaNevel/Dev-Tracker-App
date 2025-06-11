# backend/app/models.py

from datetime import datetime
from http import HTTPStatus
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.errors import APIError


class CRUDMixin:
    """
    Mixin that adds .save() and .delete() methods to a SQLAlchemy model,
    handling session commits, rollbacks, and raising an APIError on failure.
    """
    def save(self):
        try:
            db.session.add(self)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            raise APIError(
                "Database error",
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
                original=e
            )
        return self

    def delete(self):
        try:
            db.session.delete(self)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            raise APIError(
                "Database error",
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
                original=e
            )


class User(CRUDMixin, db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }
