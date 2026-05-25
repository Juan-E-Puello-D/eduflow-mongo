from pydantic import BaseModel
from typing import Optional


class Preferencias(BaseModel):
    idioma: str = "es"
    modoOscuro: bool = False


class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "estudiante"


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    avatarUrl: Optional[str] = None
    preferencias: Optional[Preferencias] = None
