import os
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

_client: AsyncIOMotorClient | None = None


def _get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI no esta definida en .env")
        _client = AsyncIOMotorClient(
            uri,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )
    return _client


def get_db():
    db_name = os.getenv("MONGODB_DB", "eduflow")
    return _get_client()[db_name]


@asynccontextmanager
async def lifespan(app):
    client = _get_client()
    db_name = os.getenv("MONGODB_DB", "eduflow")
    try:
        await client[db_name].command("ping")
        print(f"[OK] Conectado a MongoDB: {db_name}")
    except Exception as e:
        print(f"[WARN] MongoDB no disponible al iniciar: {e}")
    yield
    client.close()
    print("[OK] Conexion MongoDB cerrada")
