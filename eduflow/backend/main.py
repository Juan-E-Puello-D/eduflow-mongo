import os
from dotenv import load_dotenv

load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import lifespan
from routers import auth, cursos, usuarios, inscripciones, comentarios

app = FastAPI(title="EduFlow API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(cursos.router, prefix="/api/cursos", tags=["cursos"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["usuarios"])
app.include_router(inscripciones.router, prefix="/api/inscripciones", tags=["inscripciones"])
app.include_router(comentarios.router, prefix="/api/comentarios", tags=["comentarios"])


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 4000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
