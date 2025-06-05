from app import db # Import db from the app package
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    social_account_id = db.Column(db.Integer, db.ForeignKey('social_accounts.id'), nullable=True)

    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='draft') # e.g., 'draft', 'scheduled', 'posted', 'failed'
    scheduled_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # User who created the post
    user = db.relationship('User', backref=db.backref('posts', lazy='dynamic'))
    # Social account this post is intended for (if any)
    social_account = db.relationship('SocialAccount', backref=db.backref('posts', lazy='dynamic'))

    # One-to-one relationship with PostAnalytics
    # 'analytics' attribute on Post model will give access to the PostAnalytics object
    # 'post' attribute on PostAnalytics model will give access back to the Post object
    analytics = db.relationship('PostAnalytics', backref='post', uselist=False, cascade="all, delete-orphan")


    def __repr__(self):
        return f'<Post {self.id} (User {self.user_id}) - Status: {self.status}>'
