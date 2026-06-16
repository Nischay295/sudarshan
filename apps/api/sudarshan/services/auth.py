import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a secure salt."""
    salt = secrets.token_hex(16)
    # 100,000 iterations provides excellent security on modern hardware
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{pw_hash.hex()}"

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a stored PBKDF2 hash."""
    try:
        salt, stored_hash = password_hash.split(":")
        pw_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        # Prevent timing attacks using compare_digest
        return secrets.compare_digest(pw_hash.hex(), stored_hash)
    except Exception:
        return False
