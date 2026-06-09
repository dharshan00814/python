# Hostel and Mess Management System

A Flask-based ERP-style web application for managing hostel students, rooms, mess/menu, billing/payments, and attendance with Supabase PostgreSQL.

## Features

- Direct dashboard access (auto admin session)
- Student management (add, list, edit, delete)
- Room management (add, list)
- Menu management (add, list)
- Billing and payment tracking
- Dashboard statistics and monthly revenue
- Attendance system with:
  - Manual ID scan input
  - Camera scan using html5-qrcode
  - Daily attendance report
  - Recent scans and searchable attendance logs

## Tech Stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- UI Styling: custom dark theme, glassmorphism effects, Google Fonts (Manrope and Sora)
- Backend: Python, Flask, Flask-CORS
- Data Access: SQLAlchemy Core
- Database: Supabase PostgreSQL
- PostgreSQL Driver: psycopg2-binary
- QR Scanner Library: html5-qrcode

## Current Project Structure

```text
app.py
requirements.txt
README.md
TODO.md
static/
  script.js
  style.css
  vendor/
    fontawesome/
    html5-qrcode/
templates/
  index.html
```

## Setup and Run (Windows)

1. Open terminal in the project folder.

```powershell
cd C:\Users\Dharshan\OneDrive\Desktop\python
```

2. Create and activate virtual environment.

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies.

```powershell
pip install -r requirements.txt
pip install psycopg2-binary
```

4. Set Supabase database URL.

```powershell
$env:SUPABASE_DB_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres"
```

This variable is required. The app no longer falls back to a local SQLite database.

If your password contains special characters like `@`, URL-encode them in the connection string (`@` becomes `%40`).

5. Start the app.

```powershell
python app.py
```

6. Open in browser.

```text
http://127.0.0.1:5000/
```

## Access

- The UI opens directly to dashboard with default admin session.

## Attendance Flow

Student ID/QR -> Frontend Scanner (manual or html5-qrcode) -> Flask API (`/api/attendance/scan-id`) -> Supabase (`attendance_records`) -> Admin Dashboard and Logs

## Main API Endpoints

### Auth
- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/revenue`

### Students
- `GET /api/students`
- `POST /api/students`
- `DELETE /api/students/<id>`

### Rooms
- `GET /api/rooms`
- `POST /api/rooms`

### Menu
- `GET /api/menu`
- `POST /api/menu`

### Billing and Payments
- `GET /api/bills`
- `POST /api/bills/generate-monthly`
- `POST /api/bills/<id>/pay`
- `GET /api/payments`

### Attendance
- `GET /api/attendance/daily-report`
- `POST /api/attendance/scan-id`
- `GET /api/attendance/recent-scans`
- `GET /api/attendance/logs`

## Troubleshooting

- `ERR_CONNECTION_REFUSED` on `/api/...`:
  - Start Flask with `python app.py` in the project root.
- `ModuleNotFoundError: psycopg2`:
  - Install `psycopg2-binary` in the active virtual environment.
- Browser warning about tracking prevention for CDN assets:
  - This project now serves critical frontend assets locally.
