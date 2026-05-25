import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

// GET /api/inscripciones?usuarioId=&cursoId=
router.get("/", async (req, res) => {
  const { usuarioId, cursoId } = req.query;
  const filter = {};
  if (usuarioId) filter.usuarioId = new ObjectId(usuarioId);
  if (cursoId) filter.cursoId = new ObjectId(cursoId);

  try {
    const db = getDb();
    const inscripciones = await db.collection("inscripciones").find(filter).toArray();
    res.json(inscripciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscripciones  — inscribir un estudiante a un curso
router.post("/", async (req, res) => {
  const { usuarioId, cursoId } = req.body;
  if (!usuarioId || !cursoId)
    return res.status(400).json({ error: "usuarioId y cursoId son requeridos" });

  try {
    const db = getDb();
    const uId = new ObjectId(usuarioId);
    const cId = new ObjectId(cursoId);

    const exists = await db.collection("inscripciones").findOne({ usuarioId: uId, cursoId: cId });
    if (exists) return res.status(409).json({ error: "Ya está inscrito en este curso" });

    const inscripcion = {
      usuarioId: uId,
      cursoId: cId,
      leccionesCompletadas: [],
      porcentajeProgreso: 0,
      fechaInscripcion: new Date(),
      ultimaActividad: new Date(),
    };

    const result = await db.collection("inscripciones").insertOne(inscripcion);
    res.status(201).json({ ...inscripcion, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/inscripciones/:id/progreso — marcar lección como completada
router.patch("/:id/progreso", async (req, res) => {
  const { leccionId, totalLecciones } = req.body;
  if (!leccionId || !totalLecciones)
    return res.status(400).json({ error: "leccionId y totalLecciones son requeridos" });

  try {
    const db = getDb();
    const inscripcion = await db
      .collection("inscripciones")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!inscripcion) return res.status(404).json({ error: "Inscripción no encontrada" });

    const lId = new ObjectId(leccionId);
    const yaCompletada = inscripcion.leccionesCompletadas.some(
      (l) => l.toHexString() === lId.toHexString()
    );
    if (yaCompletada) return res.json(inscripcion);

    const nuevasCompletadas = [...inscripcion.leccionesCompletadas, lId];
    const porcentaje = Math.round((nuevasCompletadas.length / totalLecciones) * 100);

    const result = await db.collection("inscripciones").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          leccionesCompletadas: nuevasCompletadas,
          porcentajeProgreso: porcentaje,
          ultimaActividad: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
