# admin_routes.py — Painel do admin: abastecer e gerenciar o conhecimento da Agnes
import os
import datetime
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from database import get_banco

router = APIRouter(prefix="/api/admin", tags=["Admin Agnes"])
ADMIN_KEY = os.getenv("ADMIN_API_KEY", "agnes-admin-dev-key")

class ConhecimentoNovo(BaseModel):
    titulo: str
    categoria: str = "livre"  # signos | numeros | literatura | livre
    conteudo: str
    ativo: bool = True

def _checar_admin(x_admin_key):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Chave de admin invalida")

@router.get("/conhecimentos")
async def listar_conhecimentos(x_admin_key: str = Header(None)):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")
    docs = []
    async for d in banco["conhecimentos"].find().sort("criado_em", -1):
        d["_id"] = str(d["_id"])
        docs.append(d)
    return {"conhecimentos": docs, "total": len(docs)}

@router.post("/conhecimentos")
async def criar_conhecimento(req: ConhecimentoNovo, x_admin_key: str = Header(None)):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")
    doc = req.model_dump()
    doc["criado_em"] = datetime.datetime.utcnow().isoformat()
    resultado = await banco["conhecimentos"].insert_one(doc)
    return {"id": str(resultado.inserted_id), "mensagem": "Conhecimento salvo"}

@router.put("/conhecimentos/{doc_id}")
async def atualizar_conhecimento(doc_id: str, req: ConhecimentoNovo, x_admin_key: str = Header(None)):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")
    doc = req.model_dump()
    doc["atualizado_em"] = datetime.datetime.utcnow().isoformat()
    resultado = await banco["conhecimentos"].update_one(
        {"_id": ObjectId(doc_id)}, {"$set": doc}
    )
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conhecimento nao encontrado")
    return {"mensagem": "Conhecimento atualizado"}

@router.delete("/conhecimentos/{doc_id}")
async def deletar_conhecimento(doc_id: str, x_admin_key: str = Header(None)):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")
    resultado = await banco["conhecimentos"].delete_one({"_id": ObjectId(doc_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conhecimento nao encontrado")
    return {"mensagem": "Conhecimento removido"}
