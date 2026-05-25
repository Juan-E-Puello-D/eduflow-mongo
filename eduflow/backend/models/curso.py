from pydantic import BaseModel
from typing import Optional


class CursoCreate(BaseModel):
    titulo: str
    instructorId: str
    categoria: str
    descripcion: str = ""
    precio: float = 0
    etiquetas: list[str] = []
    nivel: str = "Básico"


class CursoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    etiquetas: Optional[list[str]] = None
    nivel: Optional[str] = None
    publicado: Optional[bool] = None
    duracionTotal: Optional[float] = None
