from tests.base import BaseTestCase
from app.models import User
from app import db

class TestUserModel(BaseTestCase):

    def test_user_creation(self):
        """Test if a user can be created."""
        user = User(username='newuser', email='newuser@example.com')
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()

        retrieved_user = User.query.filter_by(username='newuser').first()
        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.email, 'newuser@example.com')

    def test_password_hashing(self):
        """Test password hashing and checking."""
        user = User(username='testpass', email='testpass@example.com')
        user.set_password('securepassword')
        db.session.add(user)
        db.session.commit()

        self.assertNotEqual(user.password_hash, 'securepassword')
        self.assertTrue(user.check_password('securepassword'))
        self.assertFalse(user.check_password('wrongpassword'))

    def test_username_uniqueness(self):
        """Test username uniqueness constraint."""
        user1 = User(username='uniqueuser', email='user1@example.com')
        user1.set_password('pass1')
        db.session.add(user1)
        db.session.commit()

        user2 = User(username='uniqueuser', email='user2@example.com')
        user2.set_password('pass2')
        db.session.add(user2)

        with self.assertRaises(Exception) as context: # SQLAlchemy raises IntegrityError
            db.session.commit()
        # Depending on the DB and SQLAlchemy version, the error message might vary.
        # For SQLite, it's often an IntegrityError.
        self.assertTrue('UNIQUE constraint failed' in str(context.exception) or \
                        'IntegrityError' in str(context.exception.__class__.__name__))
        db.session.rollback() # Rollback the failed transaction

    def test_email_uniqueness(self):
        """Test email uniqueness constraint."""
        user1 = User(username='userA', email='uniqueemail@example.com')
        user1.set_password('passA')
        db.session.add(user1)
        db.session.commit()

        user2 = User(username='userB', email='uniqueemail@example.com')
        user2.set_password('passB')
        db.session.add(user2)

        with self.assertRaises(Exception) as context:
            db.session.commit()
        self.assertTrue('UNIQUE constraint failed' in str(context.exception) or \
                        'IntegrityError' in str(context.exception.__class__.__name__))
        db.session.rollback()

    def test_repr(self):
        """Test the __repr__ method."""
        user = User(username='repruser', email='repr@example.com')
        user.set_password('password')
        db.session.add(user)
        db.session.commit()
        self.assertEqual(repr(user), '<User repruser>')

if __name__ == '__main__':
    import unittest
    unittest.main()
