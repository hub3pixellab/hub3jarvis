# admin_upload_routes.py — Upload de arquivos para abastecer o conhecimento da Agnes
import os
import datetime
import io
from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from database import get_banco

router = APIRouter(prefix="/api/admin", tags=["Admin Upload"])
ADMIN_KEY = os.getenv("ADMIN_API_KEY", "agnes-admin-dev-key")

EXTENSOES = {".pdf", ".docx", ".xlsx", ".csv", ".txt", ".md", ".png", ".jpg", ".jpeg"}

def _checar_admin(x_admin_key):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Chave de admin invalida")

def _extrair_texto(nome: str, conteudo: bytes) -> str:
    """Extrai texto de acordo com a extensao do arquivo."""
    ext = os.path.splitext(nome)[1].lower()
    texto = ""

    if ext == ".pdf":
        import pdfplumber
        with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
            texto = "\n".join((p.extract_text() or "") for p in pdf.pages)

    elif ext == ".docx":
        import docx
        doc = docx.Document(io.BytesIO(conteudo))
        texto = "\n".join(p.text for p in doc.paragraphs)

    elif ext in (".xlsx", ".csv"):
        import pandas as pd
        if ext == ".xlsx":
            df = pd.read_excel(io.BytesIO(conteudo))
        else:
            df = pd.read_csv(io.BytesIO(conteudo))
        texto = df.to_string()

    elif ext in (".txt", ".md"):
        texto = conteudo.decode("utf-8", errors="ignore")

    elif ext in (".png", ".jpg", ".jpeg"):
        # OCR — exige tesseract instalado no servidor
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(conteudo))
            texto = pytesseract.image_to_string(img, lang="por")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR indisponivel: {str(e)}. Instale tesseract no servidor.")

    return texto.strip()

@router.post("/upload")
async def upload_conhecimento(
    arquivo: UploadFile = File(...),
    categoria: str = "livre",
    x_admin_key: str = Header(None),
):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")

    ext = os.path.splitext(arquivo.filename)[1].lower()
    if ext not in EXTENSOES:
        raise HTTPException(status_code=400, detail=f"Formato nao suportado: {ext}. Use: {', '.join(sorted(EXTENSOES))}")

    conteudo = await arquivo.read()
    if len(conteudo) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (max 20MB)")

    texto = _extrair_texto(arquivo.filename, conteudo)
    if not texto:
        raise HTTPException(status_code=422, detail="Nao foi possivel extrair texto do arquivo (pode ser imagem escaneada sem OCR)")

    doc = {
        "titulo": arquivo.filename,
        "categoria": categoria,
        "conteudo": texto[:50000],  # limita tamanho armazenado
        "ativo": True,
        "tipo": "arquivo",
        "criado_em": datetime.datetime.utcnow().isoformat(),
    }
    resultado = await banco["conhecimentos"].insert_one(doc)
    return {
        "id": str(resultado.inserted_id),
        "titulo": arquivo.filename,
        "caracteres": len(texto),
        "mensagem": "Conhecimento salvo com sucesso"
    }
PYEOFcd ~/projetos/hub3jarvis/backend
cat > routes/admin_upload_routes.py << 'PYEOF'
# admin_upload_routes.py — Upload de arquivos para abastecer o conhecimento da Agnes
import os
import datetime
import io
from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from database import get_banco

router = APIRouter(prefix="/api/admin", tags=["Admin Upload"])
ADMIN_KEY = os.getenv("ADMIN_API_KEY", "agnes-admin-dev-key")

EXTENSOES = {".pdf", ".docx", ".xlsx", ".csv", ".txt", ".md", ".png", ".jpg", ".jpeg"}

def _checar_admin(x_admin_key):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Chave de admin invalida")

def _extrair_texto(nome: str, conteudo: bytes) -> str:
    """Extrai texto de acordo com a extensao do arquivo."""
    ext = os.path.splitext(nome)[1].lower()
    texto = ""

    if ext == ".pdf":
        import pdfplumber
        with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
            texto = "\n".join((p.extract_text() or "") for p in pdf.pages)

    elif ext == ".docx":
        import docx
        doc = docx.Document(io.BytesIO(conteudo))
        texto = "\n".join(p.text for p in doc.paragraphs)

    elif ext in (".xlsx", ".csv"):
        import pandas as pd
        if ext == ".xlsx":
            df = pd.read_excel(io.BytesIO(conteudo))
        else:
            df = pd.read_csv(io.BytesIO(conteudo))
        texto = df.to_string()

    elif ext in (".txt", ".md"):
        texto = conteudo.decode("utf-8", errors="ignore")

    elif ext in (".png", ".jpg", ".jpeg"):
        # OCR — exige tesseract instalado no servidor
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(conteudo))
            texto = pytesseract.image_to_string(img, lang="por")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR indisponivel: {str(e)}. Instale tesseract no servidor.")

    return texto.strip()

@router.post("/upload")
async def upload_conhecimento(
    arquivo: UploadFile = File(...),
    categoria: str = "livre",
    x_admin_key: str = Header(None),
):
    _checar_admin(x_admin_key)
    banco = get_banco()
    if banco is None:
        raise HTTPException(status_code=500, detail="MongoDB nao configurado (MONGO_URI)")

    ext = os.path.splitext(arquivo.filename)[1].lower()
    if ext not in EXTENSOES:
        raise HTTPException(status_code=400, detail=f"Formato nao suportado: {ext}. Use: {', '.join(sorted(EXTENSOES))}")

    conteudo = await arquivo.read()
    if len(conteudo) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (max 20MB)")

    texto = _extrair_texto(arquivo.filename, conteudo)
    if not texto:
        raise HTTPException(status_code=422, detail="Nao foi possivel extrair texto do arquivo (pode ser imagem escaneada sem OCR)")

    doc = {
        "titulo": arquivo.filename,
        "categoria": categoria,
        "conteudo": texto[:50000],  # limita tamanho armazenado
        "ativo": True,
        "tipo": "arquivo",
        "criado_em": datetime.datetime.utcnow().isoformat(),
    }
    resultado = await banco["conhecimentos"].insert_one(doc)
    return {
        "id": str(resultado.inserted_id),
        "titulo": arquivo.filename,
        "caracteres": len(texto),
        "mensagem": "Conhecimento salvo com sucesso"
    }
