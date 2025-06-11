# app/__init__.py

from flask import Flask
from .config import Config
from .extensions import db, jwt, migrate
from .routes.auth import auth_bp
from .errors import register_error_handlers

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register global error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(auth_bp)

    return app
