# app/__init__.py

from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, migrate
from .routes.auth import auth_bp
from .routes.task import task_bp
from .errors import register_error_handlers

def create_app():
    app = Flask(__name__)
    CORS(app, 
         origins=["http://localhost:3000", "http://192.168.1.165:3000"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"])

    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register global error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp)

    return app
