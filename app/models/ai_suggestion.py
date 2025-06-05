from app import db # Import db from the app package
from datetime import datetime

class AISuggestion(db.Model):
    __tablename__ = 'ai_suggestions'

    id = db.Column(db.Integer, primary_key=True)
    # If a suggestion is tied directly to an existing post being edited
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=True)
    # User for whom the suggestion was generated
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    suggestion_type = db.Column(db.String(100), nullable=False) # e.g., 'content_idea', 'hashtag', 'best_time_to_post', 'rewrite'
    suggestion_content = db.Column(db.Text, nullable=False) # The actual suggestion text or data

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    # Post for which this suggestion was made (if applicable)
    post = db.relationship('Post', backref=db.backref('ai_suggestions', lazy='dynamic'))
    # User who received this suggestion
    user = db.relationship('User', backref=db.backref('ai_suggestions', lazy='dynamic'))

    def __repr__(self):
        return f'<AISuggestion {self.id} (Type: {self.suggestion_type}) for User {self.user_id}>'
