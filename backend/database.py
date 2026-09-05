# database.py — Conexao MongoDB Atlas (conhecimento + assinantes)
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "")
_cliente = None

def get_banco():
    """Retorna o banco 'agnes' do MongoDB (None se nao configurado)."""
    global _cliente
    if not MONGO_URI:
        return None
    if _cliente is None:
        _cliente = AsyncIOMotorClient(MONGO_URI)
    return _cliente["agnes"]
