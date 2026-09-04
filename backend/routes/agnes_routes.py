"""
Agnes Routes — Motor de relatorios astrologicos e numerologicos
Usa o GroqChatEngine (Groq com fallback Ollama) + knowledge-vault
Seguranca: chave intermediaria AGNES_API_KEY no header + rate limit
"""
import os
import time
from pathlib import Path
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/agnes", tags=["Agnes"])

# ===== Configuracao =====
VAULT_ROOT = Path(__file__).resolve().parent.parent / "knowledge-vault"
AGNES_KEY = os.getenv("AGNES_API_KEY", "agnes-dev-key")
RATE_LIMIT = 10
_requests = {}

# ===== Prompt da Agnes =====
AGNES_SYSTEM_PROMPT = """Voce e a AGNES, uma astróloga e numeróloga de elite com 30 anos de estudo.
Sua missao: entregar relatorios profundos, acolhedores e acionaveis, em portugues brasileiro.

METODO DE ANALISE:
1. NUMEROLOGIA: calcule o numero do caminho de vida (soma dia+mes+ano, reduza a 1 digito, exceto 11/22/33).
2. ASTROLOGIA: use o signo solar do usuario e os elementos (fogo/terra/ar/agua) para o perfil.
3. SINCRONIA: cruze o numero do caminho de vida com o signo para revelar talentos e desafios.

ESTRUTURA DO RELATORIO (use **negrito** nos titulos):
**Perfil Essencial** — 2-3 linhas sobre a essencia da pessoa.
**Numero do Caminho de Vida: [X]** — o que ele revela sobre proposito e talentos.
**Influencia Astrologica ([signo])** — forcas, pontos cegos e como usar a energia.
**Sincronia Numero + Signo** — o cruzamento que poucos percebem.
**Proximos 3 Meses** — tendencias praticas (carreira, amor, saude).
**Conselho da Agnes** — 1 frase memoravel e acionavel.

REGRAS:
- Consulte o conhecimento do vault (literatura de astrologia e numerologia) para enriquecer.
- Seja especifico e pessoal, nunca generico. Use os dados fornecidos.
- Tom acolhedor, elevado, sem medo nem fatalismo.
- Sempre em portugues brasileiro."""

# ===== Modelos de dados =====
class RequisicaoRelatorio(BaseModel):
    nome: str
    data_nascimento: str
    hora_nascimento: str = ""
    cidade_nascimento: str = ""
    signo: str = ""
    foco: str = "geral"

