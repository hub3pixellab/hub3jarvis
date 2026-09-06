import os

try:
    import google.generativeai as genai
    _TEM_GEMINI = True
except Exception:
    genai = None
    _TEM_GEMINI = False

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MODELO = os.getenv("GEMINI_MODELO", "gemini-2.0-flash")

if _TEM_GEMINI and GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

def chat(mensagem, temperature=0.7, max_tokens=2000):
    """Chamada sync do Gemini. Retorna dict no mesmo formato do groq_chat."""
    if not _TEM_GEMINI:
        return {"resposta": "", "provider": "gemini", "model": MODELO, "erro": "google-generativeai nao instalado"}
    if not GEMINI_KEY:
        return {"resposta": "", "provider": "gemini", "model": MODELO, "erro": "GEMINI_API_KEY nao configurada"}
    try:
        modelo = genai.GenerativeModel(MODELO)
        resposta = modelo.generate_content(
            mensagem,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return {"resposta": resposta.text, "provider": "gemini", "model": MODELO}
    except Exception as e:
        return {"resposta": "", "provider": "gemini", "model": MODELO, "erro": str(e)[:150]}
