from datetime import datetime, time, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required

from extensions import db, limiter
from models import (PAYMENT_METHODS, Admin, BlockedPhone, BlockedSlot, Booking,
                    Service, Status)
from notify import notify_status_change
from utils import normalize_phone

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _error(msg, code=400):
    return jsonify({"error": msg}), code


def _dt(value):
    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        return None


# ---------- auth ----------
@admin_bp.post("/login")
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True) or {}
    admin = Admin.query.filter_by(username=(data.get("username") or "").strip()).first()
    if not admin or not admin.check_password(data.get("password") or ""):
        return _error("Invalid username or password", 401)
    return jsonify({"access_token": create_access_token(identity=str(admin.id))})


# ---------- bookings ----------
@admin_bp.get("/bookings")
@jwt_required()
def list_bookings():
    """Filters: ?status=pending&from=2026-11-01&to=2026-11-30"""
    q = Booking.query
    status = request.args.get("status")
    if status:
        if status not in Status.ALL:
            return _error("Unknown status")
        q = q.filter_by(status=status)
    if request.args.get("from"):
        d = _dt(request.args["from"])
        if d:
            q = q.filter(Booking.start_at >= datetime.combine(d.date(), time.min))
    if request.args.get("to"):
        d = _dt(request.args["to"])
        if d:
            q = q.filter(Booking.start_at < datetime.combine(d.date(), time.min) + timedelta(days=1))
    bookings = q.order_by(Booking.start_at).all()
    return jsonify([b.to_dict(admin=True) for b in bookings])


@admin_bp.get("/bookings/<int:booking_id>")
@jwt_required()
def get_booking(booking_id):
    return jsonify(db.get_or_404(Booking, booking_id).to_dict(admin=True))


@admin_bp.patch("/bookings/<int:booking_id>/status")
@jwt_required()
def update_status(booking_id):
    """Body: {"status": "confirmed"}
    completed -> also send payment_method ("cash"|"mpesa") and optional amount_paid
    no_show   -> optionally send "blocklist": true to block the number"""
    booking = db.get_or_404(Booking, booking_id)
    data = request.get_json(silent=True) or {}
    new = data.get("status")

    if new not in Status.ALL:
        return _error("Unknown status")
    if new not in Status.TRANSITIONS[booking.status]:
        return _error(f"Can't change a {booking.status} booking to {new}")

    if new == Status.COMPLETED:
        method = data.get("payment_method")
        if method not in PAYMENT_METHODS:
            return _error("Record how the client paid: cash or mpesa")
        amount = data.get("amount_paid", booking.service.price)
        if not isinstance(amount, int) or amount < 0:
            return _error("amount_paid must be a whole number (KES)")
        booking.payment_method, booking.amount_paid = method, amount

    if new == Status.NO_SHOW and data.get("blocklist"):
        if not BlockedPhone.query.filter_by(phone=booking.phone).first():
            db.session.add(BlockedPhone(phone=booking.phone, reason="No-show"))

    booking.status = new
    db.session.commit()
    notify_status_change(booking)
    return jsonify(booking.to_dict(admin=True))


# ---------- blocked time ----------
@admin_bp.get("/blocked-slots")
@jwt_required()
def list_blocked_slots():
    return jsonify([s.to_dict() for s in BlockedSlot.query.order_by(BlockedSlot.start_at)])


@admin_bp.post("/blocked-slots")
@jwt_required()
def add_blocked_slot():
    """Body: {"start_at": "2026-11-02T00:00", "ends_at": "2026-11-02T23:59", "reason": "Off"}"""
    data = request.get_json(silent=True) or {}
    start, end = _dt(data.get("start_at")), _dt(data.get("ends_at"))
    if not start or not end or end <= start:
        return _error("Provide valid start_at and ends_at (ISO format), end after start")
    slot = BlockedSlot(start_at=start, ends_at=end, reason=data.get("reason"))
    db.session.add(slot)
    db.session.commit()
    return jsonify(slot.to_dict()), 201


@admin_bp.delete("/blocked-slots/<int:slot_id>")
@jwt_required()
def delete_blocked_slot(slot_id):
    db.session.delete(db.get_or_404(BlockedSlot, slot_id))
    db.session.commit()
    return "", 204


# ---------- blocklist ----------
@admin_bp.get("/blocked-phones")
@jwt_required()
def list_blocked_phones():
    return jsonify([p.to_dict() for p in BlockedPhone.query.all()])


@admin_bp.post("/blocked-phones")
@jwt_required()
def add_blocked_phone():
    data = request.get_json(silent=True) or {}
    phone = normalize_phone(data.get("phone"))
    if not phone:
        return _error("Invalid phone number")
    if BlockedPhone.query.filter_by(phone=phone).first():
        return _error("Already blocked", 409)
    entry = BlockedPhone(phone=phone, reason=data.get("reason"))
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


@admin_bp.delete("/blocked-phones/<int:entry_id>")
@jwt_required()
def delete_blocked_phone(entry_id):
    db.session.delete(db.get_or_404(BlockedPhone, entry_id))
    db.session.commit()
    return "", 204


# ---------- services ----------
@admin_bp.get("/services")
@jwt_required()
def list_all_services():
    return jsonify([s.to_dict() for s in Service.query.order_by(Service.name)])


@admin_bp.post("/services")
@jwt_required()
def create_service():
    data = request.get_json(silent=True) or {}
    try:
        service = Service(
            name=data["name"].strip(),
            description=data.get("description"),
            price=int(data["price"]),
            duration_min=int(data["duration_min"]),
        )
    except (KeyError, ValueError, AttributeError):
        return _error("name, price and duration_min are required")
    if service.price < 0 or service.duration_min <= 0:
        return _error("Invalid price or duration")
    if Service.query.filter_by(name=service.name).first():
        return _error("A service with that name exists", 409)
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201


@admin_bp.patch("/services/<int:service_id>")
@jwt_required()
def update_service(service_id):
    service = db.get_or_404(Service, service_id)
    data = request.get_json(silent=True) or {}
    try:
        if "name" in data:
            service.name = data["name"].strip()
        if "description" in data:
            service.description = data["description"]
        if "price" in data:
            service.price = int(data["price"])
        if "duration_min" in data:
            service.duration_min = int(data["duration_min"])
        if "is_active" in data:
            service.is_active = bool(data["is_active"])
    except (ValueError, AttributeError):
        return _error("Invalid value")
    db.session.commit()
    return jsonify(service.to_dict())
