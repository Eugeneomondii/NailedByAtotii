import click
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, jwt, limiter, migrate
from models import Admin, Service


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    from routes_admin import admin_bp
    from routes_public import public_bp
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(429)
    def too_many(_):
        return jsonify({"error": "Too many requests. Please try again later."}), 429

    register_cli(app)
    return app


def register_cli(app):
    @app.cli.command("create-admin")
    @click.argument("username")
    @click.password_option()
    def create_admin(username, password):
        """Create the owner's admin login."""
        admin = Admin(username=username)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        click.echo(f"Admin '{username}' created.")

    @app.cli.command("seed-services")
    def seed_services():
        """Insert Nailed by Atoti's services. Durations are guesses: confirm with her."""
        samples = [
            ("Toe Nails (Plain)", 300, 45, "Plain toe nails, total price"),
            ("Tips & Gel", 500, 90, "Tips and gel, total price"),
            ("Builder Gel (Plain Nails)", 500, 90, "Builder gel on natural-length nails, total price"),
            ("Builder Gel (Extended)", 800, 120, "Builder gel with extension, total price"),
            ("Pedicure", 800, 75, "Paint included"),
        ]
        for name, price, mins, desc in samples:
            if not Service.query.filter_by(name=name).first():
                db.session.add(Service(name=name, price=price, duration_min=mins, description=desc))
        db.session.commit()
        click.echo("Services added.")