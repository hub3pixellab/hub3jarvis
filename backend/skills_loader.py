"""Skills Loader — carrega as skills de agentes do ruflo (SKILL.md) para o Agnes usar no terminal.

Uso: o usuário digita @nome-da-skill na conversa (ex.: "@agent-coder revise este código")
e as instrucoes do SKILL.md correspondente sao injetadas no prompt do Agnes.
"""
from pathlib import Path
from typing import Dict, List, Optional
import re

def _localizar_pasta_skills() -> Path:
    """Localiza knowledge/ruflo-agents/skills subindo a partir de backend/."""
    alvo = Path(__file__).resolve().parent
    for _ in range(6):
        candidato = alvo / "knowledge" / "ruflo-agents" / "skills"
        if candidato.is_dir():
            return candidato
        alvo = alvo.parent
    return alvo / "knowledge" / "ruflo-agents" / "skills"

SKILLS_DIR = _localizar_pasta_skills()
MAX_SKILL_CHARS = 15000  # limite de seguranca para nao estourar o contexto do modelo

_cache: Dict[str, dict] = {}


def listar_skills(forcar_recarga: bool = False) -> List[dict]:
    """Indexa as skills disponiveis: [{nome, caminho, descricao, tamanho}]."""
    if _cache and not forcar_recarga:
        return list(_cache.values())
    _cache.clear()
    if not SKILLS_DIR.exists():
        print(f"[SkillsLoader] Pasta de skills nao encontrada: {SKILLS_DIR}")
        return []
    for pasta in sorted(SKILLS_DIR.iterdir()):
        skill_md = pasta / "SKILL.md"
        if pasta.is_dir() and skill_md.exists():
            texto = skill_md.read_text(encoding="utf-8", errors="ignore")
            descricao = ""
            for linha in texto.splitlines():
                if linha.strip().lower().startswith(("description:", "descricao:")):
                    descricao = linha.split(":", 1)[1].strip()
                    break
            _cache[pasta.name] = {
                "nome": pasta.name,
                "caminho": str(skill_md),
                "descricao": descricao,
                "tamanho": len(texto),
            }
    print(f"[SkillsLoader] {len(_cache)} skills carregadas de {SKILLS_DIR}")
    return list(_cache.values())


def carregar_skill(nome: str) -> Optional[str]:
    """Retorna o conteudo do SKILL.md (truncado) pelo nome, ou None se nao existir."""
    listar_skills()
    skill = _cache.get(nome)
    if not skill:
        return None
    with open(skill["caminho"], encoding="utf-8", errors="ignore") as f:
        texto = f.read()
    return texto[:MAX_SKILL_CHARS]


def detectar_skill(mensagem: str) -> Optional[str]:
    """Detecta o comando @nome-da-skill na mensagem e devolve o nome canonico da skill."""
    lista = listar_skills()
    if not lista:
        return None
    match = re.search(r"@([a-zA-Z0-9_-]+)", mensagem)
    if not match:
        return None
    nome = match.group(1)
    # correspondencia exata primeiro, depois por prefixo (ex.: @coder -> agent-coder)
    for s in lista:
        if s["nome"] == nome:
            return s["nome"]
    for s in lista:
        if s["nome"].startswith(nome):
            return s["nome"]
    return None
