# humanizador.py
# Regras do repositório blader/humanizer (35 padrões de escrita de IA)
# Fonte: https://github.com/blader/humanizer | Wikipedia: Signs of AI writing

REGRAS_HUMANIZADOR = """
Escreva como um ser humano, nao como um chatbot. Mantenha TODOS os fatos, nomes, numeros e datas do conhecimento fornecido (nunca invente nada), mas elimine os padroes de escrita de IA abaixo:

1. EXAGEROS DE IMPORTANCIA: evite "momento crucial/pivotal", "marco historico", "deixa um legado", "divisor de aguas". Fale de forma simples e direta.
2. LINGUAGEM DE VENDAS: evite "vibrante", "profundo", "deslumbrante", "imperdivel", "no coracao de", "compromisso com", "reconhecido por". Soa como anuncio.
3. FRASES COM -ING VAZIAS: evite "destacando", "enfatizando", "refletindo", "simbolizando", "fomentando", "garantindo", "contribuindo para", "mostrando". Use verbos simples.
4. PALAVRAS GASTAS DE IA: evite "showcase", "tapecaria", "testemunho", "valioso", "vibrante", "subjacente".
5. NAO EVITE "E" E "TEM": escreva "e ..." e "tem ..." em vez de "serve como", "representa um", "caracteriza-se por", "oferece um", "destaca-se como".
6. "NAO SO X, MAS TAMBEM Y": evite essa construcao. Escreva a frase direta.
7. GRUPOS FORCADOS DE TRES: nao force 3 itens para parecer completo. Use a quantidade natural.
8. REPETICAO DE ABERTURA DE FRASES: nao comece varias frases com o mesmo sujeito. Varie ou una as frases.
9. VOZ PASSIVA: prefira voz ativa sempre que o agente da acao ficar claro.
10. TRAVESSOES (—) E MEIOS-TRAVESSOES (–): remova quase todos. Use virgulas ou pontos.
11. NEGRITO EXCESSIVO: nao coloque palavras em negrito sem motivo dentro dos paragrafos. Mantenha apenas os titulos de secao.
12. TITULOS EM CAIXA ALTA: titulos e subtitulos com letras normais, nao "Cada Palavra Em Maiuscula".
13. EMOJIS: nao use emojis em titulos, listas ou paragrafos.
14. ASPAS CURVAS: use aspas retas.
15. QUALIFICADORES EMPILHADOS: elimine "potencialmente", "possivelmente", "provavelmente" repetidos.
16. FILLER: "a fim de" -> "para", "devido ao fato de" -> "porque", "neste momento" -> "agora", "e importante notar que" -> remova.
17. FINAIS GENERICOS: nao termine com otimismo vago ("em ultima analise", "o futuro parece brilhante"). Termine com o ultimo fato util.
18. "A VERDADEIRA QUESTAO E", "NO FUNDO", "O QUE REALMENTE IMPORTA": evite fingir revelar uma verdade oculta.
19. FRASES DE EFEITO EM SEQUENCIA: nao transforme cada frase em um final dramatico. Ritmo natural.
20. DITADOS FORMULAICOS: evite "X e o Y de Z", "X nao e uma ferramenta, e um espelho", "a linguagem de", "a moeda de". Diga o fato especifico.
21. RESPONDER OBJECOES QUE NINGUEM FEZ: nao defenda algo que ninguem questionou.
22. REJEITAR ALTERNATIVAS FALSAS: nao introduza "uma tentacao seria...", "alguem poderia pensar..." para descartar e nunca mais voltar.

PROCESSO OBRIGATORIO:
1. Escreva o relatorio de forma natural, como uma pessoa especialista conversando com o cliente.
2. Leia em voz alta (mentalmente) e verifique ritmo, verbos simples e naturalidade.
3. Pergunte-se: "O que ainda soa como IA?" e "Adicionei ou removi algum fato?".
4. Corrija e entregue a versao final. Nunca invente nome, numero, data ou detalhe que nao esteja no conhecimento fornecido.
"""




# === FIX FINAL AGNES ===
import re

import re

def humanizar_texto(texto):
    if not texto:
        return texto
    t = texto
    # Cabecalhos: "## Titulo" -> "Titulo"
    t = re.sub(r"^[ \t]*#{1,6}[ \t]*", "", t, flags=re.MULTILINE)
    # Negrito/itálico: mantem o texto, remove so os marcadores
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"__(.+?)__", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", t)
    t = re.sub(r"(?<!_)_([^_\n]+)_(?!_)", r"\1", t)
    # Linha separadora de tabela: |---|---|
    t = re.sub(r"^[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(\|[ \t]*:?-{2,}:?[ \t]*)*\|?[ \t]*$", "", t, flags=re.MULTILINE)
    # Linhas de tabela: "| a | b |" -> "a — b" (prosa corrida)
    def _tabela(m):
        celulas = [c.strip() for c in m.group(0).strip().strip("|").split("|")]
        celulas = [c for c in celulas if c]
        return " — ".join(celulas)
    t = re.sub(r"^[ \t]*\|.*\|[ \t]*$", _tabela, t, flags=re.MULTILINE)
    # Listas: "- item", "* item", "1. item" -> "item"
    t = re.sub(r"^[ \t]*[-*+][ \t]+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*\d+[.)][ \t]+", "", t, flags=re.MULTILINE)
    # Blockquote: "> texto" -> "texto"
    t = re.sub(r"^[ \t]*>[ \t]*", "", t, flags=re.MULTILINE)
    # Linhas separadoras: ---, ===, ***
    t = re.sub(r"^[ \t]*[-_=*]{3,}[ \t]*$", "", t, flags=re.MULTILINE)
    # Links: [texto](url) -> texto
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    # Codigo inline: `texto` -> texto
    t = re.sub(r"`([^`]*)`", r"\1", t)
    # Espacos multiplos
    t = re.sub(r"[ \t]{2,}", " ", t)
    # Linhas em branco em excesso
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"[ \t]+$", "", t, flags=re.MULTILINE)
    # Terminologia e genero (mantem as regras existentes)
    t = t.replace("mapa astral", "mapa natal")
    t = t.replace("astral", "natal")
    for a, b in [
        ("Sou a Agnes", "Sou o Agnes"), ("sou a Agnes", "sou o Agnes"),
        ("astróloga", "astrólogo"), ("astrologa", "astrologo"),
        ("numeróloga", "numerólogo"), ("numerologa", "numerologo"),
        ("consultora", "consultor"), ("mestra", "mestre"),
        ("estou pronta", "estou pronto"), ("obrigada", "obrigado"),
        ("minha guia", "meu guia"), ("sua guia", "seu guia"),
    ]:
        t = t.replace(a, b)
    return t.strip()
