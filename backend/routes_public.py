from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, request

from extensions import db, limiter
from models import BlockedPhone, Booking, Service, Status
from notify import notify_new_booking, notify_status_change
from slots import get_free_slots
from utils import normalize_phone, now_eat

public_bp = Blueprint("public", __name__, url_prefix="/api")


def _error(msg, code=400):
    return jsonify({"error": msg}), code


def _parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


@public_bp.get("/services")
def list_services():
    services = Service.query.filter_by(is_active=True).order_by(Service.price).all()
    return jsonify([s.to_dict() for s in services])


@public_bp.get("/availability")
def availability():
    """GET /api/availability?date=2026-11-02&service_id=1 -> {"slots": ["08:00", ...]}"""
    day = _parse_date(request.args.get("date"))
    service = db.session.get(Service, request.args.get("service_id", type=int) or 0)
    if not day:
        return _error("date is required in YYYY-MM-DD format")
    if not service or not service.is_active:
        return _error("Unknown service", 404)
    return jsonify({"date": day.isoformat(), "slots": get_free_slots(day, service.duration_min)})


@public_bp.post("/bookings")
@limiter.limit("5 per hour")
def create_booking():
    data = request.get_json(silent=True) or {}
    cfg = current_app.config

    name = (data.get("client_name") or "").strip()
    phone = normalize_phone(data.get("phone"))
    area = (data.get("area") or "").strip()
    address = (data.get("address") or "").strip()
    notes = (data.get("notes") or "").strip() or None
    photo = (data.get("reference_photo_url") or "").strip() or None
    day = _parse_date(data.get("date"))
    service = db.session.get(Service, data.get("service_id") or 0)

    if not 2 <= len(name) <= 80:
        return _error("Please enter your name")
    if not phone:
        return _error("Please enter a valid Kenyan phone number, e.g. 0712345678")
    if not area or not address:
        return _error("Please enter your area and address so she can find you")
    if len(address) > 255 or (notes and len(notes) > 500):
        return _error("Address or notes too long")
    if not service or not service.is_active:
        return _error("Please choose a service")
    if not day:
        return _error("Please choose a date")
    try:
        start_at = datetime.combine(day, datetime.strptime(data.get("time") or "", "%H:%M").time())
    except ValueError:
        return _error("Please choose a time")

    if BlockedPhone.query.filter_by(phone=phone).first():
        return _error("Sorry, we can't take online bookings from this number. "
                      "Please contact her on WhatsApp.", 403)

    active_count = Booking.query.filter(
        Booking.phone == phone, Booking.status.in_(Status.ACTIVE),
        Booking.start_at >= now_eat(),
    ).count()
    if active_count >= cfg["MAX_ACTIVE_BOOKINGS_PER_PHONE"]:
        return _error("You already have several upcoming bookings. "
                      "Please cancel one or contact her directly.")

    # The slot must be one the availability logic would offer right now
    if start_at.strftime("%H:%M") not in get_free_slots(day, service.duration_min):
        return _error("That time is no longer available. Please pick another slot.", 409)

    booking = Booking(
        client_name=name, phone=phone, service=service,
        start_at=start_at,
        ends_at=start_at + timedelta(minutes=service.duration_min + cfg["TRAVEL_BUFFER_MIN"]),
        area=area, address=address, notes=notes, reference_photo_url=photo,
    )
    db.session.add(booking)
    db.session.commit()
    notify_new_booking(booking)

    return jsonify({
        "message": "Request received! You'll get a confirmation once she approves it. "
                   "Payment is after your service.",
        "booking": booking.to_dict(),
    }), 201


@public_bp.get("/bookings/<token>")
def get_booking(token):
    booking = Booking.query.filter_by(token=token).first_or_404()
    return jsonify(booking.to_dict())


@public_bp.post("/bookings/<token>/cancel")
def cancel_booking(token):
    booking = Booking.query.filter_by(token=token).first_or_404()
    if booking.status not in Status.ACTIVE:
        return _error("This booking can no longer be cancelled")

    cutoff = booking.start_at - timedelta(hours=current_app.config["CANCEL_CUTOFF_HOURS"])
    if now_eat() > cutoff:
        return _error("It's too close to your appointment to cancel online. "
                      "Please contact her directly on WhatsApp.")

    booking.status = Status.CANCELLED
    db.session.commit()
    notify_status_change(booking)
    return jsonify(booking.to_dict())
