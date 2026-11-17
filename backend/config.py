import os
from datetime import time, timedelta

_db_url = os.getenv("DATABASE_URL", "sqlite:///nails.db")
# Render/Heroku style URLs start with postgres://, SQLAlchemy wants postgresql://
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)


class Config:
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

    # Business rules (all times are East Africa Time, Africa/Nairobi)
    WORK_START = time(8, 0)
    WORK_END = time(18, 0)          # last service must END by this time
    SLOT_STEP_MIN = 30              # slots offered every 30 minutes
    TRAVEL_BUFFER_MIN = 45          # gap kept after each booking for travel
    MIN_NOTICE_HOURS = 3            # no bookings less than 3h from now
    MAX_ADVANCE_DAYS = 60
    CANCEL_CUTOFF_HOURS = 3         # clients can't self-cancel inside this window
    MAX_ACTIVE_BOOKINGS_PER_PHONE = 3
