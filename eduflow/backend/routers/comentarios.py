from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument

from database import get_db
from models.comentario import ComentarioCreate, RespuestaCreate
from utils import serialize_doc

router = APIRouter()


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=422, detail=f"ID inválido: {value}")


@router.get("")
async def list_comentarios(
    cursoId: str = Query(default=None),
    leccionId: str = Query(default=None),
):
    db = get_db()
    filt: dict = {}
    if cursoId:
        filt["cursoId"] = _oid(cursoId)
    if leccionId:
        filt["leccionId"] = _oid(leccionId)

    docs = await db["comentarios"].find(filt).sort("fecha", -1).to_list(length=500)
    return serialize_doc(docs)


@router.post("", status_code=201)
async def create_comentario(body: ComentarioCreate):
    db = get_db()
    doc = {
        "cursoId": _oid(body.cursoId),
        "usuarioId": _oid(body.usuarioId),
        "leccionId": _oid(body.leccionId),
        "contenido": body.contenido,
        "calificacion": body.calificacion,
        "fecha": datetime.utcnow(),
        "respuestas": [],
    }
    result = await db["comentarios"].insert_one(doc)
    return serialize_doc({**doc, "_id": result.inserted_id})


@router.post("/{comentario_id}/respuestas", status_code=201)
async def add_respuesta(comentario_id: str, body: RespuestaCreate):
    db = get_db()
    respuesta = {
        "usuarioId": _oid(body.usuarioId),
        "contenido": body.contenido,
        "fecha": datetime.utcnow(),
    }
    result = await db["comentarios"].find_one_and_update(
        {"_id": _oid(comentario_id)},
        {"$push": {"respuestas": respuesta}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    return serialize_doc(result)
