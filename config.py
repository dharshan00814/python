"""
HostelHub centralized configuration.
All environment-specific and sensitive values are read from environment variables.
No personal data or secrets are hardcoded.
"""

import os

# ---------------------------------------------------------------------------
# Flask core
# ---------------------------------------------------------------------------
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-in-production")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
_cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:5000,http://localhost:5000"
)
CORS_ORIGINS = [
    origin.strip()
    for origin in _cors_origins_raw.split(",")
    if origin.strip()
]

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")

# ---------------------------------------------------------------------------
# Admin auto-session / authentication
# ---------------------------------------------------------------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Administrator")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@localhost")

# Admin login password(s). No default is provided for security.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_PASSWORDS_ENV = os.getenv("ADMIN_PASSWORDS", "")

# Build allowed admin password list from env.
# Only add values that are explicitly provided.
def get_allowed_admin_passwords():
    passwords = []
    if ADMIN_PASSWORD:
        passwords.append(ADMIN_PASSWORD)
    if ADMIN_PASSWORDS_ENV.strip():
        passwords.extend(
            [p.strip() for p in ADMIN_PASSWORDS_ENV.split(",") if p.strip()]
        )
    return list(dict.fromkeys(passwords))

# ---------------------------------------------------------------------------
# Payment / UPI
# ---------------------------------------------------------------------------
UPI_ID = os.getenv("UPI_ID", "")
GPAY_NUMBER = os.getenv("GPAY_NUMBER", "")
UPI_PAYEE_NAME = os.getenv("UPI_PAYEE_NAME", "HostelHub")

# ---------------------------------------------------------------------------
# Business / Domain defaults
# ---------------------------------------------------------------------------
DEFAULT_ROOM_CAPACITY = int(os.getenv("DEFAULT_ROOM_CAPACITY", "4"))
DEFAULT_MONTHLY_RENT = float(os.getenv("DEFAULT_MONTHLY_RENT", "5000"))
DEFAULT_ROOM_TYPE = os.getenv("DEFAULT_ROOM_TYPE", "standard")

# Blocks available in the hostel.
BLOCKS = [
    block.strip()
    for block in os.getenv("HOSTEL_BLOCKS", "A,B,C,D").split(",")
    if block.strip()
]

# ---------------------------------------------------------------------------
# Frontend exposed config (non-sensitive only)
# ---------------------------------------------------------------------------
def get_frontend_config():
    """Return a dict safe to expose to the browser via window.APP_CONFIG."""
    return {
        "api_origin": os.getenv("API_ORIGIN", ""),
        "default_room_capacity": DEFAULT_ROOM_CAPACITY,
        "default_monthly_rent": DEFAULT_MONTHLY_RENT,
        "default_room_type": DEFAULT_ROOM_TYPE,
        "blocks": BLOCKS,
        "payee_name": UPI_PAYEE_NAME,
    }
