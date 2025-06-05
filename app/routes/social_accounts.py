from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
# Assuming your models and db are set up to be imported like this:
from app.models import SocialAccount, User
from app import db

social_accounts_bp = Blueprint('social_accounts', __name__)

@social_accounts_bp.route('/add_account/<platform>', methods=['GET', 'POST'])
@login_required
def add_account(platform):
    # In a real app, this would involve OAuth flow with the platform
    if request.method == 'POST':
        # Dummy data for now
        access_token = request.form.get('access_token', f'dummy_token_for_{platform}')
        account_name = request.form.get('account_name', f'{current_user.username}_{platform}')

        # Check if account already exists for this user and platform
        existing_account = SocialAccount.query.filter_by(user_id=current_user.id, platform=platform).first()
        if existing_account:
            flash(f'You already have a {platform.capitalize()} account linked.', 'info')
            return redirect(url_for('social_accounts.view_accounts'))

        new_account = SocialAccount(
            user_id=current_user.id,
            platform=platform,
            access_token=access_token, # Store securely in a real app
            account_name=account_name
        )
        db.session.add(new_account)
        db.session.commit()
        flash(f'{platform.capitalize()} account added successfully!', 'success')
        return redirect(url_for('social_accounts.view_accounts'))

    # For GET request, show a form or instructions
    return render_template('add_social_account.html', platform=platform)

@social_accounts_bp.route('/accounts')
@login_required
def view_accounts():
    accounts = SocialAccount.query.filter_by(user_id=current_user.id).all()
    return render_template('view_social_accounts.html', accounts=accounts)

@social_accounts_bp.route('/remove_account/<int:account_id>', methods=['POST'])
@login_required
def remove_account(account_id):
    account = SocialAccount.query.get_or_404(account_id)
    if account.user_id != current_user.id:
        flash('You are not authorized to remove this account.', 'danger')
        return redirect(url_for('social_accounts.view_accounts'))

    db.session.delete(account)
    db.session.commit()
    flash(f'{account.platform.capitalize()} account removed successfully.', 'success')
    return redirect(url_for('social_accounts.view_accounts'))
