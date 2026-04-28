"""
Hostel and Mess Management System - Main Application
Cloud-based automation platform for hostel and mess management
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError, OperationalError
from contextlib import contextmanager
from functools import wraps
import os
from datetime import date, datetime

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5000'])
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-this-secret-in-production")
DATABASE_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
USING_LOCAL_SQLITE = not DATABASE_URL

if USING_LOCAL_SQLITE:
    os.makedirs("data", exist_ok=True)
    DATABASE_URL = "sqlite:///data/hostelhub_local.db"
    print("[startup] SUPABASE_DB_URL not set. Using local SQLite database: data/hostelhub_local.db")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=not DATABASE_URL.startswith("sqlite"),
)
IS_SQLITE = engine.dialect.name == "sqlite"


@app.errorhandler(OperationalError)
def handle_db_operational_error(_error):
    if request.path.startswith("/api/"):
        return jsonify({
            "error": "Database unavailable. Verify SUPABASE_DB_URL and network access, then retry."
        }), 503
    return "Database unavailable. Verify SUPABASE_DB_URL and network access, then retry.", 503

@contextmanager
def get_conn():
    conn = engine.connect()
    try:
        yield conn
    finally:
        conn.close()


def get_current_user():
    role = session.get("user_role")
    if not role:
        return None

    return {
        "role": role,
        "id": session.get("user_id"),
        "name": session.get("user_name"),
        "email": session.get("user_email"),
        "student_id": session.get("student_code"),
    }


@app.before_request
def ensure_default_admin_session():
    # Login page is removed: auto-bootstrap an admin session for direct dashboard access.
    if session.get("user_role"):
        return
    session["user_role"] = "admin"
    session["user_name"] = "Administrator"
    session["user_email"] = "admin@local"


def require_api_roles(*roles):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    if roles and user["role"] not in roles:
        return jsonify({"error": "Forbidden"}), 403

    return None

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    if request.method == 'OPTIONS':
        return response
    return response

def init_db():
    with engine.begin() as conn:
        if IS_SQLITE:
            conn.execute(text("PRAGMA foreign_keys = ON"))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_code TEXT UNIQUE,
                    id_card_uid TEXT UNIQUE,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    department TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('active', 'inactive')),
                    login_password TEXT
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS menu_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    available INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS food_orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    menu_item_id INTEGER NOT NULL,
                    student_name TEXT NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT NOT NULL DEFAULT 'upi',
                    transaction_ref TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'confirmed',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_number TEXT NOT NULL UNIQUE,
                    block TEXT NOT NULL,
                    floor INTEGER NOT NULL,
                    capacity INTEGER NOT NULL DEFAULT 4,
                    current_occupancy INTEGER NOT NULL DEFAULT 0,
                    room_type TEXT NOT NULL DEFAULT 'standard',
                    monthly_rent REAL NOT NULL DEFAULT 5000,
                    status TEXT NOT NULL DEFAULT 'available',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_name TEXT,
                    room_id INTEGER,
                    bill_type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    due_date TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    paid_date TEXT,
                    payment_method TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (room_id) REFERENCES rooms(id)
                )
            """))
            bill_columns = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(bills)")).fetchall()
            }
            if "room_id" not in bill_columns:
                conn.execute(text("ALTER TABLE bills ADD COLUMN room_id INTEGER"))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bill_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT NOT NULL,
                    transaction_ref TEXT,
                    paid_date TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bill_id) REFERENCES bills(id)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS attendance_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    attendance_date TEXT NOT NULL DEFAULT CURRENT_DATE,
                    scan_type TEXT NOT NULL CHECK(scan_type IN ('check_in', 'check_out')),
                    scan_method TEXT NOT NULL DEFAULT 'id_card',
                    scan_value TEXT NOT NULL,
                    location TEXT NOT NULL DEFAULT 'hostel_gate',
                    scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id)
                )
            """))
            return

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS students (
                id BIGSERIAL PRIMARY KEY,
                student_code TEXT UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                department TEXT NOT NULL,
                year INTEGER NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('active', 'inactive'))
            )
        """))
        conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE"))
        conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS id_card_uid TEXT UNIQUE"))
        conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS login_password TEXT"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS menu_items (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                price DOUBLE PRECISION NOT NULL,
                available BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS food_orders (
                id BIGSERIAL PRIMARY KEY,
                menu_item_id BIGINT NOT NULL,
                student_name TEXT NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                payment_method TEXT NOT NULL DEFAULT 'upi',
                transaction_ref TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'confirmed',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS rooms (
                id BIGSERIAL PRIMARY KEY,
                room_number TEXT NOT NULL UNIQUE,
                block TEXT NOT NULL,
                floor INTEGER NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 4,
                current_occupancy INTEGER NOT NULL DEFAULT 0,
                room_type TEXT NOT NULL DEFAULT 'standard',
                monthly_rent DOUBLE PRECISION NOT NULL DEFAULT 5000,
                status TEXT NOT NULL DEFAULT 'available',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bills (
                id BIGSERIAL PRIMARY KEY,
                student_name TEXT,
                room_id BIGINT,
                bill_type TEXT NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                due_date DATE NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                paid_date DATE,
                payment_method TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        """))
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS room_id BIGINT"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS payments (
                id BIGSERIAL PRIMARY KEY,
                bill_id BIGINT NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                payment_method TEXT NOT NULL,
                transaction_ref TEXT,
                paid_date DATE NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (bill_id) REFERENCES bills(id)
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS attendance_records (
                id BIGSERIAL PRIMARY KEY,
                student_id BIGINT NOT NULL,
                attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
                scan_type TEXT NOT NULL CHECK(scan_type IN ('check_in', 'check_out')),
                scan_method TEXT NOT NULL DEFAULT 'id_card',
                scan_value TEXT NOT NULL,
                location TEXT NOT NULL DEFAULT 'hostel_gate',
                scanned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        """))

@app.route("/")
def index():
    return render_template("index.html", current_user=get_current_user())


@app.route("/login")
def login_page():
    return redirect(url_for("index"))


@app.route("/logout")
def logout_page():
    session.clear()
    return redirect(url_for("login_page"))


@app.route("/favicon.ico")
def favicon():
    # Avoid noisy 404s when browsers auto-request a favicon.
    return "", 204


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user)


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(force=True)
    role = (data.get("role") or "").strip().lower()
    identifier = (data.get("identifier") or "").strip()
    password = (data.get("password") or "").strip()

    if role not in ("admin", "student"):
        return jsonify({"error": "Role must be admin or student"}), 400

    if not identifier or not password:
        return jsonify({"error": "Identifier and password are required"}), 400

    if role == "admin":
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "Dharshan@200")
        # Supports either ADMIN_PASSWORD or comma-separated ADMIN_PASSWORDS for smooth rotation.
        admin_passwords_env = os.getenv("ADMIN_PASSWORDS", "")
        allowed_admin_passwords = [
            admin_password,
            "Dharshan@200",
            "Dharshan2008",
        ]
        if admin_passwords_env.strip():
            allowed_admin_passwords.extend(
                [p.strip() for p in admin_passwords_env.split(",") if p.strip()]
            )
        allowed_admin_passwords = list(dict.fromkeys(allowed_admin_passwords))

        username_matches = identifier.lower() == admin_username.lower()
        password_matches = password in allowed_admin_passwords
        if not username_matches or not password_matches:
            return jsonify({"error": "Invalid admin credentials"}), 401

        session.clear()
        session["user_role"] = "admin"
        session["user_name"] = "Administrator"
        session["user_email"] = "admin@local"
        return jsonify(get_current_user())

    with get_conn() as conn:
        student = conn.execute(text(
            """
            SELECT id, student_code, id_card_uid, name, email, status, login_password
            FROM students
            WHERE student_code = :identifier
               OR id_card_uid = :identifier
               OR LOWER(email) = LOWER(:email)
            LIMIT 1
            """
        ), {"identifier": identifier.upper(), "email": identifier}).fetchone()

    if not student:
        return jsonify({"error": "Student account not found"}), 404

    student_data = dict(student._mapping)
    if student_data.get("status") != "active":
        return jsonify({"error": "Student account is inactive"}), 403

    if not student_data.get("login_password"):
        return jsonify({"error": "Student password is not set. Contact admin."}), 403

    if student_data.get("login_password") != password:
        return jsonify({"error": "Invalid student credentials"}), 401

    session.clear()
    session["user_role"] = "student"
    session["user_id"] = student_data["id"]
    session["user_name"] = student_data["name"]
    session["user_email"] = student_data["email"]
    session["student_code"] = student_data.get("student_code")

    return jsonify(get_current_user())


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"ok": True})

