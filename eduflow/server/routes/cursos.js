import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

// GET /api/cursos?categoria=&nivel=&instructorId=&q=
router.get("/", async (req, res) => {
  const { categoria, nivel, instructorId, q } = req.query;
  const filter = { publicado: true };

  if (categoria) filter.categoria = categoria;
  if (nivel) filter.nivel = nivel;
  if (instructorId) filter.instructorId = new ObjectId(instructorId);
  if (q) filter.titulo = { $regex: q, $options: "i" };

  try {
    const db = getDb();
    const cursos = await db
      .collection("cursos")
      .find(filter)
      .project({ lecciones: 0 })
      .toArray();
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cursos/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const curso = await db
      .collection("cursos")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    res.json(curso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cursos
router.post("/", async (req, res) => {
  const { titulo, descripcion, instructorId, categoria, precio, etiquetas, nivel } = req.body;
  if (!titulo || !instructorId || !categoria)
    return res.status(400).json({ error: "titulo, instructorId y categoria son requeridos" });

  try {
    const db = getDb();
    const nuevoCurso = {
      titulo,
      descripcion: descripcion || "",
      instructorId: new ObjectId(instructorId),
      categoria,
      precio: precio ?? 0,
      etiquetas: etiquetas || [],
      duracionTotal: 0,
      fechaCreacion: new Date(),
      lecciones: [],
      nivel: nivel || "Básico",
      publicado: false,
    };

    const result = await db.collection("cursos").insertOne(nuevoCurso);
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(instructorId) },
      { $push: { cursosCreados: result.insertedId } }
    );

    res.status(201).json({ ...nuevoCurso, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cursos/:id
router.put("/:id", async (req, res) => {
  const { _id, instructorId, ...updates } = req.body;
  try {
    const db = getDb();
    const result = await db
      .collection("cursos")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" }
      );
    if (!result) return res.status(404).json({ error: "Curso no encontrado" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cursos/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const cursoId = new ObjectId(req.params.id);
    const result = await db.collection("cursos").deleteOne({ _id: cursoId });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Curso no encontrado" });

    await db.collection("inscripciones").deleteMany({ cursoId });
    await db.collection("comentarios").deleteMany({ cursoId });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
