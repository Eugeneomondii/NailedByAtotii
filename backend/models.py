import secrets
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from utils import now_eat


class Status:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

    ALL = {PENDING, CONFIRMED, DECLINED, COMPLETED, CANCELLED, NO_SHOW}
    # Statuses that occupy the calendar
    ACTIVE = (PENDING, CONFIRMED)
    # Allowed admin transitions
    TRANSITIONS = {
        PENDING: {CONFIRMED, DECLINED, CANCELLED},
        CONFIRMED: {COMPLETED, CANCELLED, NO_SHOW},
        DECLINED: set(),
        COMPLETED: set(),
        CANCELLED: set(),
        NO_SHOW: set(),
    }


PAYMENT_METHODS = {"cash", "mpesa"}


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    description = db.Column(db.String(255))
    price = db.Column(db.Integer, nullable=False)           # KES
    duration_min = db.Column(db.Integer, nullable=False)    # service time only
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "duration_min": self.duration_min,
            "is_active": self.is_active,
        }


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    # Secret token the client uses to view/cancel their own booking (no login needed)
    token = db.Column(db.String(32), unique=True, nullable=False,
                      default=lambda: secrets.token_urlsafe(16))

    client_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(16), nullable=False, index=True)

    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    service = db.relationship("Service")

    start_at = db.Column(db.DateTime, nullable=False, index=True)
    # start + duration + travel buffer, so overlap checks also protect travel time
    ends_at = db.Column(db.DateTime, nullable=False)

    area = db.Column(db.String(80), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.String(500))
    reference_photo_url = db.Column(db.String(500))

    status = db.Column(db.String(12), nullable=False, default=Status.PENDING, index=True)

    # Filled in after the service (payment happens after, not before)
    payment_method = db.Column(db.String(10))
    amount_paid = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, default=now_eat, nullable=False)
    updated_at = db.Column(db.DateTime, default=now_eat, onupdate=now_eat, nullable=False)

    def to_dict(self, admin=False):
        data = {
            "token": self.token,
            "client_name": self.client_name,
            "service": self.service.to_dict() if self.service else None,
            "date": self.start_at.strftime("%Y-%m-%d"),
            "time": self.start_at.strftime("%H:%M"),
            "area": self.area,
            "address": self.address,
            "status": self.status,
        }
        if admin:
            data.update({
                "id": self.id,
                "phone": self.phone,
                "notes": self.notes,
                "reference_photo_url": self.reference_photo_url,
                "payment_method": self.payment_method,
                "amount_paid": self.amount_paid,
                "created_at": self.created_at.isoformat(),
            })
        return data


class BlockedSlot(db.Model):
    """Time she is unavailable (a full day or part of one)."""
    __tablename__ = "blocked_slots"

    id = db.Column(db.Integer, primary_key=True)
    start_at = db.Column(db.DateTime, nullable=False)
    ends_at = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(120))

    def to_dict(self):
        return {
            "id": self.id,
            "start_at": self.start_at.isoformat(),
            "ends_at": self.ends_at.isoformat(),
            "reason": self.reason,
        }


class BlockedPhone(db.Model):
    """Blocklist for repeat no-shows."""
    __tablename__ = "blocked_phones"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(16), unique=True, nullable=False)
    reason = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=now_eat, nullable=False)

    def to_dict(self):
        return {"id": self.id, "phone": self.phone, "reason": self.reason}


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)
