from app import db # Import db from the app package

class SocialAccount(db.Model):
    __tablename__ = 'social_accounts'  # Optional: specify table name

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Assumes 'user' table name
    platform = db.Column(db.String(50), nullable=False) # e.g., 'twitter', 'facebook', 'linkedin'
    access_token = db.Column(db.String(255), nullable=False)
    access_token_secret = db.Column(db.String(255), nullable=True) # For OAuth1.0a like Twitter
    account_name = db.Column(db.String(100), nullable=True) # e.g., Twitter handle, Facebook page name

    # Define the relationship to the User model
    # The backref 'social_accounts' will allow access to related social accounts from a User object
    user = db.relationship('User', backref=db.backref('social_accounts', lazy=True))

    def __repr__(self):
        return f'<SocialAccount {self.platform}:{self.account_name or self.id} for User {self.user_id}>'