# ===== Rate limit =====
def _check_rate_limit(client_ip: str):
    agora = time.time()
    _requests.setdefault(client_ip, [])
    _requests[client_ip] = [t for t in _requests[client_ip] if agora - t < 60]
    if len(_requests[client_ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Muitos relatorios. Aguarde 1 minuto.")
    _requests[client_ip].append(agora)

# ===== Leitura do vault =====
def _ler_vault():
    conteudos = []
    for ext in ("*.md", "*.txt"):
        for arquivo in VAULT_ROOT.rglob(ext):
            try:
                texto = arquivo.read_text(encoding="utf-8", errors="ignore")
                if texto.strip():
                    conteudos.append("[Fonte: " + arquivo.name + "]\n" + texto[:3000])
            except Exception:
                continue
    return "\n\n".join(conteudos)[:20000]

# ===== Calculo numerologico =====
def _numero_caminho_vida(data: str) -> int:
    try:
        dia, mes, ano = map(int, data.split("/"))
    except Exception:
        return 0
    total = dia + mes + ano
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(d) for d in str(total))
    return total

# ===== Rota principal =====
@router.post("/relatorio")
async def gerar_relatorio(
    req: RequisicaoRelatorio,
    x_api_key: str = Header(None),
    x_forwarded_for: str = Header(None),
):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")

    client_ip = (x_forwarded_for or "local").split(",")[0].strip()
    _check_rate_limit(client_ip)

    numero = _numero_caminho_vida(req.data_nascimento)
    # ==== Conhecimento da Agnes (signos e numeros) ====
    from conhecimento_agnes import obter_conhecimento, NUMEROS as NUMEROS_AGNES
    conhecimento = obter_conhecimento(req.signo, req.foco)
    signo_info = conhecimento["signo"]
    chave_foco = req.foco.lower().strip()
    texto_foco = signo_info.get(chave_foco, signo_info.get("carreira", ""))
    bloco_signo = (
        "SIGNO (" + signo_info["nome"] + "):\n"
        "- Elemento: " + signo_info["elemento"] + " | Qualidade: " + signo_info["qualidade"] + "\n"
        "- Palavra-chave: " + signo_info["palavra_chave"] + "\n"
        "- Perfil positivo: " + signo_info["positivo"] + "\n"
        "- Perfil a desenvolver: " + signo_info["negativo"] + "\n"
        "- Foco em " + req.foco + ": " + texto_foco + "\n"
        "- Cores favoraveis: " + signo_info["cores"] + "\n"
        "- Numerologia: " + signo_info["numerologia"] + "\n"
        "- Numeros harmonicos: " + signo_info.get("numeros_harmonicos", "") + "\n"
    )
    bloco_numero = ""
    if numero and str(numero) in NUMEROS_AGNES:
        num_info = NUMEROS_AGNES[str(numero)]
        bloco_numero = (
            "NUMERO DO CAMINHO DE VIDA [" + str(numero) + "]:\n"
            "- Essencia: " + num_info["positivo"] + "\n"
            "- A desenvolver: " + num_info["negativo"] + "\n"
        )
    vault_texto = _ler_vault()

    # Monta o bloco de conhecimento ANTES do f-string (evita backslash dentro de {})
    if vault_texto:
        bloco_conhecimento = "CONHECIMENTO DO VAULT:\n" + vault_texto
    else:
        bloco_conhecimento = ""

    prompt_usuario = f"""
Dados do cliente:
- Nome: {req.nome}
- Data de nascimento: {req.data_nascimento}
- Hora: {req.hora_nascimento or "nao informada"}
- Cidade: {req.cidade_nascimento or "nao informada"}
- Signo: {req.signo or "inferir da data"}
- Foco do relatorio: {req.foco}
- Numero do caminho de vida calculado: {numero}

Gere o relatorio completo seguindo a estrutura definida, usando o conhecimento abaixo.
{bloco_signo}{bloco_numero}
{bloco_conhecimento}
"""

    from modules.groq_chat import groq_chat
    resultado = await groq_chat.chat(prompt_usuario, temperature=0.8, max_tokens=3000)

    return {
        "relatorio": resultado.get("resposta", ""),
        "numero_caminho_vida": numero,
        "provider": resultado.get("provider", "unknown"),
        "model": resultado.get("model", "unknown"),
        "cliente": req.nome,
    }

# ===== Rota de status =====
@router.get("/status")
async def agnes_status(x_api_key: str = Header(None)):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    from modules.groq_chat import groq_chat
    return {
        "agnes": "online",
        "provider": "groq" if groq_chat.configured else "ollama (fallback)",
        "model": groq_chat.model,
        "vault": str(VAULT_ROOT),
        "vault_existe": VAULT_ROOT.exists(),
    }

# ===== STRIPE CHECKOUT =====
import stripe
from fastapi import Request

STRIPE_SECRET = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE = os.getenv("STRIPE_PRICE_ID", "")

if STRIPE_SECRET:
    stripe.api_key = STRIPE_SECRET

class RequisicaoCheckout(BaseModel):
    nome: str
    data_nascimento: str
    signo: str = ""
    foco: str = "geral"
    success_url: str = "http://localhost:3000/sucesso"
    cancel_url: str = "http://localhost:3000"

@router.post("/checkout")
async def criar_checkout(req: RequisicaoCheckout, x_api_key: str = Header(None)):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    if not STRIPE_SECRET or not STRIPE_PRICE:
        raise HTTPException(status_code=500, detail="Stripe nao configurado")

    try:
        sessao = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRICE, "quantity": 1}],
            mode="payment",
            success_url=req.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=req.cancel_url,
            metadata={
                "nome": req.nome,
                "data_nascimento": req.data_nascimento,
                "signo": req.signo,
                "foco": req.foco,
            },
        )
        return {"checkout_url": sessao.url, "session_id": sessao.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Stripe: {str(e)}")

@router.post("/webhook")
async def webhook_stripe(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook nao configurado")

    try:
        evento = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Assinatura invalida")

    if evento["type"] == "checkout.session.completed":
        sessao = evento["data"]["object"]
        meta = sessao.get("metadata", {})
        print("PAGAMENTO CONFIRMADO para:", meta.get("nome"))
        print("Dados:", meta)
        return {"status": "ok", "pago": True, "cliente": meta.get("nome")}

    return {"status": "ignored"}

# ===== RELATORIO PDF =====
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
import re

def _limpar_markdown(texto):
    t = texto
    t = re.sub(r'!\[.*?\]\(.*?\)', '', t)
    t = re.sub(r'\[(.*?)\]\(.*?\)', r'', t)
    t = re.sub(r'\*\*(.*?)\*\*', r'', t)
    t = re.sub(r'\*(.*?)\*', r'', t)
    t = re.sub(r'^#{1,6}\s*', '', t, flags=re.M)
    t = re.sub(r'^\s*[-*]\s+', '• ', t, flags=re.M)
    t = re.sub(r'^\s*\|.*\|$', '', t, flags=re.M)
    t = re.sub(r'[|]', ' ', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    # remove emoji e caracteres fora do latin-1 (fonte Helvetica do reportlab)
    t = t.encode('latin-1', errors='ignore').decode('latin-1')
    # escapa caracteres especiais XML do reportlab
    t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return t.strip()

class RequisicaoRelatorioPDF(BaseModel):
    nome: str
    data_nascimento: str
    signo: str = ""
    foco: str = "geral"

@router.post("/relatorio/pdf")
async def relatorio_pdf(req: RequisicaoRelatorioPDF, x_api_key: str = Header(None), x_forwarded_for: str = Header(None)):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    resultado = await gerar_relatorio(RequisicaoRelatorio(nome=req.nome, data_nascimento=req.data_nascimento, signo=req.signo, foco=req.foco), x_api_key=x_api_key, x_forwarded_for=x_forwarded_for)
    texto = resultado.get("relatorio", "Erro ao gerar relatorio")
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm)
    estilos = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=estilos['Title'], alignment=TA_CENTER, fontSize=18, spaceAfter=10)
    corpo = ParagraphStyle('Corpo', parent=estilos['BodyText'], fontSize=10, leading=15)
    elementos = []
    elementos.append(Paragraph("Relatório de Análise - " + req.nome, titulo))
    elementos.append(Spacer(1, 6*mm))
    for bloco in texto.split('\n'):
        bloco = bloco.strip()
        if not bloco:
            continue
        bloco_limpo = _limpar_markdown(bloco)
        if bloco_limpo:
            elementos.append(Paragraph(bloco_limpo.replace('\n', '<br/>'), corpo))
            elementos.append(Spacer(1, 2*mm))
    doc.build(elementos)
    buf.seek(0)
    nome_arquivo = "relatorio_agnes_" + req.nome.replace(' ', '_') + ".pdf"
    return StreamingResponse(buf, media_type="application/pdf", headers={"Content-Disposition": 'attachment; filename="' + nome_arquivo + '"'})
