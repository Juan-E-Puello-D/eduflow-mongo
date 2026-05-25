import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

// GET /api/usuarios/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const user = await db
      .collection("usuarios")
      .findOne({ _id: new ObjectId(req.params.id) }, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/usuarios/:id
router.put("/:id", async (req, res) => {
  const { _id, email, password, ...updates } = req.body;
  try {
    const db = getDb();
    const result = await db
      .collection("usuarios")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after", projection: { password: 0 } }
      );
    if (!result) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
