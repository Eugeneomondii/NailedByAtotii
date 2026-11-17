"""Run: python test_smoke.py  (uses an in-memory database)"""
from datetime import timedelta

from app import create_app
from config import Config
from extensions import db
from models import Admin, Service
from utils import now_eat


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    RATELIMIT_ENABLED = False
    TESTING = True


app = create_app(TestConfig)


def run():
    with app.app_context():
        db.create_all()
        db.session.add(Service(name="Gel", price=1500, duration_min=60))
        a = Admin(username="owner"); a.set_password("secret123")
        db.session.add(a); db.session.commit()

    c = app.test_client()
    day = (now_eat() + timedelta(days=2)).date().isoformat()

    slots = c.get(f"/api/availability?date={day}&service_id=1").get_json()["slots"]
    assert slots and slots[0] == "08:00", slots

    payload = {"client_name": "Amina", "phone": "0712 345 678", "service_id": 1,
               "date": day, "time": "10:00", "area": "Kilimani", "address": "Apt 4B, Argwings Kodhek Rd"}
    r = c.post("/api/bookings", json=payload)
    assert r.status_code == 201, r.get_json()
    token = r.get_json()["booking"]["token"]

    # same slot again, and an overlapping slot inside the travel buffer, are rejected
    assert c.post("/api/bookings", json=payload).status_code == 409
    assert c.post("/api/bookings", json={**payload, "time": "11:30"}).status_code == 409
    assert c.post("/api/bookings", json={**payload, "time": "12:00"}).status_code == 201

    # availability reflects the bookings
    after = c.get(f"/api/availability?date={day}&service_id=1").get_json()["slots"]
    assert "10:00" not in after and "11:00" not in after

    # validation
    assert c.post("/api/bookings", json={**payload, "phone": "123"}).status_code == 400

    # admin flow
    assert c.get("/api/admin/bookings").status_code == 401
    tok = c.post("/api/admin/login", json={"username": "owner", "password": "secret123"}).get_json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}
    bookings = c.get("/api/admin/bookings?status=pending", headers=h).get_json()
    assert len(bookings) == 2
    bid = bookings[0]["id"]
    assert c.patch(f"/api/admin/bookings/{bid}/status", json={"status": "completed"}, headers=h).status_code == 400
    assert c.patch(f"/api/admin/bookings/{bid}/status", json={"status": "confirmed"}, headers=h).status_code == 200
    r = c.patch(f"/api/admin/bookings/{bid}/status", json={"status": "completed"}, headers=h)
    assert r.status_code == 400  # needs payment info
    r = c.patch(f"/api/admin/bookings/{bid}/status",
                json={"status": "completed", "payment_method": "mpesa"}, headers=h)
    assert r.status_code == 200 and r.get_json()["amount_paid"] == 1500

    # client cancels the still-pending booking using their private token
    token2 = bookings[1]["token"]
    assert c.post(f"/api/bookings/{token2}/cancel").status_code == 200
    assert c.post(f"/api/bookings/{token2}/cancel").status_code == 400  # already cancelled

    # no-show + blocklist
    r = c.post("/api/bookings", json={**payload, "time": "15:00"})
    assert r.status_code == 201, r.get_json()
    nid = c.get("/api/admin/bookings?status=pending", headers=h).get_json()[0]["id"]
    c.patch(f"/api/admin/bookings/{nid}/status", json={"status": "confirmed"}, headers=h)
    c.patch(f"/api/admin/bookings/{nid}/status", json={"status": "no_show", "blocklist": True}, headers=h)
    assert c.post("/api/bookings", json={**payload, "time": "09:00"}).status_code == 403
    print("All smoke tests passed")


if __name__ == "__main__":
    run()
