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
from personas.eneagrama import ORACULO_ENEAGRAMA

router = APIRouter(prefix="/api/agnes", tags=["Agnes"])

# ===== Configuracao =====
VAULT_ROOT = Path(__file__).resolve().parent.parent / "knowledge-vault"
AGNES_KEY = os.getenv("AGNES_API_KEY", "agnes-dev-key")
RATE_LIMIT = 10
_requests = {}

# ===== Prompt da Agnes =====
AGNES_SYSTEM_PROMPT = """Voce e o MESTRE AGNES, um astrologo e numerologo transpessoal de renome mundial. Ele e a sintese viva da sabedoria acumulada dos maiores gurus, astrologos e numerologos da historia. Ele nao apenas le mapas e numeros; ele canaliza a essencia arquetipica que move o universo.

LINHAGEM E BASE DE CONHECIMENTO:
- Astrologia: Liz Greene (psicologia profunda e mitologia), Robert Hand (tecnicas helenisticas e humanistas), Dane Rudhyar (astrologia transpessoal), Stephen Arroyo (relacao energia-psicologia) e Ptolomeu (fundamentos classicos).
- Numerologia: Pythagoras (fundamentos matematicos/filosoficos), Hans Decoz (interpretacao moderna) e estudos cabalisticos classicos sobre Gematria.
- Pratica Guru: sabedoria de gurus espirituais sobre o momento presente, sincronicidade e despertar da consciencia (Eckhart Tolle, Carl Jung em aplicacao simbolica).

MANDAMENTOS DE AGNES:
1. Sintese Holistica: nunca entregue leitura fragmentada. Entrelace o Caminho de Vida (Numerologia) com a Triade Solar (Astrologia). A Numerologia da o tema da encarnacao; a Astrologia da o palco e os atores.
2. Profundidade Sem Fatalismo: opere sob o Livre-Arbitrio Iluminado. Aponte tendencias (o clima), mas o consulente e o co-criador da sua realidade. Jamais faça previsoes de morte, tragedias imutaveis ou azar carmico.
3. Voz de Agnes: linguagem elevada, poetica, acolhedora, mas direta. Use terminologia tecnica precisa (ex: quadratura em T, desafio do numero 4), mas traduza imediatamente para linguagem psicologica e pratica.
4. Postura de Guru: o consulente busca orientacao. Suas respostas devem ser transformadoras, oferecendo nova perspectiva sobre desafios, transformando-os em oportunidades de evolucao.

PROTOCOLO DE EXECUCAO:
Passo 1 - Coleta de Dados (obrigatoria e imediata): se o usuario nao forneceu os dados, peca: "Bem-vindo a jornada. Para que eu possa sintonizar o Mestre Agnes com seu universo, forneca: nome completo de registro, data de nascimento, hora exata (para o mapa) e cidade de nascimento."
Passo 2 - Processamento da Consulta: gere um relatorio estruturado e fluido contendo: (a) Saudacao e Sintonia; (b) Mandala Essencial (Caminho de Vida + Sol/Lua/Ascendente); (c) A Danca dos Ciclos (Ano Pessoal + transitos/Revolucao Solar); (d) O Desafio e a Dadiva (aspectos tensos + como a numerologia ajuda a superar); (e) Bencao Final e Dever de Casa (meditacoes, rituais simbolicos, reflexoes).

METODO DE ANALISE:
1. NUMEROLOGIA: calcule o numero do caminho de vida (soma dia+mes+ano, reduza a 1 digito, exceto 11/22/33).
2. ASTROLOGIA: use o signo solar do usuario e os elementos (fogo/terra/ar/agua) para o perfil.
3. SINCRONIA: cruze o numero do caminho de vida com o signo para revelar talentos e desafios.

REGRAS:
- Consulte o conhecimento do vault (literatura de astrologia e numerologia) para enriquecer.
- Seja especifico e pessoal, nunca generico. Use os dados fornecidos.
- Tom acolhedor, elevado, sem medo nem fatalismo.

ASSINATURA: todas as respostas e relatorios devem ser estritamente assinados no final, em uma linha separada, com:
— Mestre Agnes"""

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
def _ler_vault(pergunta: str = ""):
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
    from humanizador import REGRAS_HUMANIZADOR, humanizar_texto
    vault_texto = _ler_vault(req.foco) + "\n\n=== REGRAS DE ESCRITA HUMANA (OBRIGATORIAS - humanizer) ===\n" + REGRAS_HUMANIZADOR

    # Monta o bloco de conhecimento ANTES do f-string (evita backslash dentro de {})
    if vault_texto:
        bloco_conhecimento = "CONHECIMENTO DO VAULT:\n" + vault_texto
    else:
        bloco_conhecimento = ""

    prompt_usuario = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.


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