@app.route("/api/students", methods=["GET"])
def get_students():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        rows = conn.execute(text("""
            SELECT id, student_code AS student_id, id_card_uid, name, email, department, year, status
            FROM students
            ORDER BY id DESC
        """)).fetchall()
    return jsonify([dict(r._mapping) for r in rows])

@app.route("/api/students", methods=["POST"])
def add_student():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    student_code = data.get("student_id", "").strip().upper() or None
    id_card_uid = data.get("id_card_uid", "").strip().upper() or None
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    department = data.get("department", "").strip()
    login_password = (data.get("login_password") or "").strip() or None
    year = data.get("year")
    status = data.get("status", "active").strip().lower()

    if not all([name, email, department]) or status not in ("active", "inactive"):
        return jsonify({"error": "Invalid input"}), 400

    try:
        year = int(year)
    except Exception:
        return jsonify({"error": "Year must be a number"}), 400

    try:
        with engine.begin() as conn:
            cur = conn.execute(text("""
                INSERT INTO students (student_code, id_card_uid, name, email, department, year, status)
                VALUES (:student_code, :id_card_uid, :name, :email, :department, :year, :status)
                RETURNING id
            """), {
                "student_code": student_code,
                "id_card_uid": id_card_uid,
                "name": name,
                "email": email,
                "department": department,
                "year": year,
                "status": status
            })
            student_id = cur.scalar_one()
            if login_password:
                conn.execute(text(
                    "UPDATE students SET login_password = :login_password WHERE id = :id"
                ), {"login_password": login_password, "id": student_id})
    except IntegrityError:
        return jsonify({"error": "Email, Student ID, or Card UID already exists"}), 409

    return jsonify({
        "id": student_id,
        "student_id": student_code,
        "id_card_uid": id_card_uid,
        "name": name,
        "email": email,
        "department": department,
        "year": year,
        "status": status
    }), 201


