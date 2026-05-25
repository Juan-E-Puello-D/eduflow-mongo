from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument

from database import get_db
from dependencies import get_current_user
from models.inscripcion import InscripcionCreate, ProgresoUpdate
from utils import serialize_doc

router = APIRouter()


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=422, detail=f"ID inválido: {value}")


@router.get("/counts")
async def get_student_counts():
    """Devuelve el número de estudiantes por curso. Endpoint público."""
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$cursoId", "total": {"$sum": 1}}}
    ]
    docs = await db["inscripciones"].aggregate(pipeline).to_list(length=None)
    return {str(d["_id"]): d["total"] for d in docs}


@router.get("")
async def list_inscripciones(
    usuarioId: str = Query(default=None),
    cursoId: str = Query(default=None),
    _user=Depends(get_current_user),
):
    db = get_db()
    filt: dict = {}
    if usuarioId:
        filt["usuarioId"] = _oid(usuarioId)
    if cursoId:
        filt["cursoId"] = _oid(cursoId)

    docs = await db["inscripciones"].find(filt).to_list(length=500)
    return serialize_doc(docs)


@router.post("", status_code=201)
async def create_inscripcion(body: InscripcionCreate, _user=Depends(get_current_user)):
    db = get_db()
    u_id = _oid(body.usuarioId)
    c_id = _oid(body.cursoId)

    if await db["inscripciones"].find_one({"usuarioId": u_id, "cursoId": c_id}):
        raise HTTPException(status_code=409, detail="Ya está inscrito en este curso")

    doc = {
        "usuarioId": u_id,
        "cursoId": c_id,
        "leccionesCompletadas": [],
        "porcentajeProgreso": 0,
        "fechaInscripcion": datetime.utcnow(),
        "ultimaActividad": datetime.utcnow(),
    }
    result = await db["inscripciones"].insert_one(doc)
    return serialize_doc({**doc, "_id": result.inserted_id})


@router.patch("/{inscripcion_id}/progreso")
async def update_progreso(
    inscripcion_id: str,
    body: ProgresoUpdate,
    _user=Depends(get_current_user),
):
    db = get_db()
    inscripcion = await db["inscripciones"].find_one({"_id": _oid(inscripcion_id)})
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    l_id = _oid(body.leccionId)
    ya_completada = any(
        str(l) == str(l_id) for l in inscripcion.get("leccionesCompletadas", [])
    )
    if ya_completada:
        return serialize_doc(inscripcion)

    nuevas = inscripcion.get("leccionesCompletadas", []) + [l_id]
    porcentaje = round(len(nuevas) / body.totalLecciones * 100)

    result = await db["inscripciones"].find_one_and_update(
        {"_id": _oid(inscripcion_id)},
        {
            "$set": {
                "leccionesCompletadas": nuevas,
                "porcentajeProgreso": porcentaje,
                "ultimaActividad": datetime.utcnow(),
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    return serialize_doc(result)
