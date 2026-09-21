# modules/humanizador_multilingue.py
# Humanizer que funciona em varios idiomas (PT-BR, EN, ES, FR, IT).
# A remocao de markdown e universal; os padroes de IA sao por idioma.

import re

MARCAS_IA = {
    "pt": ["além disso", "crucial", "fundamental", "vale ressaltar", "é importante salientar",
           "no cenário atual", "nesse sentido", "em suma", "portanto", "no entanto",
           "vale destacar", "nesse contexto"],
    "en": ["moreover", "furthermore", "crucial", "essential", "it is important to note",
           "in today's world", "in this context", "additionally", "therefore", "however",
           "it is worth noting", "in conclusion"],
    "es": ["además", "crucial", "fundamental", "es importante señalar", "en el contexto actual",
           "en este sentido", "en resumen", "por lo tanto", "sin embargo", "vale la pena destacar"],
    "fr": ["de plus", "crucial", "essentiel", "il est important de noter", "dans le contexte actuel",
           "en ce sens", "en somme", "par conséquent", "cependant", "il convient de souligner"],
    "it": ["inoltre", "cruciale", "fondamentale", "è importante notare", "nel contesto attuale",
           "in questo senso", "in sintesi", "pertanto", "tuttavia", "vale la pena sottolineare"],
}

STOPWORDS = {
    "pt": {"o", "a", "os", "as", "de", "do", "da", "em", "para", "com", "que", "seu", "sua", "você", "voce"},
    "en": {"the", "and", "is", "are", "you", "your", "with", "for", "have", "not", "from", "this", "that"},
    "es": {"el", "la", "los", "las", "de", "del", "en", "para", "con", "que", "tu", "usted", "es", "son"},
    "fr": {"le", "la", "les", "de", "du", "des", "en", "pour", "avec", "que", "vous", "est", "sont"},
    "it": {"il", "lo", "la", "i", "gli", "di", "del", "in", "per", "con", "che", "tu", "lei", "è", "sono"},
}


def detectar_idioma(texto):
    palavras = re.findall(r"[a-zA-Zà-úÀ-ÚçÇñÑéèêëíìîïóòôöúùûü]+", texto.lower())
    if not palavras:
        return "pt"
    contagens = {}
    for idioma, sw in STOPWORDS.items():
        contagens[idioma] = sum(1 for p in palavras if p in sw)
    return max(contagens, key=contagens.get) if any(contagens.values()) else "pt"


def _limpar_linha_tabela(linha):
    celulas = [c.strip() for c in linha.strip().strip("|").split("|")]
    celulas = [c for c in celulas if c]
    if not celulas:
        return ""
    if len(celulas) == 1:
        return celulas[0]
    rotulo = celulas[0].rstrip(":")
    return f"{rotulo}: {' '.join(celulas[1:])}"


def humanizar_multilingue(texto, idioma_alvo="pt"):
    if not texto:
        return texto, "pt"
    t = texto

    # Remocao de markdown (universal)
    t = re.sub(r"^[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(\|[ \t]*:?-{2,}:?[ \t]*)*\|?[ \t]*$", "", t, flags=re.MULTILINE)
    linhas = []
    for linha in t.splitlines():
        if linha.strip().startswith("|") and linha.strip().endswith("|"):
            limpa = _limpar_linha_tabela(linha)
            if limpa:
                linhas.append(limpa)
        else:
            linhas.append(linha)
    t = "\n".join(linhas)
    t = re.sub(r"^[ \t]*#{1,6}[ \t]*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"__(.+?)__", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", t)
    t = re.sub(r"(?<!_)_([^_\n]+)_(?!_)", r"\1", t)
    t = re.sub(r"^[ \t]*[-*+][ \t]+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*\d+[.)][ \t]+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*>[ \t]*", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*[-_=*]{3,}[ \t]*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"\s*[—–]\s*", " ", t)
    t = t.replace("*", "").replace("|", "")
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"[ \t]+$", "", t, flags=re.MULTILINE)

    # Remocao de marcas de IA do idioma detectado
    idioma = detectar_idioma(t)
    for marca in MARCAS_IA.get(idioma, []):
        t = re.sub(re.escape(marca), "", t, flags=re.IGNORECASE)

    # Correcao de genero e terminologia (so para PT)
    if idioma_alvo == "pt":
        for a, b in [
            ("Sou a Agnes", "Sou o Agnes"), ("sou a Agnes", "sou o Agnes"),
            ("astróloga", "astrólogo"), ("astrologa", "astrologo"),
            ("consultora", "consultor"), ("mestra", "mestre"),
            ("estou pronta", "estou pronto"), ("obrigada", "obrigado"),
            ("minha guia", "meu guia"), ("sua guia", "seu guia"),
            ("mapa astral", "mapa natal"), ("astral", "natal"),
        ]:
            t = t.replace(a, b)

    return t.strip(), idioma