@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        row = conn.execute(text(
            """
            SELECT id, student_code AS student_id, id_card_uid, name, email, department, year, status
            FROM students
            WHERE id = :id
            """
        ), {"id": student_id}).fetchone()

    if not row:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(dict(row._mapping))


@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    student_code = data.get("student_id", "")
    student_code = student_code.strip().upper() if isinstance(student_code, str) else None
    student_code = student_code or None
    id_card_uid = data.get("id_card_uid", "")
    id_card_uid = id_card_uid.strip().upper() if isinstance(id_card_uid, str) else None
    id_card_uid = id_card_uid or None

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    department = (data.get("department") or "").strip()
    login_password = (data.get("login_password") or "").strip()
    year = data.get("year")
    status = (data.get("status") or "active").strip().lower()

    if not all([name, email, department]) or status not in ("active", "inactive"):
        return jsonify({"error": "Invalid input"}), 400

    try:
        year = int(year)
    except Exception:
        return jsonify({"error": "Year must be a number"}), 400

    try:
        with engine.begin() as conn:
            cur = conn.execute(text(
                """
                UPDATE students
                SET student_code = :student_code,
                    id_card_uid = :id_card_uid,
                    name = :name,
                    email = :email,
                    department = :department,
                    year = :year,
                    status = :status
                WHERE id = :id
                """
            ), {
                "student_code": student_code,
                "id_card_uid": id_card_uid,
                "name": name,
                "email": email,
                "department": department,
                "year": year,
                "status": status,
                "id": student_id,
            })
            if login_password:
                conn.execute(text(
                    "UPDATE students SET login_password = :login_password WHERE id = :id"
                ), {"login_password": login_password, "id": student_id})
    except IntegrityError:
        return jsonify({"error": "Email, Student ID, or Card UID already exists"}), 409

    if cur.rowcount == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({
        "id": student_id,
        "student_id": student_code,
        "id_card_uid": id_card_uid,
        "name": name,
        "email": email,
        "department": department,
        "year": year,
        "status": status,
    })

@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    with engine.begin() as conn:
        cur = conn.execute(text("DELETE FROM students WHERE id = :id"), {"id": student_id})
    if cur.rowcount == 0:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"ok": True})


@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        total_students = conn.execute(text("SELECT COUNT(*) FROM students")).scalar_one()
        total_rooms = conn.execute(text("SELECT COUNT(*) FROM rooms")).scalar_one()
        occupied_rooms = conn.execute(text(
            "SELECT COUNT(*) FROM rooms WHERE current_occupancy > 0 OR status = 'occupied'"
        )).scalar_one()
        available_rooms = total_rooms - occupied_rooms
        pending_bills = conn.execute(text(
            "SELECT COUNT(*) FROM bills WHERE status = 'pending'"
        )).scalar_one()
        overdue_bills = conn.execute(text(
            "SELECT COUNT(*) FROM bills WHERE status = 'pending' AND due_date < CURRENT_DATE"
        )).scalar_one()
        present_today = conn.execute(text(
            """
            SELECT COUNT(DISTINCT student_id)
            FROM attendance_records
            WHERE attendance_date = CURRENT_DATE
              AND scan_type = 'check_in'
            """
        )).scalar_one()

    return jsonify({
        "total_students": total_students,
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": available_rooms,
        "present_today": present_today,
        "pending_bills": pending_bills,
        "overdue_bills": overdue_bills,
        "open_feedback": 0
    })


