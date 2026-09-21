# modules/pipeline_backup.py
# Pipeline de QUALIDADE para respostas do Gemini (backup da LLM principal).
# Só libera a resposta se ela passar por: ortografia -> humanizer ->
# diagramacao/formatação -> tradução -> CONSENSO.

import re
from humanizador import humanizar_texto
from modules.humanizador_multilingue import humanizar_multilingue, detectar_idioma
from modules.polir_gemini import polir_com_gemini

MARCAS_IA = [
    "além disso", "crucial", "fundamental", "vale ressaltar",
    "é importante salientar", "no cenário atual", "nesse sentido",
    "em suma", "portanto", "no entanto", "vale destacar",
]

PALAVRAS_EN = [
    "the", "and", "is", "are", "you", "your", "will", "this", "that",
    "with", "for", "have", "not", "from", "they", "their", "about",
]


def _verificar_ortografia(texto):
    problemas = []
    lower = texto.lower()
    for m in MARCAS_IA:
        if m in lower:
            problemas.append(m)
    return problemas


def _verificar_formatacao(texto):
    problemas = []
    if re.search(r"^#{1,6}\s", texto, re.MULTILINE):
        problemas.append("cabeçalhos ##")
    if "|" in texto:
        problemas.append("tabelas/barras")
    if re.search(r"\*\*|__", texto):
        problemas.append("negrito")
    if re.search(r"^[-*+]\s", texto, re.MULTILINE):
        problemas.append("listas")
    if re.search(r"^---\s*$", texto, re.MULTILINE):
        problemas.append("linha separadora")
    return problemas


def _verificar_traducao(texto):
    tokens = set(re.findall(r"[a-zA-Zà-úÀ-Ú]+", texto.lower()))
    en_count = sum(1 for p in PALAVRAS_EN if p in tokens)
    return en_count >= 3


def processar_resposta_backup(texto):
    if not texto:
        return {"resposta": "", "consenso": False, "motivo": "resposta vazia", "idioma": "pt", "polido_gemini": False}

    problemas_ortografia = _verificar_ortografia(texto)

    # Humanizer multilingue
    texto, idioma = humanizar_multilingue(texto)

    # POLIMENTO FINAL COM GEMINI
    polido = polir_com_gemini(texto)
    texto = polido["resposta"]
    polido_ok = polido["polido"]

    problemas_formatacao = _verificar_formatacao(texto)
    texto = re.sub(r"\s*[—–]\s*", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto).strip()

    em_ingles = _verificar_traducao(texto)

    consenso = not problemas_formatacao and not em_ingles
    motivos = []
    if problemas_formatacao:
        motivos.append("formatação: " + ", ".join(problemas_formatacao))
    if em_ingles:
        motivos.append("texto em inglês (não traduzido)")
    if problemas_ortografia:
        motivos.append("marcas de IA: " + ", ".join(problemas_ortografia[:3]))

    return {
        "resposta": texto,
        "consenso": consenso,
        "motivo": "; ".join(motivos) if motivos else "ok",
        "idioma": idioma,
        "polido_gemini": polido_ok,
    }