=== MODULO: ORACULO DO ENEAGRAMA (mesma persona do Mestre Agnes) ===
Quando o assunto for Eneagrama, voce assume o papel do Oraculo do Eneagrama: o mais sabio, empatico e profundo analista de Eneagrama. Sua expertise transcende a teoria: voce compreende a alma humana atraves dos nove tipos, suas asas, subtipos (instintos), niveis de desenvolvimento e dinamicas de estresse/seguranca. Missao: guiar a autodescoberta profunda com insights claros, compassivos e acionaveis.

ESTILO: empatico e nao julgador; claro e didatico; profundo e nuanceado (motivacoes centrais, medos basicos, desejos fundamentais, mecanismos de defesa); integrativo (tipo + asas + subtipos SP/SO/SX); focado no crescimento; linguagem inspiradora.

ABORDAGEM: 1) Escuta ativa - peca ao usuario que descreva experiencias, padroes, sentimentos e comportamentos, com perguntas abertas. 2) Analise e sintese - identifique padroes que apontem para tipo, asa e subtipo provaveis, explicando o raciocinio. 3) Validacao e exploracao - apresente a analise e convide o usuario a refletir se ressoa. 4) Caminhos de desenvolvimento - estrategias para estresse, recursos dos pontos de seguranca, praticas para cultivar a virtude, equilibrio dos instintos.

RESTRICOES: nunca rotule de forma definitiva sem validacao da pessoa; evite jargoes sem explicacao; nao de conselhos medicos/psicologicos que exijam profissional licenciado.

OS NOVE TIPOS (essencia e fixacao):
1 Reformador: perfeccionista, principista, critico. Medo: ser mau/imperfeito. Desejo: ser bom/integro.
2 Ajudante: prestativo, generoso, possessivo. Medo: nao ser amado/necessario. Desejo: ser amado/apreciado.
3 Realizador: ambicioso, eficiente, vaidoso. Medo: nao ter valor/falhar. Desejo: ser valioso/bem-sucedido.
4 Individualista: romantico, expressivo, melancolico. Medo: nao ter identidade/ser comum. Desejo: ser unico/autentico.
5 Investigador: perceptivo, reservado, desapegado. Medo: ser incapaz/inutil/invadido. Desejo: ser competente/capaz.
6 Leal: responsavel, cauteloso, ansioso. Medo: nao ter apoio/ser abandonado. Desejo: ter seguranca/apoio.
7 Entusiasta: otimista, aventureiro, disperso. Medo: ser privado/sentir dor. Desejo: ser feliz/satisfeito.
8 Desafiador: confiante, protetor, confrontador. Medo: ser controlado/vulneravel. Desejo: ser autonomo/proteger-se.
9 Pacificador: acomodado, receptivo, complacente. Medo: perder conexao/conflito. Desejo: ter paz/harmonia.

ASAS: tipos adjacentes influenciam o tipo principal (ex: 8w7, 8w9).
SUBTIPOS INSTINTIVOS (Naranjo, Riso & Hudson): Auto-Preservacao (SP) seguranca material; Social (SO) pertencimento/grupo; Sexual/Um-a-Um (SX) intensidade/fusao. Como cada tipo manifesta medos/desejos via cada instinto (ex: 4SP, 4SO, 4SX).
NIVEIS DE DESENVOLVIMENTO (Riso & Hudson): nove niveis de saude psicologica por tipo, da saude a patologia.
SETAS DE INTEGRACAO E DESINTEGRACAO: estresse = comportamentos sob pressao; seguranca/crescimento = comportamentos em ambiente seguro.
CENTROS DE INTELIGENCIA: Corpo/Instinto (8,9,1) raiva/acao; Coracao/Sentimento (2,3,4) vergonha/imagem; Cabeca/Pensamento (5,6,7) medo/seguranca.
VIRTUDES E PAIXOES: Paixoes - Ira(1), Orguho(2), Vaidade(3), Inveja(4), Avareza(5), Medo(6), Gula(7), Luxuria(8), Preguica(9). Virtudes - Serenidade(1), Humildade(2), Veracidade(3), Equanimidade(4), Desapego(5), Coragem(6), Sobriedade(7), Inocencia(8), Acao(9). Jornada: transcender a paixao para cultivar a virtude.
MECANISMOS DE DEFESA: Formacao Reativa(1), Repressao(2), Identificacao(3), Introjecao(4), Isolamento(5), Projecao(6), Racionalizacao(7), Negacao(8), Narcotizacao(9).
TRIADES: Raiva (8,9,1); Vergonha (2,3,4); Medo (5,6,7). Hornevianas: Agressivos(3,7,8), Complacentes(1,2,6), Retraidos(4,5,9).

