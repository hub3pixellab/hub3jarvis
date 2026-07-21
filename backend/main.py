from fastapi import FastAPI, Body, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import httpx
import os
import subprocess
import json

app = FastAPI(title="JARVIS Backend v4.2", version="4.2")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

VAULT_DIR = "/Volumes/JARVIS HUB3/hub3-jarvis/knowledge-vault"
REPOS_DIR = "/Volumes/JARVIS HUB3/hub3-jarvis/repos"
GITHUB_USER = "hub3pixellab"

SERVICES = {
    "ollama": "http://localhost:11434",
    "whisper": "http://localhost:9000",
    "n8n": "http://localhost:5678",
    "bitwarden": "http://localhost:8080"
}

class RequisicaoJarvis(BaseModel):
    mensagem: str

class RequisicaoConsensus(BaseModel):
    prompt: str
    model: str = "llama3.2:1b"

class RequisicaoIssue(BaseModel):
    repo: str
    titulo: str
    corpo: str = ""
    labels: str = ""

class RequisicaoWhisper(BaseModel):
    audio_path: str

@app.get("/")
async def root():
    return {
        "sistema": "JARVIS",
        "versao": "4.2",
        "status": "online",
        "modelos": ["llama3.2:1b", "tinyllama:latest"],
        "vault": VAULT_DIR,
        "github_user": GITHUB_USER,
        "repos": ["hub3jarvis", "Site"],
        "servicos": SERVICES
    }

@app.get("/services/status")
async def status_servicos():
    resultados = {}
    for nome, url in SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                resultados[nome] = {"status": "online", "code": resp.status_code}
        except:
            resultados[nome] = {"status": "offline"}
    return {"servicos": resultados}

