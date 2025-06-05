import unittest
from flask_testing import TestCase
from app import create_app, db
# Import your models here to create them in the test DB
from app.models import User, SocialAccount, Post, AISuggestion, PostAnalytics

class BaseTestCase(TestCase):
    """ Base Tests """

    def create_app(self):
        """Create an instance of the app with testing configuration."""
        app = create_app(config_name='testing')
        # You might need to set additional configurations here if they are not in TestingConfig
        # For example, if you use Flask-WTF CSRF protection and want to disable it for tests:
        # app.config['WTF_CSRF_ENABLED'] = False
        # app.config['LOGIN_DISABLED'] = False # If you use Flask-Login and want to test login
        return app

    def setUp(self):
        """Set up for each test."""
        db.create_all()
        # You can add initial data creation here if needed for all or most tests
        # Example:
        # user = User(username='testuser', email='test@example.com')
        # user.set_password('testpassword')
        # db.session.add(user)
        # db.session.commit()

    def tearDown(self):
        """Tear down after each test."""
        db.session.remove()
        db.drop_all()

if __name__ == '__main__':
    unittest.main()