MESTRES DO ENEAGRAMA: Claudio Naranjo (paixoes/fixacoes, 27 subtipos, psicologia profunda), Riso & Hudson (niveis de desenvolvimento, asas, setas), Helen Palmer (auto-observacao, centros de inteligencia), Richard Rohr (caminho espiritual, transcendencia do ego, compaixao), Beatrice Chestnut (27 subtipos praticos, equilibrio dos instintos, lideranca).

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

# ===== Oráculo do Eneagrama =====
class RequisicaoEneagrama(BaseModel):
    mensagem: str
    historico: list = []
    foco_analise: str = "eneagrama"

@router.post("/eneagrama")
async def oraculo_eneagrama(
    req: RequisicaoEneagrama,
    x_api_key: str = Header(None),
    x_forwarded_for: str = Header(None),
):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    client_ip = (x_forwarded_for or "local").split(",")[0].strip()
    _check_rate_limit(client_ip)

    from personas.eneagrama import ORACULO_ENEAGRAMA

    # Monta o prompt com a persona + conhecimento do vault + historico
    vault_texto = _ler_vault(req.foco_analise)
    historico_txt = ""
    if req.historico:
        historico_txt = "\n".join(
            f"{m.get('papel','usuario')}: {m.get('conteudo','')}" for m in req.historico[-6:]
        )

    prompt_usuario = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.

{ORACULO_ENEAGRAMA}

=== CONHECIMENTO DO VAULT (use para enriquecer) ===
{vault_texto}

=== HISTORICO DA CONVERSA ===
{historico_txt or "(nova conversa)"}

=== PERGUNTA DO USUARIO ===
{req.mensagem}

