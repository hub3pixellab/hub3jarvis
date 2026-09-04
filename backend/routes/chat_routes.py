"""Chat Routes — Terminal de conversa com a Agnes + pagina web."""
import os
from pathlib import Path
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

router = APIRouter(tags=["Agnes Chat"])
AGNES_KEY = os.getenv("AGNES_API_KEY", "agnes-dev-key")
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

AGNES_CHAT_PROMPT = """Voce e a AGNES, uma astrologa e numerologa de elite com 30 anos de estudo.
Responda com profundidade, acolhimento e tom humano (sem sinais de texto de IA: sem travessoes excessivos, sem negrito solto, sem emojis decorativos).
Baseie-se no conhecimento de numerologia cabalistica e astrologia classica.
Sempre em portugues brasileiro."""

class MensagemChat(BaseModel):
    mensagem: str
    nome: str = ""
    data_nascimento: str = ""
    signo: str = ""
    foco: str = "geral"

@router.get("/", response_class=HTMLResponse)
async def pagina_chat():
    arquivo = STATIC_DIR / "index.html"
    if not arquivo.exists():
        return HTMLResponse("<h1>Pagina nao encontrada</h1>", status_code=404)
    return HTMLResponse(arquivo.read_text(encoding="utf-8"))

@router.post("/api/agnes/chat")
async def chat_agnes(req: MensagemChat, x_api_key: str = Header(None)):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")

    from modules.groq_chat import groq_chat

    contexto = ""
    if req.nome or req.data_nascimento or req.signo:
        numero = ""
        if req.data_nascimento:
            from routes.agnes_routes import _numero_caminho_vida
            numero = _numero_caminho_vida(req.data_nascimento)
        contexto = f"""
Dados do cliente (usar como base se relevante):
- Nome: {req.nome}
- Data de nascimento: {req.data_nascimento}
- Signo: {req.signo}
- Numero do caminho de vida: {numero}
- Foco: {req.foco}
"""

    prompt = AGNES_CHAT_PROMPT + contexto + "\nMensagem do cliente: " + req.mensagem
    resultado = await groq_chat.chat(prompt, temperature=0.7, max_tokens=2000)
    return {
        "resposta": resultado.get("resposta", ""),
        "provider": resultado.get("provider", "unknown"),
        "model": resultado.get("model", "unknown"),
    }
