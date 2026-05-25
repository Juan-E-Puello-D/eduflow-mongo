from pydantic import BaseModel
from typing import Optional


class ComentarioCreate(BaseModel):
    cursoId: str
    usuarioId: str
    leccionId: str
    contenido: str
    calificacion: Optional[float] = None


class RespuestaCreate(BaseModel):
    usuarioId: str
    contenido: str
