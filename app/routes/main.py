from flask import Blueprint, render_template
from flask_login import current_user # Import current_user if needed for the main page logic

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/index')
def index():
    # You can pass data to your template if needed, e.g., featured posts, user stats, etc.
    return render_template('index.html', title='Welcome')

@main_bp.route('/mapview')
def map_view():
    return render_template('map_view.html', title='Mapa Interativo')
