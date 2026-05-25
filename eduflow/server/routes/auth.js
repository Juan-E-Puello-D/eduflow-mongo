import { Router } from "express";
import { getDb } from "../db.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email y password son requeridos" });

  try {
    const db = getDb();
    const user = await db.collection("usuarios").findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // Plain-text comparison — replace with bcrypt when auth is hardened
    if (user.password !== password)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { nombre, email, password, rol = "estudiante" } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: "nombre, email y password son requeridos" });

  try {
    const db = getDb();
    const exists = await db.collection("usuarios").findOne({ email });
    if (exists) return res.status(409).json({ error: "El email ya está registrado" });

    const newUser = {
      nombre,
      email,
      password,
      rol,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0D6EFD&color=ffffff`,
      fechaRegistro: new Date(),
      preferencias: { idioma: "es", modoOscuro: false },
      ...(rol === "instructor" ? { cursosCreados: [] } : {}),
    };

    const result = await db.collection("usuarios").insertOne(newUser);
    const { password: _, ...safeUser } = { ...newUser, _id: result.insertedId };
    res.status(201).json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
