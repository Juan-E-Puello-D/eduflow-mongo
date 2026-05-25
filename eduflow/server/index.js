import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";

import authRoutes from "./routes/auth.js";
import cursosRoutes from "./routes/cursos.js";
import usuariosRoutes from "./routes/usuarios.js";
import inscripcionesRoutes from "./routes/inscripciones.js";
import comentariosRoutes from "./routes/comentarios.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/inscripciones", inscripcionesRoutes);
app.use("/api/comentarios", comentariosRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

connectDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
