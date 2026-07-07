import base64
import json
import hmac
import hashlib
import time

# A secure key for token signing (in a real production app, read this from config/settings)
SECRET_KEY = "biotwin_ai_super_secret_jwt_key_that_is_long_and_secure"

def base64url_encode(data: bytes) -> str:
    """Base64url encode bytes as defined in RFC 7515."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    """Base64url decode string as defined in RFC 7515."""
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def encode_jwt(payload: dict, expires_in: int = 86400) -> str:
    """
    Encodes a JWT payload with an expiration time.
    Default expiration is 24 hours (86400 seconds).
    """
    header = {"alg": "HS256", "typ": "JWT"}
    
    # Set expiration time
    payload_copy = payload.copy()
    if "exp" not in payload_copy:
        payload_copy["exp"] = int(time.time()) + expires_in
        
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_json = json.dumps(payload_copy, separators=(',', ':')).encode('utf-8')
    
    header_b64 = base64url_encode(header_json)
    payload_b64 = base64url_encode(payload_json)
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token: str) -> dict:
    """
    Decodes and verifies a JWT token.
    Raises ValueError on failure, signature mismatch, or expired token.
    """
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token format. Expected header.payload.signature")
        
    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    
    expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    expected_signature_b64 = base64url_encode(expected_signature)
    
    # Timing-attack safe comparison
    if not hmac.compare_digest(signature_b64, expected_signature_b64):
        raise ValueError("JWT signature verification failed.")
        
    payload_json = base64url_decode(payload_b64)
    payload = json.loads(payload_json.decode('utf-8'))
    
    # Verify expiration
    if "exp" in payload and payload["exp"] < time.time():
        raise ValueError("JWT token has expired.")
        
    return payload
