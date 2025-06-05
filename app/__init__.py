from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from datetime import datetime # For context processor
from config import config_by_name # Import the config dictionary

db = SQLAlchemy()
login_manager = LoginManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name]) # Load config

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'  # The route for login
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        # Since the user_id is just the primary key of our user table,
        # use it in the query for the user
        from .models.user import User
        return User.query.get(int(user_id))

    # Import and register blueprints here
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from .routes.social_accounts import social_accounts_bp
    app.register_blueprint(social_accounts_bp, url_prefix='/social')

    from .routes.posts import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/posts')

    from .routes.main import main_bp
    app.register_blueprint(main_bp) # No prefix for main routes like home page


    @app.context_processor
    def inject_now():
        return {'now': datetime.utcnow}

    return app
