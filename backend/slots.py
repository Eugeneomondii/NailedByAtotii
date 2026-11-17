from datetime import datetime, time, timedelta

from flask import current_app

from extensions import db
from models import BlockedSlot, Booking, Status
from utils import now_eat


def _busy_intervals(day):
    day_start = datetime.combine(day, time.min)
    day_end = day_start + timedelta(days=1)
    busy = [
        (b.start_at, b.ends_at)
        for b in Booking.query.filter(
            Booking.status.in_(Status.ACTIVE),
            Booking.start_at < day_end,
            Booking.ends_at > day_start,
        )
    ]
    busy += [
        (s.start_at, s.ends_at)
        for s in BlockedSlot.query.filter(
            BlockedSlot.start_at < day_end, BlockedSlot.ends_at > day_start
        )
    ]
    return busy


def get_free_slots(day, duration_min: int):
    """Return a list of 'HH:MM' start times that are bookable on `day`."""
    cfg = current_app.config
    now = now_eat()

    if day > now.date() + timedelta(days=cfg["MAX_ADVANCE_DAYS"]):
        return []

    earliest = now + timedelta(hours=cfg["MIN_NOTICE_HOURS"])
    open_dt = datetime.combine(day, cfg["WORK_START"])
    close_dt = datetime.combine(day, cfg["WORK_END"])
    service = timedelta(minutes=duration_min)
    needed = service + timedelta(minutes=cfg["TRAVEL_BUFFER_MIN"])
    step = timedelta(minutes=cfg["SLOT_STEP_MIN"])
    busy = _busy_intervals(day)

    slots, t = [], open_dt
    while t + service <= close_dt:
        clash = any(t < b_end and t + needed > b_start for b_start, b_end in busy)
        if t >= earliest and not clash:
            slots.append(t.strftime("%H:%M"))
        t += step
    return slots
