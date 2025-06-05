from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User # Corrected import for User
from app import db # Corrected import for db


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        flash('You are already registered and logged in!', 'info')
        return redirect(url_for('auth.login')) # Redirect to login or a dashboard
    # Add form handling here later
    # For now, POST request will just flash a message and redirect
    if request.method == 'POST':
        # Simulate form processing
        flash('Registration submitted (not implemented). Please login.', 'success')
        # Real registration logic:
        # form = RegistrationForm()
        # if form.validate_on_submit():
        #     username = form.username.data
        #     email = form.email.data
        #     password = form.password.data
        #     user = User(username=username, email=email)
        #     user.set_password(password)
        #     db.session.add(user)
        #     db.session.commit()
        #     login_user(user) # Consider if login after registration is desired
        #     flash('Registration successful! Please login.', 'success')
        #     return redirect(url_for('auth.login'))
        # else:
        #     flash('Registration Unsuccessful. Please check your input.', 'danger')
        return redirect(url_for('auth.login')) # Redirect to login after POST
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        flash('You are already logged in!', 'info')
        return redirect(url_for('auth.login')) # Redirect to a dashboard or home
    # Add form handling here later
    if request.method == 'POST':
        # Simulate form processing and login
        flash('Login attempt (not implemented).', 'warning')
        # Real login logic:
        # form = LoginForm()
        # if form.validate_on_submit():
        #     user = User.query.filter_by(email=form.email.data).first()
        #     if user and user.check_password(form.password.data):
        #         login_user(user, remember=form.remember_me.data)
        #         next_page = request.args.get('next')
        #         flash('Login Successful!', 'success')
        #         return redirect(next_page) if next_page else redirect(url_for('auth.login')) # or a dashboard
        #     else:
        #         flash('Login Unsuccessful. Please check email and password', 'danger')
        return redirect(url_for('auth.login')) # Redirect back to login after POST
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('auth.login'))
