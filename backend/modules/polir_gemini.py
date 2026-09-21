# modules/polir_gemini.py
# Passo final de qualidade: o Gemini revisa a resposta, remove todo markdown
# (##, |, **, -, ---) e entrega em prosa profissional, com disposicao e elegancia.

import re

PROMPT_POLIMENTO = """Voce e um editor de textos de luxo. Receba o texto abaixo e reescreva-o seguindo estas regras OBRIGATORIAS:

1. REMOVA TODA a formatacao markdown: cabecalhos (##, ###), tabelas (|), negrito (**), italico (*), listas (-, *, 1.), linhas separadoras (---), blocos de citacao (>), codigo (`).
2. Transforme tudo em PROSA CORRIDA, elegante e profissional, como uma carta pessoal de um mestre.
3. Mantenha TODOS os fatos, nomes, numeros, datas e dados do texto original. NUNCA invente nem remova informacao.
4. Use paragrafos bem distribuidos, com respiro entre as ideias. Nada de listas nem marcadores.
5. Tom caloroso, acolhedor e sofisticado. Nada de linguagem robotica ou de chatbot.
6. Nao use asteriscos, barras verticais, travessoes longos nem qualquer simbolo de marcacao.
7. Se o texto estiver em ingles, espanhol, frances ou italiano, mantenha o idioma original e aplique as mesmas regras.
8. Assine no final com o nome do oraculo: Agnes (masculino: "Agnes, seu guia").

TEXTO PARA REVISAR:
{texto}

REESCRITA (somente o texto final, sem comentarios):"""


def polir_com_gemini(texto: str) -> dict:
    if not texto or not texto.strip():
        return {"resposta": "", "polido": False, "motivo": "texto vazio"}

    try:
        from modules.gemini_chat import chat as gemini
        prompt = PROMPT_POLIMENTO.format(texto=texto)
        r = gemini(prompt, temperature=0.6, max_tokens=4000)

        if isinstance(r, dict):
            polido = r.get("resposta", "") or r.get("texto", "") or ""
        else:
            polido = str(r)

        if not polido.strip():
            return {"resposta": texto, "polido": False, "motivo": "gemini retornou vazio"}

        polido = _limpeza_final(polido)
        return {"resposta": polido, "polido": True, "motivo": "ok"}
    except Exception as e:
        return {"resposta": texto, "polido": False, "motivo": f"gemini indisponivel: {e}"}


def _limpeza_final(texto: str) -> str:
    t = texto
    t = re.sub(r"^[ \t]*#{1,6}[ \t]*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"__(.+?)__", r"\1", t, flags=re.DOTALL)
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", t)
    t = re.sub(r"^[ \t]*[-*+][ \t]+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*\d+[.)][ \t]+", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*\|.*\|[ \t]*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*>[ \t]*", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[ \t]*[-_=*]{3,}[ \t]*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"\s*[—–]\s*", " ", t)
    t = t.replace("*", "").replace("|", "")
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()
