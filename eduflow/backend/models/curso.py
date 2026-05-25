from pydantic import BaseModel
from typing import Optional


class Leccion(BaseModel):
    _id: Optional[str] = None
    titulo: str
    videoUrl: str = ""
    duracion: int = 0
    orden: int = 1
    recursos: list[str] = []


class CursoCreate(BaseModel):
    titulo: str
    instructorId: str
    categoria: str
    descripcion: str = ""
    precio: float = 0
    etiquetas: list[str] = []
    nivel: str = "Básico"
    imagen: Optional[str] = None
    lecciones: list[Leccion] = []


class CursoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    etiquetas: Optional[list[str]] = None
    nivel: Optional[str] = None
    publicado: Optional[bool] = None
    duracionTotal: Optional[float] = None
    imagen: Optional[str] = None
    lecciones: Optional[list[Leccion]] = None
