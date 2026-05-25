from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument

from database import get_db
from dependencies import get_current_user
from models.curso import CursoCreate, CursoUpdate
from utils import serialize_doc

router = APIRouter()


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=422, detail=f"ID inválido: {value}")


@router.get("")
async def list_cursos(
    categoria: str = Query(default=None),
    nivel: str = Query(default=None),
    instructorId: str = Query(default=None),
    q: str = Query(default=None),
):
    db = get_db()
    filt: dict = {}
    if not instructorId:
        filt["publicado"] = True
    if categoria:
        filt["categoria"] = categoria
    if nivel:
        filt["nivel"] = nivel
    if instructorId:
        filt["instructorId"] = _oid(instructorId)
    if q:
        filt["titulo"] = {"$regex": q, "$options": "i"}

    cursor = db["cursos"].find(filt, {"lecciones": 0})
    cursos = await cursor.to_list(length=500)
    return serialize_doc(cursos)


@router.get("/{curso_id}")
async def get_curso(curso_id: str):
    db = get_db()
    curso = await db["cursos"].find_one({"_id": _oid(curso_id)})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return serialize_doc(curso)


@router.post("", status_code=201)
async def create_curso(body: CursoCreate, _user=Depends(get_current_user)):
    db = get_db()
    nuevo = {
        "titulo": body.titulo,
        "descripcion": body.descripcion,
        "instructorId": _oid(body.instructorId),
        "categoria": body.categoria,
        "precio": body.precio,
        "etiquetas": body.etiquetas,
        "duracionTotal": 0,
        "fechaCreacion": datetime.utcnow(),
        "lecciones": [],
        "nivel": body.nivel,
        "publicado": False,
    }
    result = await db["cursos"].insert_one(nuevo)
    await db["usuarios"].update_one(
        {"_id": _oid(body.instructorId)},
        {"$push": {"cursosCreados": result.inserted_id}},
    )
    return serialize_doc({**nuevo, "_id": result.inserted_id})


@router.put("/{curso_id}")
async def update_curso(curso_id: str, body: CursoUpdate, _user=Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    result = await db["cursos"].find_one_and_update(
        {"_id": _oid(curso_id)},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return serialize_doc(result)


@router.delete("/{curso_id}")
async def delete_curso(curso_id: str, _user=Depends(get_current_user)):
    db = get_db()
    oid = _oid(curso_id)
    result = await db["cursos"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    await db["inscripciones"].delete_many({"cursoId": oid})
    await db["comentarios"].delete_many({"cursoId": oid})
    return {"deleted": True}
