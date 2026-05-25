import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

// GET /api/comentarios?cursoId=&leccionId=
router.get("/", async (req, res) => {
  const { cursoId, leccionId } = req.query;
  const filter = {};
  if (cursoId) filter.cursoId = new ObjectId(cursoId);
  if (leccionId) filter.leccionId = new ObjectId(leccionId);

  try {
    const db = getDb();
    const comentarios = await db
      .collection("comentarios")
      .find(filter)
      .sort({ fecha: -1 })
      .toArray();
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comentarios
router.post("/", async (req, res) => {
  const { cursoId, usuarioId, leccionId, contenido, calificacion } = req.body;
  if (!cursoId || !usuarioId || !leccionId || !contenido)
    return res.status(400).json({ error: "cursoId, usuarioId, leccionId y contenido son requeridos" });

  try {
    const db = getDb();
    const comentario = {
      cursoId: new ObjectId(cursoId),
      usuarioId: new ObjectId(usuarioId),
      leccionId: new ObjectId(leccionId),
      contenido,
      calificacion: calificacion ?? null,
      fecha: new Date(),
      respuestas: [],
    };

    const result = await db.collection("comentarios").insertOne(comentario);
    res.status(201).json({ ...comentario, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comentarios/:id/respuestas
router.post("/:id/respuestas", async (req, res) => {
  const { usuarioId, contenido } = req.body;
  if (!usuarioId || !contenido)
    return res.status(400).json({ error: "usuarioId y contenido son requeridos" });

  try {
    const db = getDb();
    const respuesta = {
      usuarioId: new ObjectId(usuarioId),
      contenido,
      fecha: new Date(),
    };

    const result = await db.collection("comentarios").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $push: { respuestas: respuesta } },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Comentario no encontrado" });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