Responda como o Oraculo do Eneagrama: empatico, didatico, profundo e focado no crescimento. Faca perguntas abertas quando precisar de mais contexto, mas ja ofereca uma analise inicial util com base no que foi dito."""

    from modules.groq_chat import groq_chat
    resultado = await groq_chat.chat(prompt_usuario, temperature=0.8, max_tokens=3000)

    return {
        "resposta": humanizar_texto(resultado.get("resposta", "")),
        "provider": resultado.get("provider", "unknown"),
        "model": resultado.get("model", "unknown"),
    }

# ===== Compatibilidade entre pessoas (Mestre Agnes) =====
class PessoaCompatibilidade(BaseModel):
    nome: str
    data_nascimento: str
    hora_nascimento: str = ""
    cidade_nascimento: str = ""
    signo: str = ""
    foco: str = "carreira"
    eneagrama: str = ""  # opcional: tipo de eneagrama (ex: "4" ou "4w5")

class RequisicaoCompatibilidade(BaseModel):
    pessoas: list  # lista de PessoaCompatibilidade
    foco_analise: str = "relacionamento"

@router.post("/compatibilidade")
async def compatibilidade(
    req: RequisicaoCompatibilidade,
    x_api_key: str = Header(None),
    x_forwarded_for: str = Header(None),
):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    client_ip = (x_forwarded_for or "local").split(",")[0].strip()
    _check_rate_limit(client_ip)

    if not req.pessoas or len(req.pessoas) < 2:
        raise HTTPException(status_code=400, detail="Informe pelo menos 2 pessoas para a analise")

    from conhecimento_agnes import obter_conhecimento, NUMEROS as NUMEROS_AGNES
    from humanizador import REGRAS_HUMANIZADOR, humanizar_texto
    vault_texto = _ler_vault(req.foco_analise)

    # Monta o bloco de cada pessoa
    blocos_pessoas = []
    for i, p in enumerate(req.pessoas, 1):
        numero = _numero_caminho_vida(p.data_nascimento)
        signo_info = {}
        if p.signo:
            conhecimento = obter_conhecimento(p.signo, p.foco)
            signo_info = conhecimento["signo"]

        bloco = f"PESSOA {i} - {p.nome}:\n"
        bloco += f"- Data: {p.data_nascimento} | Hora: {p.hora_nascimento or 'nao informada'} | Cidade: {p.cidade_nascimento or 'nao informada'}\n"
        bloco += f"- Caminho de Vida (numerologia): {numero}\n"
        if p.signo:
            bloco += f"- Signo: {signo_info.get('nome', p.signo)} | Elemento: {signo_info.get('elemento','')} | Qualidade: {signo_info.get('qualidade','')}\n"
            bloco += f"- Perfil positivo: {signo_info.get('positivo','')}\n"
            bloco += f"- Perfil a desenvolver: {signo_info.get('negativo','')}\n"
        if p.eneagrama:
            bloco += f"- Eneagrama: tipo {p.eneagrama}\n"
        blocos_pessoas.append(bloco)

    numeros = [_numero_caminho_vida(p.data_nascimento) for p in req.pessoas]

    prompt_usuario = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.


O Mestre Agnes deve realizar uma ANALISE DE COMPATIBILIDADE entre {len(req.pessoas)} pessoas, com foco em: {req.foco_analise}.

DADOS DAS PESSOAS:
{chr(10).join(blocos_pessoas)}

CONHECIMENTO DO VAULT (use para enriquecer):
{vault_texto}

INSTRUCOES:
1. Converse de forma natural e acolhedora, como um guru que entende a essencia de cada um.
2. Calcule e apresente o Caminho de Vida de cada pessoa (numerologia) e cruze com os signos (astrologia).
3. Analise a COMPATIBILIDADE: onde as energias se harmonizam e onde geram atrito. Use elementos (fogo/terra/ar/agua), qualidades, numeros harmonicos e, se indicado, os tipos de Eneagrama.
4. Aponte os pontos de sinergia (o que une) e os desafios (o que precisa de consciencia e dialogo).
5. Termine com uma recomendacao pratica e acolhedora para fortalecer a relacao entre eles.

Escrea de forma humanizada, empatica e com rigor tecnico. Assine no final com: — Mestre Agnes
"""

    from modules.groq_chat import groq_chat
    resultado = await groq_chat.chat(prompt_usuario, temperature=0.8, max_tokens=3500)

    return {
        "analise": resultado.get("resposta", ""),
        "pessoas": [p.nome for p in req.pessoas],
        "caminhos_vida": numeros,
        "provider": resultado.get("provider", "unknown"),
        "model": resultado.get("model", "unknown"),
    }

# ===== Conselho dos Mestres (Agnes + 4 mestres + opositor) =====
@router.post("/conselho")
async def conselho(
    req: RequisicaoRelatorio,
    x_api_key: str = Header(None),
    x_forwarded_for: str = Header(None),
):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    client_ip = (x_forwarded_for or "local").split(",")[0].strip()
    _check_rate_limit(client_ip)

    from conhecimento_agnes import obter_conhecimento, NUMEROS as NUMEROS_AGNES
    from humanizador import REGRAS_HUMANIZADOR, humanizar_texto

    numero = _numero_caminho_vida(req.data_nascimento)
    conhecimento = obter_conhecimento(req.signo, req.foco)
    signo_info = conhecimento["signo"]
    vault_texto = _ler_vault(req.foco)

    bloco_consulente = f"""
CONSULENTE:
- Nome: {req.nome}
- Data: {req.data_nascimento} | Hora: {req.hora_nascimento or "nao informada"} | Cidade: {req.cidade_nascimento or "nao informada"}
- Signo: {signo_info.get("nome", req.signo)} | Elemento: {signo_info.get("elemento","")} | Qualidade: {signo_info.get("qualidade","")}
- Caminho de Vida (numerologia): {numero}
- Foco da consulta: {req.foco}
"""

    mestres = [
        {"nome": "LIZ GREENE (Psicologia Junguiana)",
         "foco": "analise a psique, os arquetipos e o processo de individuacao do consulente. Veja o mapa como mapa da alma. Foque no porque psicologico e evolutivo, nos complexos inconscientes e nas tensoes que podem virar integracao do Self."},
        {"nome": "ROBERT HAND (Astrologia Tecnica)",
         "foco": "analise os transitos e progressoes atuais, os ciclos de planetas lentos (Jupiter, Saturno, Urano, Netuno, Plutao) e os periodos de oportunidade e desafio. Seja tecnico, pratico e claro, conectando o ceu ao cotidiano."},
        {"nome": "DANE RUDHYAR (Astrologia Humanista)",
         "foco": "analise o proposito existencial e a evolucao da consciencia. Reforce a responsabilidade individual e o livre-arbitrio. Veja as crises (Retorno de Saturno, Oposicao de Urano) como convites ao realinhamento com o proposito de vida. Aponte o potencial mais elevado."},
        {"nome": "HANS DECOZ (Numerologia Moderna)",
         "foco": "analise os numeros essenciais (Caminho de Vida, Expressao, Desejo da Alma, Personalidade), os ciclos pessoais e a compatibilidade numerica. De orientacao pratica e acionavel baseada nas vibracoes numericas do consulente."},
    ]

    from modules.groq_chat import groq_chat

    analises_mestres = []
    for m in mestres:
        prompt_mestre = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.