@app.route("/api/dashboard/revenue", methods=["GET"])
def dashboard_revenue():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        revenue_query = """
            SELECT COALESCE(SUM(amount), 0)
            FROM bills
            WHERE status = 'paid'
        """
        if IS_SQLITE:
            revenue_query += " AND strftime('%Y-%m', paid_date) = strftime('%Y-%m', 'now')"
        else:
            revenue_query += " AND TO_CHAR(paid_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')"
        revenue = conn.execute(text(revenue_query)).scalar_one()

    return jsonify({"monthly_revenue": revenue})


@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        rows = conn.execute(text(
            """
            SELECT id, room_number, block, floor, capacity, current_occupancy,
                   room_type, monthly_rent, status, created_at
            FROM rooms
            ORDER BY room_number ASC
            """
        )).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/rooms", methods=["POST"])
def add_room():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    room_number = data.get("room_number", "").strip()
    block = data.get("block", "").strip().upper()
    room_type = data.get("room_type", "standard").strip().lower()

    try:
        floor = int(data.get("floor"))
        capacity = int(data.get("capacity", 4))
        monthly_rent = float(data.get("monthly_rent", 5000))
    except (TypeError, ValueError):
        return jsonify({"error": "Floor, capacity, and rent must be valid numbers"}), 400

    if not room_number or not block:
        return jsonify({"error": "Room number and block are required"}), 400

    if capacity < 1:
        return jsonify({"error": "Capacity must be at least 1"}), 400

    with engine.begin() as conn:
        try:
            cur = conn.execute(text(
                """
                INSERT INTO rooms (room_number, block, floor, capacity, current_occupancy, room_type, monthly_rent, status)
                VALUES (:room_number, :block, :floor, :capacity, 0, :room_type, :monthly_rent, 'available')
                RETURNING id
                """
            ), {
                "room_number": room_number,
                "block": block,
                "floor": floor,
                "capacity": capacity,
                "room_type": room_type,
                "monthly_rent": monthly_rent
            })
            room_id = cur.scalar_one()
        except IntegrityError:
            return jsonify({"error": "Room number already exists"}), 409

    return jsonify({
        "id": room_id,
        "room_number": room_number,
        "block": block,
        "floor": floor,
        "capacity": capacity,
        "current_occupancy": 0,
        "room_type": room_type,
        "monthly_rent": monthly_rent,
        "status": "available"
    }), 201


@app.route("/api/rooms/<int:room_id>/vacate", methods=["POST"])
def vacate_room(room_id):
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    with engine.begin() as conn:
        room = conn.execute(text(
            """
            SELECT id, room_number, capacity, current_occupancy
            FROM rooms
            WHERE id = :id
            LIMIT 1
            """
        ), {"id": room_id}).fetchone()

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room_data = dict(room._mapping)
        current_occupancy = int(room_data.get("current_occupancy") or 0)
        capacity = max(1, int(room_data.get("capacity") or 1))

        if current_occupancy <= 0:
            return jsonify({"error": "Room is already vacant"}), 400

        updated_occupancy = max(0, current_occupancy - 1)
        updated_status = "occupied" if updated_occupancy > 0 else "available"

        conn.execute(text(
            """
            UPDATE rooms
            SET current_occupancy = :current_occupancy,
                status = :status
            WHERE id = :id
            """
        ), {
            "current_occupancy": updated_occupancy,
            "status": updated_status,
            "id": room_id,
        })

    return jsonify({
        "message": f"Room {room_data.get('room_number')} vacated successfully",
        "room_id": room_id,
        "current_occupancy": updated_occupancy,
        "capacity": capacity,
        "status": updated_status,
    })


@app.route("/api/menu", methods=["GET"])
def get_menu():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        rows = conn.execute(text(
            """
            SELECT id, name, description, category, price, available, created_at
            FROM menu_items
            WHERE available = TRUE
            ORDER BY id DESC
            """
        )).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/menu", methods=["POST"])
def add_menu_item():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "").strip().lower()
    price = data.get("price")

    if not name or not category:
        return jsonify({"error": "Name and category are required"}), 400

    try:
        price = float(price)
    except (TypeError, ValueError):
        return jsonify({"error": "Price must be a valid number"}), 400

    with engine.begin() as conn:
        cur = conn.execute(text(
            """
            INSERT INTO menu_items (name, description, category, price)
            VALUES (:name, :description, :category, :price)
            RETURNING id
            """
        ), {
            "name": name,
            "description": description,
            "category": category,
            "price": price
        })
        menu_id = cur.scalar_one()

    return jsonify({
        "id": menu_id,
        "name": name,
        "description": description,
        "category": category,
        "price": price,
        "available": True
    }), 201


