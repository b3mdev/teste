from app import db # Import db from the app package
from datetime import datetime

class PostAnalytics(db.Model):
    __tablename__ = 'post_analytics'

    id = db.Column(db.Integer, primary_key=True)
    # Unique=True enforces a one-to-one relationship from the PostAnalytics side.
    # A post can only have one PostAnalytics entry.
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), unique=True, nullable=False)

    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    reach = db.Column(db.Integer, default=0, nullable=True) # Platform-dependent, might not always be available

    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # The backref 'analytics' will be added to the Post model.
    # uselist=False on the Post side's relationship will establish one-to-one.
    # Here, the relationship is defined from the 'many' (or 'one' in one-to-one) side.
    # The Post model will have an 'analytics' attribute that refers to this single PostAnalytics instance.
    # 'post' attribute here refers to the Post object this analytics entry belongs to.
    # This is handled by the backref on the Post model.

    # We will define the direct relationship attribute on the Post model for `post.analytics`
    # and use `backref` there to create `analytics_entry.post`.

    def __repr__(self):
        return f'<PostAnalytics for Post {self.post_id} - Likes: {self.likes}>'
