from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from pymongo import ReturnDocument

from database import get_db
from dependencies import get_current_user
from models.usuario import UsuarioUpdate
from utils import serialize_doc

router = APIRouter()


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=422, detail=f"ID inválido: {value}")


@router.get("/{usuario_id}")
async def get_usuario(usuario_id: str, _user=Depends(get_current_user)):
    db = get_db()
    user = await db["usuarios"].find_one({"_id": _oid(usuario_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_doc(user)


@router.put("/{usuario_id}")
async def update_usuario(usuario_id: str, body: UsuarioUpdate, _user=Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    result = await db["usuarios"].find_one_and_update(
        {"_id": _oid(usuario_id)},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
        projection={"password": 0},
    )
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_doc(result)
