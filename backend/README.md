# Nail booking API (Flask)

## Run locally (Windows, PowerShell)
```powershell
python -m venv venv
venv\Scripts\Activate.ps1      # if blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
pip install -r requirements.txt
copy .env.example .env         # then set JWT_SECRET_KEY inside .env
flask db init
flask db migrate -m "initial"
flask db upgrade
flask create-admin owner       # prompts for a password
flask seed-services            # sample services, edit later via the admin API
flask run
python test_smoke.py           # optional sanity check
```
Using Command Prompt instead? Activate with `venv\Scripts\activate.bat`.
Flask finds `app.py` on its own, so no FLASK_APP setting is needed.

## Endpoints
**Public**
- `GET  /api/services`
- `GET  /api/availability?date=YYYY-MM-DD&service_id=1`
- `POST /api/bookings`  `{client_name, phone, service_id, date, time, area, address, notes?, reference_photo_url?}`
- `GET  /api/bookings/<token>`
- `POST /api/bookings/<token>/cancel`

**Admin** (send `Authorization: Bearer <token>`)
- `POST /api/admin/login`
- `GET  /api/admin/bookings?status=&from=&to=`
- `PATCH /api/admin/bookings/<id>/status`  (completed needs `payment_method`: cash|mpesa; no_show accepts `blocklist: true`)
- `GET/POST/DELETE /api/admin/blocked-slots`
- `GET/POST/DELETE /api/admin/blocked-phones`
- `GET/POST/PATCH /api/admin/services`

Business rules (hours, travel buffer, notice, cancel cutoff) live in `config.py`.
