from fastapi import APIRouter

from database import get_db

router = APIRouter()


@router.get("/resumen")
async def get_resumen():
    """
    Calcula métricas globales de la plataforma usando aggregation pipelines de MongoDB.
    Endpoint público (no requiere autenticación).
    """
    db = get_db()

    # 1. Popularidad por categoría: cursos con $lookup a inscripciones, agrupados por categoría
    pipeline_categorias = [
        {"$match": {"publicado": True}},
        {
            "$lookup": {
                "from": "inscripciones",
                "localField": "_id",
                "foreignField": "cursoId",
                "as": "inscripciones",
            }
        },
        {
            "$group": {
                "_id": "$categoria",
                "totalEstudiantes": {"$sum": {"$size": "$inscripciones"}},
                "totalCursos": {"$sum": 1},
            }
        },
        {"$sort": {"totalEstudiantes": -1}},
        {"$project": {"_id": 0, "categoria": "$_id", "totalEstudiantes": 1, "totalCursos": 1}},
    ]

    # 2. Total certificaciones: inscripciones con 100% de progreso
    pipeline_cert = [
        {"$match": {"porcentajeProgreso": 100}},
        {"$count": "total"},
    ]

    # 3. Total de estudiantes únicos con al menos una inscripción
    pipeline_estudiantes = [
        {"$group": {"_id": "$usuarioId"}},
        {"$count": "total"},
    ]

    # 4. Promedio global de progreso
    pipeline_progreso = [
        {"$group": {"_id": None, "promedio": {"$avg": "$porcentajeProgreso"}}},
    ]

    # 5. Total de cursos publicados
    pipeline_cursos = [
        {"$match": {"publicado": True}},
        {"$count": "total"},
    ]

    # Ejecutar todos en paralelo con gather
    import asyncio

    (
        categorias,
        cert_result,
        estudiantes_result,
        progreso_result,
        cursos_result,
    ) = await asyncio.gather(
        db["cursos"].aggregate(pipeline_categorias).to_list(length=None),
        db["inscripciones"].aggregate(pipeline_cert).to_list(length=1),
        db["inscripciones"].aggregate(pipeline_estudiantes).to_list(length=1),
        db["inscripciones"].aggregate(pipeline_progreso).to_list(length=1),
        db["cursos"].aggregate(pipeline_cursos).to_list(length=1),
    )

    total_certificaciones = cert_result[0]["total"] if cert_result else 0
    total_estudiantes = estudiantes_result[0]["total"] if estudiantes_result else 0
    promedio_progreso = round(progreso_result[0]["promedio"], 1) if progreso_result else 0
    total_cursos_publicados = cursos_result[0]["total"] if cursos_result else 0

    return {
        "popularidad_por_categoria": categorias,
        "total_certificaciones": total_certificaciones,
        "total_estudiantes": total_estudiantes,
        "promedio_progreso": promedio_progreso,
        "total_cursos_publicados": total_cursos_publicados,
    }
