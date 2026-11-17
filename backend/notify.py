"""Notification hooks. Right now they only log; swap the bodies for
Africa's Talking SMS (and a WhatsApp link for the owner) in the next step."""
from flask import current_app


def notify_new_booking(booking):
    current_app.logger.info(
        "[notify] NEW booking #%s from %s for %s",
        booking.id, booking.phone, booking.start_at,
    )


def notify_status_change(booking):
    current_app.logger.info(
        "[notify] booking #%s is now %s (client %s)",
        booking.id, booking.status, booking.phone,
    )
