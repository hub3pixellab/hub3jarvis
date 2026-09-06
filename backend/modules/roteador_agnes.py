# Roteador: tema do Mestre Agnes -> Agnes (groq) com fallback Gemini; resto -> Gemini

TEMAS_AGNES = [
    "astrologia", "astrologico", "astral", "mapa astral", "signo", "signos",
    "numerologia", "numerologico", "caminho de vida", "numero da vida",
    "eneagrama", "eneagramatico", "compatibilidade", "compativel",
    "mestre agnes", "oraculo", "tarot", "carma", "karma", "proposito de vida",
    "transito", "transitos", "retorno de saturno", "oposicao de urano",
    "ascendente", "planeta", "planetas", "casas astrologicas", "aspectos astrologicos",
    "espiral dinamica", "fractal", "teoria do caos", "vibracao", "energia",
    "autoconhecimento", "autodescoberta", "personalidade", "psique", "signo",
]

def e_tema_agnes(mensagem: str) -> bool:
    msg = (mensagem or "").lower()
    return any(t in msg for t in TEMAS_AGNES)

def _resposta_ok(r) -> bool:
    texto = ((r or {}).get("resposta", "") or "").strip()
    if not texto or texto.lower().startswith(("erro", "api", "chave", "exception", "traceback")):
        return False
    return True

async def responder(mensagem, temperature=0.8):
    """Roteia a mensagem:
    - Tema da Agnes -> tenta groq (Agnes); se falhar, usa Gemini (fallback).
    - Conversa aleatoria -> sempre Gemini."""
    from modules.gemini_chat import chat as gemini

    if not e_tema_agnes(mensagem):
        return gemini(mensagem, temperature=temperature, max_tokens=2000)

    try:
        from modules.groq_chat import groq_chat
        r = await groq_chat.chat(mensagem, temperature=temperature, max_tokens=3000)
    except Exception:
        r = {}

    if _resposta_ok(r):
        return r  # Agnes acordou e assumiu o tema

    # LLM principal fora do ar -> Gemini assume temporariamente
    return gemini(mensagem, temperature=temperature, max_tokens=2000)
