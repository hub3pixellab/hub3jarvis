"""Upload Routes — Leitura de certidao de nascimento (PDF) e analise pela Agnes."""
import re
import os
from io import BytesIO
from fastapi import APIRouter, Header, HTTPException, UploadFile, File
import pdfplumber

router = APIRouter(prefix="/api/agnes", tags=["Agnes Upload"])
AGNES_KEY = os.getenv("AGNES_API_KEY", "agnes-dev-key")

MESES = {
    "janeiro": "01", "fevereiro": "02", "marco": "03", "março": "03",
    "abril": "04", "maio": "05", "junho": "06", "julho": "07",
    "agosto": "08", "setembro": "09", "outubro": "10", "novembro": "11",
    "dezembro": "12",
}

def _signo(dia: int, mes: int) -> str:
    if (mes == 3 and dia >= 21) or (mes == 4 and dia <= 19):
        return "Aries"
    if (mes == 4 and dia >= 20) or (mes == 5 and dia <= 20):
        return "Touro"
    if (mes == 5 and dia >= 21) or (mes == 6 and dia <= 20):
        return "Gemeos"
    if (mes == 6 and dia >= 21) or (mes == 7 and dia <= 22):
        return "Cancer"
    if (mes == 7 and dia >= 23) or (mes == 8 and dia <= 22):
        return "Leao"
    if (mes == 8 and dia >= 23) or (mes == 9 and dia <= 22):
        return "Virgem"
    if (mes == 9 and dia >= 23) or (mes == 10 and dia <= 22):
        return "Libra"
    if (mes == 10 and dia >= 23) or (mes == 11 and dia <= 21):
        return "Escorpiao"
    if (mes == 11 and dia >= 22) or (mes == 12 and dia <= 21):
        return "Sagitario"
    if (mes == 12 and dia >= 22) or (mes == 1 and dia <= 19):
        return "Capricornio"
    if (mes == 1 and dia >= 20) or (mes == 2 and dia <= 18):
        return "Aquario"
    return "Peixes"

def _extrair_dados(texto: str) -> dict:
    """Extrai nome e data de nascimento do texto do PDF."""
    dados = {"nome": "", "data_nascimento": "", "signo": ""}

    # --- Nome: maior sequencia em MAIUSCULAS com 2+ palavras, ignorando cabecalho ---
    ignorar = {"CERTIDAO", "NASCIMENTO", "REGISTRO", "CIVIL", "REPUBLICA",
               "FEDERATIVA", "BRASIL", "ESTADO", "CARTORIO", "LIVRO", "FOLHA",
               "TERMO", "MATRICULA", "OFICIO", "NOME", "DATA", "SEXO", "FILHO",
               "FILHA", "NASCIDO", "NASCIDA", "NATURAL", "MUNICIPIO", "UF"}
    melhor = ""
    for m in re.finditer(r"([A-ZÀ-ÚÇ][A-ZÀ-ÚÇ\s]{5,})", texto):
        palavras = [p for p in m.group(1).split() if p.upper() not in ignorar]
        if len(palavras) >= 2:
            nome = " ".join(palavras)
            if len(nome) > len(melhor):
                melhor = nome
    if melhor:
        dados["nome"] = melhor.title()

    # --- Data de nascimento ---
    m = re.search(r"(\d{1,2})[/](\d{1,2})[/](\d{4})", texto)
    if m:
        dados["data_nascimento"] = f"{int(m.group(1)):02d}/{int(m.group(2)):02d}/{m.group(3)}"
    else:
        m = re.search(r"(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})", texto, re.IGNORECASE)
        if m:
            mes = MESES.get(m.group(2).lower(), "01")
            dados["data_nascimento"] = f"{int(m.group(1)):02d}/{mes}/{m.group(3)}"

    if dados["data_nascimento"]:
        try:
            dia, mes, _ = map(int, dados["data_nascimento"].split("/"))
            dados["signo"] = _signo(dia, mes)
        except Exception:
            pass

    return dados

@router.post("/upload/certidao")
async def upload_certidao(
    arquivo: UploadFile = File(...),
    foco: str = "geral",
    x_api_key: str = Header(None),
):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    if not arquivo.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Envie um arquivo PDF")

    conteudo = await arquivo.read()
    if len(conteudo) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (max 10MB)")

    try:
        with pdfplumber.open(BytesIO(conteudo)) as pdf:
            texto = "\n".join((p.extract_text() or "") for p in pdf.pages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler PDF: {str(e)}")

    if not texto.strip():
        raise HTTPException(status_code=422, detail="Nao foi possivel extrair texto (certidao digitalizada exige OCR)")

    dados = _extrair_dados(texto)

    if not dados["nome"] or not dados["data_nascimento"]:
        raise HTTPException(
            status_code=422,
            detail="Nao identifiquei nome e data de nascimento. Certidoes muito antigas ou escaneadas podem exigir OCR.",
        )

    from routes.agnes_routes import gerar_relatorio, RequisicaoRelatorio
    resultado = await gerar_relatorio(
        RequisicaoRelatorio(
            nome=dados["nome"],
            data_nascimento=dados["data_nascimento"],
            signo=dados["signo"],
            foco=foco,
        ),
        x_api_key=x_api_key,
        x_forwarded_for="upload",
    )

    return {
        "dados_extraidos": dados,
        "relatorio": resultado.get("relatorio", ""),
        "numero_caminho_vida": resultado.get("numero_caminho_vida"),
    }
