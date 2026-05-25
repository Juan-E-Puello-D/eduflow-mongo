import os
from fastapi import Header, HTTPException
from jose import JWTError
from auth import decode_access_token


async def get_current_user(authorization: str = Header(default=None)) -> dict:
    # Allow disabling auth for debugging by setting DISABLE_AUTH=true in the environment
    if os.getenv("DISABLE_AUTH", "").lower() in ("1", "true", "yes"):
        return {"sub": "debug", "debug": True}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autenticación requerido")
    token = authorization[7:]
    try:
        return decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
