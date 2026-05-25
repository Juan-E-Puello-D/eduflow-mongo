from pydantic import BaseModel


class InscripcionCreate(BaseModel):
    usuarioId: str
    cursoId: str


class ProgresoUpdate(BaseModel):
    leccionId: str
    totalLecciones: int
