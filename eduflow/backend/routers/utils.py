from fastapi import APIRouter

from database import get_db

router = APIRouter()


@router.get("/categorias")
async def list_categorias():
    db = get_db()
    categorias = await db["cursos"].distinct(
        "categoria",
        {"categoria": {"$exists": True, "$ne": ""}},
    )
    return sorted([c for c in categorias if c is not None])


@router.get("/etiquetas")
async def list_etiquetas():
    db = get_db()
    etiquetas = await db["cursos"].distinct(
        "etiquetas",
        {"etiquetas": {"$exists": True}},
    )
    return sorted([t for t in etiquetas if t is not None and t != ""], key=str.lower)