@app.route("/api/payments/upi-details", methods=["GET"])
def get_upi_details():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    try:
        amount = float(request.args.get("amount", "0") or 0)
    except ValueError:
        amount = 0

    note = (request.args.get("note") or "Food Order Payment").strip() or "Food Order Payment"
    upi_id = os.getenv("UPI_ID", "dharshan@okaxis")
    gpay_number = os.getenv("GPAY_NUMBER", "9894670423")
    payee_name = os.getenv("UPI_PAYEE_NAME", "HostelHub")

    amount_param = f"am={amount:.2f}" if amount > 0 else ""
    upi_uri = f"upi://pay?pa={upi_id}&pn={payee_name}&tn={note}"
    if amount_param:
        upi_uri += f"&{amount_param}"

    qr_data = upi_uri.replace(" ", "%20")
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=240x240&data={qr_data}"

    return jsonify({
        "upi_id": upi_id,
        "gpay_number": gpay_number,
        "payee_name": payee_name,
        "upi_uri": upi_uri,
        "qr_url": qr_url,
    })


@app.route("/api/food-orders/confirm", methods=["POST"])
def confirm_food_order():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    user = get_current_user()
    data = request.get_json(force=True)

    menu_item_id = data.get("menu_item_id")
    transaction_ref = (data.get("transaction_ref") or "").strip()
    payment_method = (data.get("payment_method") or "upi").strip().lower()
    student_name = (data.get("student_name") or "").strip()
    paid_date = (data.get("paid_date") or date.today().isoformat()).strip()

    if payment_method not in {"upi", "online", "card", "cash"}:
        return jsonify({"error": "Invalid payment method"}), 400

    if not transaction_ref:
        transaction_ref = f"FOOD-{int(datetime.now().timestamp())}-{menu_item_id or 'NA'}"

    try:
        menu_item_id = int(menu_item_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Valid menu item id is required"}), 400

    if user and user["role"] == "student":
        student_name = user.get("name") or "Student"

    if not student_name:
        return jsonify({"error": "Student name is required"}), 400

    try:
        paid_date = datetime.strptime(paid_date, "%Y-%m-%d").date().isoformat()
    except ValueError:
        return jsonify({"error": "Invalid paid date format. Use YYYY-MM-DD"}), 400

    with engine.begin() as conn:
        menu_item = conn.execute(text(
            """
            SELECT id, name, price, available
            FROM menu_items
            WHERE id = :id
            """
        ), {"id": menu_item_id}).fetchone()

        if not menu_item:
            return jsonify({"error": "Food item not found"}), 404

        menu_data = dict(menu_item._mapping)
        if not menu_data.get("available"):
            return jsonify({"error": "Food item is not currently available"}), 400

        amount = float(menu_data["price"])

        bill_cur = conn.execute(text(
            """
            INSERT INTO bills (student_name, bill_type, amount, due_date, status, paid_date, payment_method)
            VALUES (:student_name, 'food', :amount, :due_date, 'paid', :paid_date, :payment_method)
            RETURNING id
            """
        ), {
            "student_name": student_name,
            "amount": amount,
            "due_date": paid_date,
            "paid_date": paid_date,
            "payment_method": payment_method,
        })
        bill_id = bill_cur.scalar_one()

        conn.execute(text(
            """
            INSERT INTO payments (bill_id, amount, payment_method, transaction_ref, paid_date)
            VALUES (:bill_id, :amount, :payment_method, :transaction_ref, :paid_date)
            """
        ), {
            "bill_id": bill_id,
            "amount": amount,
            "payment_method": payment_method,
            "transaction_ref": transaction_ref,
            "paid_date": paid_date,
        })

        order_cur = conn.execute(text(
            """
            INSERT INTO food_orders (menu_item_id, student_name, amount, payment_method, transaction_ref, status)
            VALUES (:menu_item_id, :student_name, :amount, :payment_method, :transaction_ref, 'confirmed')
            RETURNING id
            """
        ), {
            "menu_item_id": menu_item_id,
            "student_name": student_name,
            "amount": amount,
            "payment_method": payment_method,
            "transaction_ref": transaction_ref,
        })
        order_id = order_cur.scalar_one()

    return jsonify({
        "message": "Food order confirmed",
        "order_id": order_id,
        "bill_id": bill_id,
        "item_name": menu_data["name"],
        "amount": amount,
        "student_name": student_name,
        "payment_method": payment_method,
        "transaction_ref": transaction_ref,
        "status": "confirmed",
    }), 201


@app.route("/api/attendance/daily-report", methods=["GET"])
def attendance_daily_report():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    date_str = request.args.get("date", date.today().isoformat())
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date().isoformat()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    with get_conn() as conn:
        total_students = conn.execute(text("SELECT COUNT(*) FROM students")).scalar_one()
        present_students = conn.execute(text(
            """
            SELECT COUNT(DISTINCT student_id)
            FROM attendance_records
            WHERE attendance_date = :attendance_date
              AND scan_type = 'check_in'
            """
        ), {"attendance_date": target_date}).scalar_one()

    absent_students = max(total_students - present_students, 0)
    attendance_percentage = (present_students / total_students * 100) if total_students > 0 else 0

    return jsonify({
        "date": target_date,
        "total_hostel_students": total_students,
        "present": present_students,
        "absent": absent_students,
        "on_leave": 0,
        "attendance_percentage": attendance_percentage
    })


@app.route("/api/attendance/scan-id", methods=["POST"])
def scan_attendance_id_card():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    scan_value = (data.get("scan_value") or data.get("student_id") or "").strip()
    scan_value = scan_value.replace(" ", "")
    normalized_scan_value = scan_value.upper()
    scan_method = (data.get("scan_method") or "manual_input").strip().lower()
    scan_type = data.get("scan_type", "check_in").strip().lower()
    location = data.get("location", "hostel_gate").strip() or "hostel_gate"
    attendance_date = data.get("attendance_date", date.today().isoformat()).strip()

    if not scan_value:
        return jsonify({"error": "Scan value is required"}), 400

    if scan_type not in ("check_in", "check_out"):
        return jsonify({"error": "Scan type must be check_in or check_out"}), 400

    allowed_scan_methods = {"manual_input", "qr_scanner", "id_card", "barcode_scanner"}
    if scan_method not in allowed_scan_methods:
        return jsonify({"error": "scan_method must be manual_input, qr_scanner, id_card, or barcode_scanner"}), 400

    try:
        attendance_date = datetime.strptime(attendance_date, "%Y-%m-%d").date().isoformat()
    except ValueError:
        return jsonify({"error": "Invalid attendance date format. Use YYYY-MM-DD"}), 400

    student_lookup_id = None
    if scan_value.lower().startswith("s") and scan_value[1:].isdigit():
        student_lookup_id = int(scan_value[1:])
    elif scan_value.isdigit():
        student_lookup_id = int(scan_value)

    with engine.begin() as conn:
        if student_lookup_id is not None:
            student = conn.execute(text(
                """
                SELECT id, student_code, id_card_uid, name, email, status
                FROM students
                WHERE id = :student_id
                """
            ), {"student_id": student_lookup_id}).fetchone()
        else:
            student = conn.execute(text(
                """
                SELECT id, student_code, id_card_uid, name, email, status
                FROM students
                WHERE student_code = :student_code
                   OR id_card_uid = :id_card_uid
                   OR LOWER(email) = LOWER(:email)
                ORDER BY CASE
                    WHEN id_card_uid = :id_card_uid THEN 0
                    WHEN student_code = :student_code THEN 1
                    ELSE 2
                END
                LIMIT 1
                """
            ), {
                "student_code": normalized_scan_value,
                "id_card_uid": normalized_scan_value,
                "email": scan_value,
            }).fetchone()

        if not student:
            return jsonify({"error": "Student not found for scanned ID"}), 404

        student_data = dict(student._mapping)
        if student_data["status"] != "active":
            return jsonify({"error": "Student is not active"}), 400

        existing = conn.execute(text(
            """
            SELECT id
            FROM attendance_records
            WHERE student_id = :student_id
              AND attendance_date = :attendance_date
              AND scan_type = :scan_type
            LIMIT 1
            """
        ), {
            "student_id": student_data["id"],
            "attendance_date": attendance_date,
            "scan_type": scan_type,
        }).fetchone()

        if existing:
            return jsonify({
                "message": f"{scan_type.replace('_', ' ').title()} already recorded for today",
                "already_scanned": True,
                "student": {
                    "id": student_data["id"],
                    "student_id": student_data.get("student_code"),
                    "id_card_uid": student_data.get("id_card_uid"),
                    "name": student_data["name"],
                    "email": student_data["email"],
                },
            }), 200

        conn.execute(text(
            """
            INSERT INTO attendance_records (student_id, attendance_date, scan_type, scan_method, scan_value, location)
            VALUES (:student_id, :attendance_date, :scan_type, :scan_method, :scan_value, :location)
            """
        ), {
            "student_id": student_data["id"],
            "attendance_date": attendance_date,
            "scan_type": scan_type,
            "scan_method": scan_method,
            "scan_value": normalized_scan_value,
            "location": location,
        })

    return jsonify({
        "message": f"{scan_type.replace('_', ' ').title()} recorded successfully",
        "already_scanned": False,
        "student": {
            "id": student_data["id"],
            "student_id": student_data.get("student_code"),
            "id_card_uid": student_data.get("id_card_uid"),
            "name": student_data["name"],
            "email": student_data["email"],
        },
        "attendance_date": attendance_date,
        "scan_method": scan_method,
        "scan_type": scan_type,
        "location": location,
    }), 201


@app.route("/api/attendance/recent-scans", methods=["GET"])
def attendance_recent_scans():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    try:
        limit = int(request.args.get("limit", 8))
    except ValueError:
        limit = 8

    limit = max(1, min(limit, 50))

    with get_conn() as conn:
        rows = conn.execute(text(
            """
            SELECT ar.id, ar.attendance_date, ar.scan_type, ar.scan_method, ar.scan_value, ar.location, ar.scanned_at,
                   s.id AS student_id, s.student_code, s.id_card_uid, s.name AS student_name
            FROM attendance_records ar
            JOIN students s ON s.id = ar.student_id
            ORDER BY ar.scanned_at DESC
            LIMIT :limit
            """
        ), {"limit": limit}).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/attendance/logs", methods=["GET"])
def attendance_logs():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    date_str = request.args.get("date")
    scan_type = (request.args.get("scan_type") or "").strip().lower()
    search = (request.args.get("search") or "").strip()

    try:
        limit = int(request.args.get("limit", 100))
    except ValueError:
        limit = 100

    limit = max(1, min(limit, 500))

    query = """
        SELECT ar.id, ar.attendance_date, ar.scan_type, ar.scan_method, ar.scan_value, ar.location, ar.scanned_at,
               s.id AS student_id, s.student_code, s.id_card_uid, s.name AS student_name, s.email
        FROM attendance_records ar
        JOIN students s ON s.id = ar.student_id
        WHERE 1 = 1
    """
    params = {"limit": limit}

    if date_str:
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date().isoformat()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        query += " AND ar.attendance_date = :attendance_date"
        params["attendance_date"] = parsed_date

    if scan_type:
        if scan_type not in ("check_in", "check_out"):
            return jsonify({"error": "scan_type must be check_in or check_out"}), 400
        query += " AND ar.scan_type = :scan_type"
        params["scan_type"] = scan_type

    if search:
        query += """
            AND (
                LOWER(s.name) LIKE LOWER(:search)
                OR LOWER(s.email) LIKE LOWER(:search)
                OR LOWER(COALESCE(s.student_code, '')) LIKE LOWER(:search)
                OR LOWER(COALESCE(s.id_card_uid, '')) LIKE LOWER(:search)
                OR LOWER(ar.scan_value) LIKE LOWER(:search)
            )
        """
        params["search"] = f"%{search}%"

    query += " ORDER BY ar.scanned_at DESC LIMIT :limit"

    with get_conn() as conn:
        rows = conn.execute(text(query), params).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/bills", methods=["GET"])
def get_bills():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        rows = conn.execute(text(
            """
            SELECT b.id, b.student_name, b.bill_type, b.amount, b.due_date, b.status, b.paid_date, b.payment_method,
                   b.room_id, r.room_number
            FROM bills b
            LEFT JOIN rooms r ON r.id = b.room_id
            ORDER BY b.id DESC
            """
        )).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/bills/generate-monthly", methods=["POST"])
def generate_monthly_bills():
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    user = get_current_user()
    data = request.get_json(force=True)
    student_name = data.get("student_name", "").strip() or "N/A"
    bill_type = data.get("bill_type", "").strip().lower()
    room_number = (data.get("room_number") or "").strip().upper()
    amount = data.get("amount")
    due_date = data.get("due_date", "").strip()

    # Keep room/food labels consistent across UI and API.
    bill_type_aliases = {
        "hostel": "room",
        "mess": "food",
    }
    bill_type = bill_type_aliases.get(bill_type, bill_type)

    allowed_bill_types = {"room", "food", "laundry"}

    if not bill_type or not due_date:
        return jsonify({"error": "Bill type and due date are required"}), 400

    if bill_type not in allowed_bill_types:
        return jsonify({"error": "Bill type must be room, food, or laundry"}), 400

    if user and user["role"] == "student":
        if bill_type not in {"room", "food"}:
            return jsonify({"error": "Students can only pay room or mess bills"}), 403
        student_name = user.get("name") or student_name

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({"error": "Amount must be a valid number"}), 400

    with engine.begin() as conn:
        room_id = None
        if bill_type == "room":
            if not room_number:
                return jsonify({"error": "Room number is required for room bills"}), 400

            room = conn.execute(text(
                """
                SELECT id, room_number
                FROM rooms
                WHERE UPPER(room_number) = :room_number
                LIMIT 1
                """
            ), {"room_number": room_number}).fetchone()

            if not room:
                return jsonify({"error": "Room not found for provided room number"}), 404

            room_id = room._mapping["id"]

        cur = conn.execute(text(
            """
            INSERT INTO bills (student_name, room_id, bill_type, amount, due_date, status)
            VALUES (:student_name, :room_id, :bill_type, :amount, :due_date, 'pending')
            RETURNING id
            """
        ), {
            "student_name": student_name,
            "room_id": room_id,
            "bill_type": bill_type,
            "amount": amount,
            "due_date": due_date
        })
        bill_id = cur.scalar_one()

    return jsonify({
        "id": bill_id,
        "student_name": student_name,
        "room_number": room_number if bill_type == "room" else None,
        "bill_type": bill_type,
        "amount": amount,
        "due_date": due_date,
        "status": "pending"
    }), 201


@app.route("/api/bills/<int:bill_id>/pay", methods=["POST"])
def pay_bill(bill_id):
    auth_error = require_api_roles("admin", "student")
    if auth_error:
        return auth_error

    data = request.get_json(force=True)
    paid_date = data.get("paid_date", date.today().isoformat())
    payment_method = data.get("payment_method", "online").strip().lower()
    transaction_ref = data.get("transaction_ref", "").strip() or None

    allowed_payment_methods = {"online", "upi", "card", "cash"}
    if payment_method not in allowed_payment_methods:
        return jsonify({"error": "Payment method must be online, upi, card, or cash"}), 400

    with engine.begin() as conn:
        bill = conn.execute(
            text("SELECT id, amount, status, bill_type, room_id, student_name FROM bills WHERE id = :id"),
            {"id": bill_id}
        ).fetchone()

        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        bill_data = bill._mapping
        if bill_data["status"] == "paid":
            return jsonify({"error": "Bill already paid"}), 400

        cur = conn.execute(text(
            """
            UPDATE bills
            SET status = 'paid', paid_date = :paid_date, payment_method = :payment_method
            WHERE id = :bill_id
            """
        ), {
            "paid_date": paid_date,
            "payment_method": payment_method,
            "bill_id": bill_id
        })
        conn.execute(text(
            """
            INSERT INTO payments (bill_id, amount, payment_method, transaction_ref, paid_date)
            VALUES (:bill_id, :amount, :payment_method, :transaction_ref, :paid_date)
            """
        ), {
            "bill_id": bill_id,
            "amount": bill_data["amount"],
            "payment_method": payment_method,
            "transaction_ref": transaction_ref,
            "paid_date": paid_date
        })

        # Count a paid room bill as an occupancy event, once per student-room pair.
        if bill_data.get("bill_type") == "room" and bill_data.get("room_id"):
            prior_paid_bill = conn.execute(text(
                """
                SELECT id
                FROM bills
                WHERE id <> :bill_id
                  AND status = 'paid'
                  AND bill_type = 'room'
                  AND room_id = :room_id
                  AND LOWER(COALESCE(student_name, '')) = LOWER(COALESCE(:student_name, ''))
                LIMIT 1
                """
            ), {
                "bill_id": bill_id,
                "room_id": bill_data["room_id"],
                "student_name": bill_data.get("student_name")
            }).fetchone()

            if not prior_paid_bill:
                room_row = conn.execute(text(
                    """
                    SELECT id, current_occupancy, capacity
                    FROM rooms
                    WHERE id = :id
                    LIMIT 1
                    """
                ), {"id": bill_data["room_id"]}).fetchone()

                if room_row:
                    room_data = room_row._mapping
                    current_occupancy = int(room_data.get("current_occupancy") or 0)
                    capacity = max(1, int(room_data.get("capacity") or 1))
                    updated_occupancy = min(capacity, current_occupancy + 1)
                    updated_status = "occupied" if updated_occupancy > 0 else "available"

                    conn.execute(text(
                        """
                        UPDATE rooms
                        SET current_occupancy = :current_occupancy,
                            status = :status
                        WHERE id = :id
                        """
                    ), {
                        "current_occupancy": updated_occupancy,
                        "status": updated_status,
                        "id": bill_data["room_id"],
                    })

    if cur.rowcount == 0:
        return jsonify({"error": "Bill not found"}), 404

    return jsonify({"message": f"Bill {bill_id} marked as paid"})


@app.route("/api/payments", methods=["GET"])
def get_payments():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error

    with get_conn() as conn:
        rows = conn.execute(text(
            """
            SELECT p.id, p.bill_id, p.amount, p.payment_method, p.transaction_ref, p.paid_date,
                   b.student_name, b.bill_type
            FROM payments p
            JOIN bills b ON b.id = p.bill_id
            ORDER BY p.id DESC
            """
        )).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@app.route("/api/feedback", methods=["GET"])
def get_feedback():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error
    return jsonify([])


@app.route("/api/feedback", methods=["POST"])
def create_feedback():
    auth_error = require_api_roles("admin")
    if auth_error:
        return auth_error
    return jsonify({"message": "Feedback submitted"}), 201

if __name__ == "__main__":
    try:
        init_db()
    except OperationalError as exc:
        print(f"[startup warning] Database initialization failed: {exc}")
        print("[startup warning] App will still run; API calls may return 503 until database connectivity is fixed.")
    app.run(debug=True)
