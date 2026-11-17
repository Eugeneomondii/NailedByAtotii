import re
from datetime import datetime
from zoneinfo import ZoneInfo

EAT = ZoneInfo("Africa/Nairobi")


def now_eat() -> datetime:
    """Current Nairobi time as a naive datetime (all stored datetimes are naive EAT)."""
    return datetime.now(EAT).replace(tzinfo=None)


def normalize_phone(raw: str):
    """Return +2547XXXXXXXX / +2541XXXXXXXX, or None if it isn't a valid Kenyan mobile."""
    digits = re.sub(r"[^\d+]", "", raw or "")
    if digits.startswith("+"):
        digits = digits[1:]
    if len(digits) == 10 and digits.startswith("0"):
        digits = "254" + digits[1:]
    elif len(digits) == 9 and digits[0] in "17":
        digits = "254" + digits
    if re.fullmatch(r"254[17]\d{8}", digits):
        return "+" + digits
    return None
