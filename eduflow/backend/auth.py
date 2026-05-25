import os
from datetime import datetime, timedelta
from jose import jwt, JWTError

ALGORITHM = "HS256"


def _secret() -> str:
    return os.getenv("JWT_SECRET", "change_this_secret")


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[ALGORITHM])