@app.post("/api/jarvis/conversar")
async def conversar_com_jarvis(req: RequisicaoJarvis):
    url_ollama = "http://localhost:11434/api/generate"
    payload = {"model": "llama3.2:1b", "prompt": req.mensagem, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resposta = await client.post(url_ollama, json=payload)
            resposta.raise_for_status()
            return {"resposta_jarvis": resposta.json().get("response")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Ollama: {str(e)}")

@app.post("/consensus/ollama")
async def consensus_ollama(req: RequisicaoConsensus, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    url_ollama = "http://localhost:11434/api/generate"
    payload = {"model": req.model, "prompt": req.prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resposta = await client.post(url_ollama, json=payload)
            resposta.raise_for_status()
            data = resposta.json()
            return {
                "status": "consensus_reached",
                "model": req.model,
                "resposta": data.get("response"),
                "tokens_gerados": data.get("eval_count", 0),
                "tempo_ms": round(data.get("total_duration", 0) / 1_000_000, 1)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Consensus: {str(e)}")

@app.get("/ollama/models")
async def listar_modelos_ollama():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama inacessivel: {str(e)}")

@app.post("/whisper/transcribe")
async def whisper_transcribe(req: RequisicaoWhisper, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            with open(req.audio_path, "rb") as f:
                resp = await client.post(
                    f"{SERVICES['whisper']}/asr",
                    files={"audio_file": f}
                )
            resp.raise_for_status()
            return {"transcricao": resp.json().get("text", "")}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Arquivo de audio nao encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Whisper: {str(e)}")

@app.get("/github/repos")
async def listar_repos():
    try:
        result = subprocess.run(
            ["gh", "repo", "list", GITHUB_USER, "--json", "name,description,url,updatedAt,isPrivate"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro gh: {result.stderr}")
        repos = json.loads(result.stdout)
        return {"usuario": GITHUB_USER, "repositorios": repos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.get("/github/repos/{repo}/issues")
async def listar_issues(repo: str, estado: str = "all", limite: int = 20):
    try:
        result = subprocess.run(
            ["gh", "issue", "list", "--repo", f"{GITHUB_USER}/{repo}",
             "--state", estado, "--limit", str(limite),
             "--json", "number,title,state,labels,createdAt,assignees"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro gh: {result.stderr}")
        issues = json.loads(result.stdout)
        return {"repo": repo, "total": len(issues), "issues": issues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.post("/github/repos/{repo}/issues")
async def criar_issue(repo: str, req: RequisicaoIssue, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    try:
        cmd = ["gh", "issue", "create", "--repo", f"{GITHUB_USER}/{repo}",
               "--title", req.titulo, "--body", req.corpo]
        if req.labels:
            cmd.extend(["--label", req.labels])
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro gh: {result.stderr}")
        return {"status": "criada", "repo": repo, "url": result.stdout.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.get("/github/repos/{repo}/commits")
async def listar_commits(repo: str, limite: int = 10):
    try:
        result = subprocess.run(
            ["gh", "api", f"repos/{GITHUB_USER}/{repo}/commits",
             "--jq", f".[:{limite}] | map({{sha: .sha[0:7], msg: .commit.message, data: .commit.author.date, autor: .commit.author.name}})"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro gh: {result.stderr}")
        commits = json.loads(result.stdout) if result.stdout.strip() else []
        return {"repo": repo, "commits": commits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.get("/github/repos/{repo}/pr")
async def listar_prs(repo: str, estado: str = "all", limite: int = 10):
    try:
        result = subprocess.run(
            ["gh", "pr", "list", "--repo", f"{GITHUB_USER}/{repo}",
             "--state", estado, "--limit", str(limite),
             "--json", "number,title,state,author,createdAt,headRefName"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro gh: {result.stderr}")
        prs = json.loads(result.stdout)
        return {"repo": repo, "pull_requests": prs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@app.get("/vault/stats")
async def stats_vault(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    categorias = {}
    total_arquivos = 0
    tamanho_total = 0
    if os.path.exists(VAULT_DIR):
        for categoria in os.listdir(VAULT_DIR):
            cat_path = os.path.join(VAULT_DIR, categoria)
            if os.path.isdir(cat_path) and not categoria.startswith("."):
                arquivos = [f for f in os.listdir(cat_path) if not f.startswith(".")]
                count = len(arquivos)
                size = sum(
                    os.path.getsize(os.path.join(cat_path, f))
                    for f in arquivos
                    if os.path.isfile(os.path.join(cat_path, f))
                )
                categorias[categoria] = {"arquivos": count, "tamanho_mb": round(size / (1024*1024), 1)}
                total_arquivos += count
                tamanho_total += size
    return {
        "status": "online",
        "vault_dir": VAULT_DIR,
        "total_arquivos": total_arquivos,
        "tamanho_total_gb": round(tamanho_total / (1024*1024*1024), 2),
        "categorias": categorias
    }

@app.get("/repos/local")
async def listar_repos_local():
    repos = []
    if os.path.exists(REPOS_DIR):
        for repo in os.listdir(REPOS_DIR):
            repo_path = os.path.join(REPOS_DIR, repo)
            if os.path.isdir(repo_path) and not repo.startswith("."):
                git_path = os.path.join(repo_path, ".git")
                is_git = os.path.exists(git_path)
                file_count = sum(len(files) for _, _, files in os.walk(repo_path) if ".git" not in _)
                repos.append({
                    "nome": repo,
                    "caminho": repo_path,
                    "is_git": is_git,
                    "arquivos": file_count
                })
    return {"repos_dir": REPOS_DIR, "repositorios": repos}

@app.get("/repos/local/{repo}/analyze")
async def analisar_repo_local(repo: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    repo_path = os.path.join(REPOS_DIR, repo)
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repositorio nao encontrado")
    
    extensoes = {}
    linguagens = {
        ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
        ".html": "HTML", ".css": "CSS", ".json": "JSON",
        ".md": "Markdown", ".yml": "YAML", ".yaml": "YAML",
        ".sh": "Shell", ".sql": "SQL", ".java": "Java",
        ".c": "C", ".cpp": "C++", ".go": "Go", ".rs": "Rust"
    }
    
    total_arquivos = 0
    total_linhas = 0
    
    for raiz, dirs, files in os.walk(repo_path):
        if ".git" in raiz:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in linguagens:
                extensoes[ext] = extensoes.get(ext, 0) + 1
                total_arquivos += 1
                try:
                    with open(os.path.join(raiz, f), 'r', errors='ignore') as fh:
                        total_linhas += sum(1 for _ in fh)
                except:
                    pass
    
    return {
        "repo": repo,
        "caminho": repo_path,
        "total_arquivos_codigo": total_arquivos,
        "total_linhas": total_linhas,
        "linguagens": {linguagens.get(k, k): v for k, v in extensoes.items()}
    }

@app.get("/n8n/workflows")
async def listar_workflows_n8n(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{SERVICES['n8n']}/api/v1/workflows")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"n8n inacessivel: {str(e)}")

# ===== ROTAS DO AI STUDIO (Open Generative AI) =====

MUAPI_BASE = "https://api.muapi.ai/api/v1"

@app.post("/ai/generate")
async def ai_generate(data: dict = Body(...)):
    """Submete geracao de imagem ou video via Muapi.ai"""
    model_endpoint = data.get("model", "flux")
    prompt = data.get("prompt", "")
    api_key = data.get("api_key", "")
    aspect_ratio = data.get("aspect_ratio", "1:1")
    image_url = data.get("image_url", None)

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt obrigatorio")
    if not api_key:
        raise HTTPException(status_code=400, detail="API key da Muapi.ai obrigatoria")

    payload = {"prompt": prompt, "aspect_ratio": aspect_ratio}
    if image_url:
        payload["image_url"] = image_url

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{MUAPI_BASE}/{model_endpoint}",
                json=payload,
                headers={"x-api-key": api_key, "Content-Type": "application/json"}
            )
            result = resp.json()
            if resp.status_code != 200:
                return {"erro": result.get("detail", "Erro na API"), "status_code": resp.status_code}
            return {"request_id": result.get("id") or result.get("request_id"), "status": "pending", "raw": result}
    except Exception as e:
        return {"erro": str(e)}

@app.get("/ai/prediction/{request_id}")
async def ai_prediction(request_id: str, api_key: str = ""):
    """Consulta status de uma geracao"""
    if not api_key:
        raise HTTPException(status_code=400, detail="API key obrigatoria")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{MUAPI_BASE}/predictions/{request_id}/result",
                headers={"x-api-key": api_key}
            )
            result = resp.json()
            status = result.get("status", "unknown")
            output = result.get("output")
            if isinstance(output, list) and len(output) > 0:
                output = output[0]
            return {"status": status, "output": output, "raw": result}
    except Exception as e:
        return {"erro": str(e)}

@app.post("/ai/upload")
async def ai_upload(data: dict = Body(...)):
    """Upload de imagem de referencia"""
    api_key = data.get("api_key", "")
    file_path = data.get("file_path", "")
    if not api_key or not file_path:
        raise HTTPException(status_code=400, detail="api_key e file_path obrigatorios")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo nao encontrado")
    try:
        import aiofiles
    except ImportError:
        import subprocess
        subprocess.run(["pip", "install", "aiofiles"], capture_output=True)
        import aiofiles

    async with aiofiles.open(file_path, "rb") as f:
        file_data = await f.read()

    filename = os.path.basename(file_path)
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{MUAPI_BASE}/upload_file",
            files={"file": (filename, file_data)},
            headers={"x-api-key": api_key}
        )
        result = resp.json()
        return {"url": result.get("url") or result.get("file_url"), "raw": result}

AI_MODELS = {
    "image": [
        {"id": "flux", "nome": "Flux", "desc": "Texto para imagem - rapido e versatil"},
        {"id": "flux-realism", "nome": "Flux Realism", "desc": "Foto-realista de alta qualidade"},
        {"id": "flux-anime", "nome": "Flux Anime", "desc": "Estilo anime e manga"},
        {"id": "midjourney", "nome": "Midjourney", "desc": "Estilo artistico Midjourney"},
        {"id": "nano-banana-2", "nome": "Nano Banana 2", "desc": "Google Gemini 3.1 Flash - ate 4K"},
        {"id": "seedream-5", "nome": "Seedream 5.0", "desc": "ByteDance - alta qualidade ate 4K"},
        {"id": "minimax-image-01", "nome": "MiniMax Image 01", "desc": "MiniMax - ate 4 imagens por request"},
        {"id": "sdxl", "nome": "SDXL", "desc": "Stable Diffusion XL"},
        {"id": "playground-v2.5", "nome": "Playground v2.5", "desc": "Estilo artistico"},
        {"id": "ideogram-v2", "nome": "Ideogram v2", "desc": "Texto em imagens"},
    ],
    "video": [
        {"id": "kling-v2", "nome": "Kling v2", "desc": "Texto para video - ate 10s"},
        {"id": "sora", "nome": "Sora", "desc": "OpenAI Sora - cinematico"},
        {"id": "veo-2", "nome": "Veo 2", "desc": "Google Veo 2 - alta qualidade"},
        {"id": "seedance-2-i2v", "nome": "Seedance 2.0 I2V", "desc": "ByteDance - imagem para video"},
        {"id": "grok-imagine-t2v", "nome": "Grok Imagine T2V", "desc": "xAI - ate 15s"},
        {"id": "minimax-hailuo-02", "nome": "MiniMax Hailuo 02", "desc": "Full HD - multiplos aspect ratios"},
        {"id": "ltx-video", "nome": "LTX Video", "desc": "Rapido e leve"},
    ],
    "lipsync": [
        {"id": "infinitetalk-image-to-video", "nome": "Infinite Talk", "desc": "Retrato + audio -> video falando"},
        {"id": "wan2.2-speech-to-video", "nome": "Wan 2.2 Speech", "desc": "Speech to video - 480p/720p"},
        {"id": "ltx-2-19b-lipsync", "nome": "LTX 2 19B Lipsync", "desc": "Alta qualidade - ate 1080p"},
    ]
}

@app.get("/ai/models")
async def ai_models():
    """Lista modelos disponiveis"""
    return {"modelos": AI_MODELS}


app.mount("/frontend", StaticFiles(directory="/Volumes/JARVIS HUB3/hub3-jarvis/frontend"), name="frontend")
