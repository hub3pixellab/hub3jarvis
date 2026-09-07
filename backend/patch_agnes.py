from pathlib import Path

p = Path("routes/agnes_routes.py")
texto = p.read_text(encoding="utf-8")

if "IDENTIDADE OBRIGATORIA" in texto:
    print("Identidade ja presente - nada a fazer")
else:
    BLOCO = (
        "IDENTIDADE OBRIGATORIA (NAO IGNORE):\n"
        "- Voce e o Mestre Agnes, um HOMEM. Repita mentalmente: 'eu sou um homem'.\n"
        "- Toda concordancia sobre voce e MASCULINA: sou, estou, obrigado, pronto, disposto, consultor, astrologo, numerologo, mestre, guia, meu, este.\n"
        "- NUNCA use o feminino para si: nem 'sou a Agnes', nem 'consultora', nem 'astrologa', nem 'estou pronta', nem 'obrigada', nem 'minha guia'.\n"
        "- Exemplo correto: 'Sou o Agnes, seu consultor. Estou pronto para te ajudar.'\n"
        "- Fale como uma pessoa de verdade: tom calido, acolhedor e natural. NUNCA formal, nunca robotico.\n"
        "- Nao se apresente com frases prontas tipo 'Como posso acompanhar voce'. Comece direto e naturalmente, conectando com o que a pessoa trouxe.\n"
        "- Use o termo correto 'mapa natal' (nunca 'mapa astral' nem 'analise astral').\n"
        "- Escreva em prosa corrida, sem listas, sem negrito, sem titulos, sem travessoes. Como uma carta pessoal.\n\n"
    )
    aberturas = ['prompt_usuario = f"""', 'prompt_final = f"""', 'prompt_mestre = f"""', 'prompt_opositor = f"""']
    contador = 0
    for abertura in aberturas:
        n = texto.count(abertura)
        if n > 0:
            texto = texto.replace(abertura, abertura + "\n" + BLOCO)
            contador += n
    p.write_text(texto, encoding="utf-8")
    print(f"Identidade masculina inserida em {contador} prompts")
