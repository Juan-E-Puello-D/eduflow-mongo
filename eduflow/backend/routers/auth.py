from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from urllib.parse import quote
from datetime import datetime

from database import get_db
from auth import create_access_token
from models.usuario import UsuarioCreate
from utils import serialize_doc

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login")
async def login(body: dict):
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password son requeridos")

    db = get_db()
    user = await db["usuarios"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not pwd_context.verify(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"id": str(user["_id"]), "email": user["email"], "rol": user["rol"]})
    safe_user = {k: v for k, v in user.items() if k != "password"}
    return {"user": serialize_doc(safe_user), "token": token}


@router.post("/register", status_code=201)
async def register(body: UsuarioCreate):
    db = get_db()

    if await db["usuarios"].find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="El email ya está registrado")

    hashed = pwd_context.hash(body.password)
    avatar_url = f"https://ui-avatars.com/api/?name={quote(body.nombre)}&background=0D6EFD&color=ffffff"

    new_user = {
        "nombre": body.nombre,
        "email": body.email,
        "password": hashed,
        "rol": body.rol,
        "avatarUrl": avatar_url,
        "fechaRegistro": datetime.utcnow(),
        "preferencias": {"idioma": "es", "modoOscuro": False},
    }
    if body.rol == "instructor":
        new_user["cursosCreados"] = []

    result = await db["usuarios"].insert_one(new_user)
    created = {**new_user, "_id": result.inserted_id}
    safe_user = {k: v for k, v in created.items() if k != "password"}
    token = create_access_token({"id": str(result.inserted_id), "email": body.email, "rol": body.rol})
    return {"user": serialize_doc(safe_user), "token": token}
