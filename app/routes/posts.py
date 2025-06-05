from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app.models import Post, SocialAccount, AISuggestion, PostAnalytics # Added PostAnalytics
from app import db
from datetime import datetime
from ai.content_suggestion import generate_suggestions # Import the AI service
import random # For dummy analytics

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/create_post', methods=['GET', 'POST'])
@login_required
def create_post():
    user_social_accounts = SocialAccount.query.filter_by(user_id=current_user.id).all()
    if not user_social_accounts:
        flash('You need to add at least one social account before creating a post.', 'warning')
        return redirect(url_for('social_accounts.view_accounts'))

    if request.method == 'POST':
        content = request.form.get('content')
        status = request.form.get('status', 'draft')
        scheduled_at_str = request.form.get('scheduled_at')
        social_account_id = request.form.get('social_account_id')

        if not content:
            flash('Content is required.', 'danger')
            return render_template('create_post.html', social_accounts=user_social_accounts)

        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = datetime.strptime(scheduled_at_str, '%Y-%m-%dT%H:%M')
                if status == 'draft' and scheduled_at: # If user provides schedule time but status is draft
                    status = 'scheduled'
            except ValueError:
                flash('Invalid datetime format for scheduled date. Use YYYY-MM-DDTHH:MM.', 'danger')
                return render_template('create_post.html', social_accounts=user_social_accounts, content=content)

        if status == 'scheduled' and not scheduled_at:
            flash('Scheduled date is required for scheduled posts.', 'danger')
            return render_template('create_post.html', social_accounts=user_social_accounts, content=content, status=status)


        post = Post(
            user_id=current_user.id,
            social_account_id=int(social_account_id) if social_account_id else None,
            content=content,
            status=status,
            scheduled_at=scheduled_at
        )
        db.session.add(post)
        db.session.commit()
        flash('Post created successfully!', 'success')
        return redirect(url_for('posts.view_all_posts'))

    return render_template('create_post.html', social_accounts=user_social_accounts)

@posts_bp.route('/posts')
@login_required
def view_all_posts():
    # Query posts by the current user, optionally join with social_account to display its name
    page = request.args.get('page', 1, type=int)
    posts_pagination = Post.query.filter_by(user_id=current_user.id)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=10) # Adjust per_page as needed
    return render_template('view_posts.html', posts_pagination=posts_pagination)

@posts_bp.route('/edit_post/<int:post_id>', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        flash('You are not authorized to edit this post.', 'danger')
        return redirect(url_for('posts.view_all_posts'))

    user_social_accounts = SocialAccount.query.filter_by(user_id=current_user.id).all()

    if request.method == 'POST':
        post.content = request.form.get('content')
        post.status = request.form.get('status', 'draft')
        scheduled_at_str = request.form.get('scheduled_at')
        post.social_account_id = request.form.get('social_account_id')

        if not post.content:
            flash('Content is required.', 'danger')
            return render_template('edit_post.html', post=post, social_accounts=user_social_accounts)

        if scheduled_at_str:
            try:
                post.scheduled_at = datetime.strptime(scheduled_at_str, '%Y-%m-%dT%H:%M')
                if post.status == 'draft' and post.scheduled_at:
                     post.status = 'scheduled'
            except ValueError:
                flash('Invalid datetime format for scheduled date. Use YYYY-MM-DDTHH:MM.', 'danger')
                return render_template('edit_post.html', post=post, social_accounts=user_social_accounts)
        else:
            post.scheduled_at = None # Clear it if not provided

        if post.status == 'scheduled' and not post.scheduled_at:
            flash('Scheduled date is required for scheduled posts.', 'danger')
            return render_template('edit_post.html', post=post, social_accounts=user_social_accounts)

        db.session.commit()
        flash('Post updated successfully!', 'success')
        return redirect(url_for('posts.view_all_posts'))

    # For GET request, pre-fill the form
    scheduled_at_value = post.scheduled_at.strftime('%Y-%m-%dT%H:%M') if post.scheduled_at else ''
    return render_template('edit_post.html', post=post, social_accounts=user_social_accounts, scheduled_at_value=scheduled_at_value)

@posts_bp.route('/delete_post/<int:post_id>', methods=['POST'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        flash('You are not authorized to delete this post.', 'danger')
        return redirect(url_for('posts.view_all_posts'))

    db.session.delete(post)
    db.session.commit()
    flash('Post deleted successfully.', 'success')
    return redirect(url_for('posts.view_all_posts'))

@posts_bp.route('/get_ai_suggestions', methods=['POST'])
@login_required
def get_ai_suggestions_route():
    post_content = request.json.get('content', '')
    suggestion_type = request.json.get('type', 'general') # e.g., 'content_idea', 'hashtag', 'rewrite'

    # Call the AI service
    # We pass current_user.id if we want to store suggestions or tailor them
    suggestions_data = generate_suggestions(post_content=post_content, user_id=current_user.id, suggestion_type=suggestion_type)

    # For now, we are not saving these suggestions to the AISuggestion table automatically.
    # The user would choose to use them. If we wanted to save every suggestion generated:
    # for sugg_item in suggestions_data:
    #     suggestion_record = AISuggestion(
    #         user_id=current_user.id,
    #         # post_id=relevant_post_id, # If tied to a specific post draft
    #         suggestion_type=sugg_item.get("type"),
    #         suggestion_content=sugg_item.get("content")
    #     )
    #     db.session.add(suggestion_record)
    # db.session.commit()

    return jsonify(suggestions=suggestions_data)

@posts_bp.route('/post/<int:post_id>/analytics', methods=['GET', 'POST'])
@login_required
def view_post_analytics(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        flash('You are not authorized to view analytics for this post.', 'danger')
        return redirect(url_for('posts.view_all_posts'))

    if request.method == 'POST': # "Refresh" or add dummy data
        if not post.analytics:
            # Create analytics entry if it doesn't exist
            post.analytics = PostAnalytics(post_id=post.id)
            # If we want to commit this creation immediately before updating with random values
            # db.session.add(post.analytics)
            # db.session.commit()

        # Update with new dummy data
        post.analytics.likes = random.randint(0, 1000)
        post.analytics.comments = random.randint(0, 200)
        post.analytics.shares = random.randint(0, 100)
        post.analytics.reach = random.randint(100, 5000) if post.social_account_id else 0 # Only if posted to a platform
        post.analytics.last_updated = datetime.utcnow()

        db.session.commit()
        flash(f'Dummy analytics data refreshed for Post {post.id}.', 'success')
        return redirect(url_for('posts.view_post_analytics', post_id=post.id))

    # For GET request, display existing analytics or prompt to create/refresh
    # If analytics don't exist yet, we can initialize a placeholder or create on first view
    if not post.analytics:
        # Option 1: Create it on first view with default (0) values
        post.analytics = PostAnalytics(post_id=post.id)
        db.session.add(post.analytics) # Add to session
        db.session.commit() # Commit to get an ID and ensure it's in DB
        flash('Initialized empty analytics record for this post. Refresh to get dummy data.', 'info')
        # Option 2: Or, pass None and let template handle it
        # analytics_data = None

    analytics_data = post.analytics
    return render_template('view_post_analytics.html', post=post, analytics=analytics_data)