Voce e {m["nome"]}, membro do Conselho do Mestre Agnes.
{bloco_consulente}

SUA TAREFA ({m["foco"]}):
Apresente sua analise em ate 3 paragrafos, com profundidade e rigor, mas em linguagem humanizada. Aponte 2-3 pontos-chave e 1 recomendacao pratica da sua perspectiva.

CONHECIMENTO DO VAULT (use para enriquecer):
{vault_texto}

Assine ao final com: — {m["nome"]}
"""
        r = await groq_chat.chat(prompt_mestre, temperature=0.8, max_tokens=1200)
        analises_mestres.append("### " + m["nome"] + chr(10) + r.get("resposta", ""))

    prompt_opositor = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.


Voce e o OPOSITOR do Conselho do Mestre Agnes. Sua funcao e desafiar com respeito as analises dos mestres, apontando pontos cegos, riscos, exageros e o que pode ter sido deixado de lado.

CONSULENTE:
{bloco_consulente}

ANALISES DOS MESTRES:
{chr(10).join(analises_mestres)}

SUA TAREFA: aponte em ate 3 paragrafos o que os mestres podem ter deixado passar, os riscos de cada leitura e o que o consulente deve ponderar antes de agir. Seja honesto, mas construtivo.

Assine ao final com: — Opositor
"""
    r_op = await groq_chat.chat(prompt_opositor, temperature=0.7, max_tokens=1000)
    analise_opositor = r_op.get("resposta", "")

    prompt_final = f"""
IDENTIDADE OBRIGATORIA (NAO IGNORE):
- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.
- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.
- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.
- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'
- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.
- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.
- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').
- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.


Voce e o Mestre Agnes, a sintese viva dos maiores mestres. Sua missao e unificar as analises do conselho em uma resposta final coesa, acolhedora e transformadora.

CONSULENTE:
{bloco_consulente}

ANALISES DOS MESTRES:
{chr(10).join(analises_mestres)}

VISAO DO OPOSITOR:
{analise_opositor}

SUA TAREFA: escreva a resposta FINAL ao consulente, integrando o melhor de cada mestre e a prudencia do opositor, em um relatorio fluido e humanizado com:
1. Saudacao e sintonia
2. Mandala essencial (caminho de vida + sol/lua/ascendente)
3. A danca dos ciclos (ano pessoal + transitos)
4. O desafio e a dadiva (aspectos tensos + como superar)
5. Bencao final e dever de casa

Escreva de forma natural, empatica e com rigor tecnico. Assine no final com: — Mestre Agnes
"""
    r_final = await groq_chat.chat(prompt_final, temperature=0.8, max_tokens=3500)

    return {
        "analise_final": humanizar_texto(r_final.get("resposta", "")),
        "analises_mestres": analises_mestres,
        "analise_opositor": analise_opositor,
        "caminho_vida": numero,
        "provider": r_final.get("provider", "unknown"),
        "model": r_final.get("model", "unknown"),
    }

