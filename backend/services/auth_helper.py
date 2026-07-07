import hashlib
import uuid

def hash_password(password: str, salt: str = None) -> tuple:
    """
    Hashes a password with a user-specific salt.
    Returns: (hashed_password, salt)
    """
    if not salt:
        salt = uuid.uuid4().hex
    
    # Hash password combined with salt
    hash_obj = hashlib.sha256((password + salt).encode('utf-8'))
    return hash_obj.hexdigest(), salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    """
    Verifies a password against a hash and salt.
    Returns: True if correct, False otherwise
    """
    new_hash, _ = hash_password(password, salt)
    return new_hash == hashed
