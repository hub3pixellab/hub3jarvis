# conhecimento_agnes.py
# Base de conhecimento da Mestre Agnes
# Fontes: Numerologia Cabalística (Bia Cortéz), Astrologia Clássica e Esotérica (Viviane M. E. Oliveira),
# Manual de Astrologia (Vera Luz), Astrologia Oculta (Luis A. W. Salvi), A Prática da Astrologia (Dane Rudhyar)

SIGNOS = {
    "aries": {
        "nome": "Áries", "elemento": "Fogo", "qualidade": "Cardinal", "palavra_chave": "Eu Sou!",
        "planeta": "Marte", "casa": "1ª Casa (Personalidade)",
        "positivo": "Corajoso, pioneiro, competitivo, rápido, impulsivo, animado, independente, dinâmico, ativo, energia, iniciativa, força guerreira",
        "negativo": "Dominador, violento, agressivo, intolerante, arrogante, egoísta (eu primeiro), teimoso, impaciente",
        "carreira": "Liderança, posições de comando, empreendedorismo, áreas que exigem iniciativa e coragem. É pioneiro e gosta de começar projetos. Evite rotinas repetitivas.",
        "amor": "Apaixonado e intenso, busca conquista e novidade. Precisa de espaço e de um parceiro que acompanhe seu ritmo. Ciumento e impulsivo.",
        "saude": "Energia vital forte, mas tende ao estresse e à impaciência. Cuidado com dores de cabeça, tensão e excessos. Precisa de atividade física para canalizar o fogo.",
        "cores": "Vermelho, laranja, tons quentes",
        "numerologia": "Número 1 (liderança, comando, criatividade, pioneirismo)",
        "numeros_harmonicos": "1, 5, 9"
    },
    "touro": {
        "nome": "Touro", "elemento": "Terra", "qualidade": "Fixo", "palavra_chave": "Eu Tenho!",
        "planeta": "Vênus", "casa": "2ª Casa (Finanças e valores)",
        "positivo": "Paciente, conservador, doméstico, sensual, escrupuloso, estável, artístico, prático, confiável, fiel, sólido, resistente, busca os prazeres do corpo",
        "negativo": "Teimoso, lento, propenso a discutir, possessivo, preso, inflexível, ganancioso, ciumento, avarento",
        "carreira": "Finanças, administração, áreas que exigem estabilidade e persistência. Ótimo em negócios e construção de patrimônio. Valoriza segurança material.",
        "amor": "Leal, fiel e sensual. Busca estabilidade e afeto duradouro. Pode ser possessivo e ciumento, precisa aprender a soltar.",
        "saude": "Tendência ao sedentarismo e à alimentação prazerosa. Cuidado com garganta, pescoço e excessos. Precisa de movimento regular.",
        "cores": "Verde, rosa, tons terrosos",
        "numerologia": "Número 2 (dualidade, cooperação, diplomacia)",
        "numeros_harmonicos": "2, 4, 6"
    },
    "gemeos": {
        "nome": "Gêmeos", "elemento": "Ar", "qualidade": "Mutável", "palavra_chave": "Eu Penso!",
        "planeta": "Mercúrio", "casa": "3ª Casa (Comunicação e aprendizado)",
        "positivo": "Intelectual, curioso, comunicativo, expressivo, versátil, adaptável, jovial, sociável, facilidade nos relacionamentos, interatividade",
        "negativo": "Inquieto, inconstante, variável, sem persistência, pouco fiel, dispersa-se, superficial, duplicidade",
        "carreira": "Comunicação, escrita, vendas, ensino, mídia, tecnologia. Mente ágil e versátil. Precisa de variedade e estímulo intelectual.",
        "amor": "Comunicativo e divertido, mas pode ser inconstante. Precisa de um parceiro que estimule sua mente. Medo de compromisso.",
        "saude": "Tendência ao nervosismo e à ansiedade. Cuidado com pulmões, mãos e sistema nervoso. Precisa de descanso mental.",
        "cores": "Amarelo, tons claros e vibrantes",
        "numerologia": "Número 3 (comunicação, expressão, criatividade)",
        "numeros_harmonicos": "3, 5, 7"
    },
    "cancer": {
        "nome": "Câncer", "elemento": "Água", "qualidade": "Cardinal", "palavra_chave": "Eu Sinto!",
        "planeta": "Lua", "casa": "4ª Casa (Lar, família, raízes)",
        "positivo": "Intuitivo, maternal, sensível, doméstico, tradicional, boa memória, devoto, ligado ao passado, dedicado, acolhedor, protetor, gentil",
        "negativo": "Melindroso, dependente, manipulável, preguiçoso, aprisionado ao passado, superprotetor, medos, chantagens emocionais",
        "carreira": "Cuidado com pessoas, hospitalidade, nutrição, imóveis, áreas que acolhem. Excelente em criar ambientes seguros. Valoriza o lar.",
        "amor": "Profundamente emocional e protetor. Busca segurança afetiva e família. Pode ser carente e melindroso, precisa de acolhimento.",
        "saude": "Tendência a guardar emoções e somatizar. Cuidado com estômago, digestão e seios. Precisa de segurança emocional.",
        "cores": "Prata, branco, tons de azul-claro",
        "numerologia": "Número 4 (ação, estabilidade, construção)",
        "numeros_harmonicos": "2, 4, 8"
    },
    "leao": {
        "nome": "Leão", "elemento": "Fogo", "qualidade": "Fixo", "palavra_chave": "Eu Sou! Eu Crio!",
        "planeta": "Sol", "casa": "5ª Casa (Criatividade e prazer)",
        "positivo": "Brilho, dramático, idealista, orgulhoso, ambicioso, criativo, majestoso, otimista, romântico, generoso, entusiasmado, nobreza de caráter",
        "negativo": "Vaidoso, arrogante, pretensioso, egocêntrico, autoritário, exibicionista, narcisista, orgulhoso",
        "carreira": "Liderança, artes, entretenimento, posições de destaque e comando. Brilha no centro das atenções. Precisa de reconhecimento.",
        "amor": "Romântico, apaixonado e generoso. Busca admiração e lealdade. Precisa ser o centro do coração do parceiro.",
        "saude": "Coração e coluna são os pontos sensíveis. Cuidado com estresse e excesso de vaidade. Precisa de sol e movimento.",
        "cores": "Dourado, laranja, tons solares",
        "numerologia": "Número 1 (liderança, comando, criatividade)",
        "numeros_harmonicos": "1, 3, 5"
    },
    "virgem": {
        "nome": "Virgem", "elemento": "Terra", "qualidade": "Mutável", "palavra_chave": "Eu Analiso!",
        "planeta": "Mercúrio", "casa": "6ª Casa (Trabalho e saúde)",
        "positivo": "Prático, analítico, perfeccionista, lógico, trabalhador, serviçal, metódico, exigente, conservador, asseado, humano, dedicado, detalhista, correto",
        "negativo": "Crítico, difícil de agradar, preso ao mental, complexado, cético, preocupação excessiva, hipocondríaco",
        "carreira": "Análise, saúde, serviços, organização, áreas técnicas. Excelente em detalhes e aprimoramento. Valoriza utilidade e perfeição.",
        "amor": "Leal e dedicado, mas crítico e exigente. Expressa amor através de atos de serviço. Precisa relaxar o perfeccionismo.",
        "saude": "Tendência à preocupação e ao estresse digestivo. Cuidado com intestino e sistema nervoso. Precisa de rotina saudável.",
        "cores": "Verde, tons pastéis, marrom",
        "numerologia": "Número 6 (harmonia, equilíbrio, amor)",
        "numeros_harmonicos": "2, 4, 6"
    },
    "libra": {
        "nome": "Libra", "elemento": "Ar", "qualidade": "Cardinal", "palavra_chave": "Eu Equilibro!",
        "planeta": "Vênus", "casa": "7ª Casa (Relacionamentos e parcerias)",
        "positivo": "Amistoso, amante da paz, refinado, artístico, diplomata, sociável, cooperativo, bonito, suave, justo, elegante, sentido estético",
        "negativo": "Indeciso, auto-desvaloriza-se, irritável, apático, preguiçoso, inconstante, dificuldade em dizer não, influenciável, vaidade",
        "carreira": "Parcerias, direito, arte, estética, negociação, diplomacia. Excelente em harmonizar e mediar. Valoriza justiça e equilíbrio.",
        "amor": "Romântico e encantador, busca parceria e harmonia. Precisa de equilíbrio no relacionamento. Evita conflitos.",
        "saude": "Tendência ao desequilíbrio e à indecisão. Cuidado com rins, coluna lombar e tensão. Precisa de harmonia no ambiente.",
        "cores": "Rosa, azul-claro, tons suaves",
        "numerologia": "Número 6 (harmonia, equilíbrio, amor)",
        "numeros_harmonicos": "2, 6, 9"
    },
    "escorpiao": {
        "nome": "Escorpião", "elemento": "Água", "qualidade": "Fixo", "palavra_chave": "Eu Transformo! Eu Desejo!",
        "planeta": "Marte (regente moderno: Plutão)", "casa": "8ª Casa (Transformação e desapego)",
        "positivo": "Penetrante, investigativo, curioso, explorador, discreto, realizador, passional, consciente, determinado, profundo, magnético, poder de transformação",
        "negativo": "Vingativo, ciumento, violento, irônico, desconfiado, sarcástico, intolerante, enigmático, manipulador, rancoroso",
        "carreira": "Pesquisa, investigação, finanças, transformação, áreas de poder e estratégia. Excelente em renascer e recomeçar. Valoriza profundidade.",
        "amor": "Intenso, passional e magnético. Busca conexão profunda e transformadora. Ciumento e possessivo, precisa de confiança.",
        "saude": "Tendência a guardar emoções intensas. Cuidado com órgãos reprodutivos e intestino. Precisa de descarga emocional.",
        "cores": "Vermelho-escuro, preto, bordô",
        "numerologia": "Número 8 (poder, transformação, renascimento)",
        "numeros_harmonicos": "4, 8, 9"
    },
    "sagitario": {
        "nome": "Sagitário", "elemento": "Fogo", "qualidade": "Mutável", "palavra_chave": "Eu Vejo! Eu Acredito!",
        "planeta": "Júpiter", "casa": "9ª Casa (Filosofia e expansão)",
        "positivo": "Honesto, amante da liberdade e do conhecimento, atlético, generoso, otimista, justo, estudioso, ingênuo, idealista, expansivo, mente aberta",
        "negativo": "Exagerado, tagarela, brusco, impaciente, jogador, irascível, inclinado a discussões, arrogante, extremista, fanático",
        "carreira": "Ensino, filosofia, viagens, direito, áreas de expansão e conhecimento. Excelente em inspirar e abrir horizontes. Valoriza liberdade.",
        "amor": "Aventureiro e otimista, busca liberdade e crescimento junto. Precisa de um parceiro que respeite sua independência.",
        "saude": "Tendência a excessos e impaciência. Cuidado com quadris, fígado e tendões. Precisa de movimento e ar livre.",
        "cores": "Roxo, azul, tons vibrantes",
        "numerologia": "Número 5 (movimento, liberdade, aventura)",
        "numeros_harmonicos": "3, 5, 9"
    },
    "capricornio": {
        "nome": "Capricórnio", "elemento": "Terra", "qualidade": "Cardinal", "palavra_chave": "Eu Realizo! Eu Utilizo!",
        "planeta": "Saturno", "casa": "10ª Casa (Carreira e realização)",
        "positivo": "Ambicioso, cauteloso, responsável, escrupuloso, convencional, profissional, tradicional, prático, trabalhador, econômico, resistente, persistente, maduro",
        "negativo": "Egoísta, dominador, pessimista, preocupado com status, racional, emocionalmente inibido, frio, avarento, rígido",
        "carreira": "Gestão, administração, finanças, áreas de responsabilidade e construção. Excelente em metas de longo prazo. Valoriza realização e status.",
        "amor": "Leal e sério, mas reservado e emocionalmente contido. Precisa aprender a expressar sentimentos. Busca parceiro estável.",
        "saude": "Tendência à rigidez e ao excesso de trabalho. Cuidado com ossos, joelhos e pele. Precisa de descanso e leveza.",
        "cores": "Marrom, cinza, tons escuros",
        "numerologia": "Número 8 (poder, realização, disciplina)",
        "numeros_harmonicos": "4, 6, 8"
    },
    "aquario": {
        "nome": "Aquário", "elemento": "Ar", "qualidade": "Fixo", "palavra_chave": "Eu Evoluo! Eu Sei!",
        "planeta": "Saturno (regente moderno: Urano)", "casa": "11ª Casa (Amizades e grupos)",
        "positivo": "Inovador, independente, inventivo, tolerante, individualista, progressista, artístico, científico, lógico, humano, intelectual, original, humanitário",
        "negativo": "Imprevisível, temperamental, frio, fixo, tímido, excêntrico, fanático, radical, rebelde, impessoal, autoritário",
        "carreira": "Tecnologia, inovação, ciência, causas sociais, áreas de futuro. Excelente em pensar diferente e revolucionar. Valoriza liberdade.",
        "amor": "Independente e amigo, mas pode ser frio e distante. Precisa de espaço e de um parceiro que valorize sua originalidade.",
        "saude": "Tendência ao nervosismo e à imprevisibilidade. Cuidado com circulação, tornozelos e sistema nervoso. Precisa de estabilidade.",
        "cores": "Azul-elétrico, prata, tons frios",
        "numerologia": "Número 11 (idealismo, intuição, clarividência)",
        "numeros_harmonicos": "2, 4, 8"
    },
    "peixes": {
        "nome": "Peixes", "elemento": "Água", "qualidade": "Mutável", "palavra_chave": "Eu Compreendo! Eu Creio!",
        "planeta": "Júpiter (regente moderno: Netuno)", "casa": "12ª Casa (Inconsciente e espiritualidade)",
        "positivo": "Servidor humanitário, memórias fortes, muita sensibilidade, espiritual, caridoso, intuitivo, emocional, sacrifica-se, introspectivo, artístico, musical, compassivo",
        "negativo": "Melancólico, influenciável, pessimista, pouco prático, sente-se incompreendido, inibido, confuso, indeciso, vítima, dependente",
        "carreira": "Artes, música, espiritualidade, cura, áreas de ajuda e compaixão. Excelente em intuição e criatividade. Valoriza propósito maior.",
        "amor": "Romântico, sensível e devotado. Busca conexão espiritual e emocional profunda. Precisa de limites e de não se sacrificar demais.",
        "saude": "Tendência a absorver energias e emoções dos outros. Cuidado com pés, sistema linfático e sono. Precisa de isolamento e cura.",
        "cores": "Lilás, verde-água, tons suaves",
        "numerologia": "Número 9 (compaixão, amor universal, realização)",
        "numeros_harmonicos": "3, 6, 9"
    }
}

NUMEROS = {
    "1": {"nome": "Um",
        "positivo": "Início, liderança, comando, força, energia, concentração, individualidade, independência, coragem, iniciativa, conquistador, forte poder mental, autodomínio, ativo, criativo, audacioso, ambicioso, pioneiro, positivo, persistente, autoconfiança",
        "negativo": "Egocentrismo, excesso de autoridade, arrogância, egoísmo, cinismo, repressão, tirania, solidão"},
    "2": {"nome": "Dois",
        "positivo": "Dualidade, associação, cooperação, concentração mental, intelecto, diplomacia, passividade, receptividade, flexibilidade, adaptabilidade, amabilidade, paciência, gentileza, bondade, colaboração, solidariedade, calma, idealismo, profundidade, sentimentalismo, organização, persuasão",
        "negativo": "Hesitação, apego ao passado, timidez, medo, inconstância, indecisão, submissão, dependência"},
    "3": {"nome": "Três",
        "positivo": "Comunicação, expressão, criatividade, talento artístico, sociabilidade, cordialidade, otimismo, bom gosto, extroversão, espirituosidade, inteligência, iniciativa, sabedoria, ternura, amor perfeito, força da alma, fertilidade",
        "negativo": "Exibicionismo, ostentação, superficialidade, futilidade, excesso de vaidade, tagarelice, fofoca"},
    "4": {"nome": "Quatro",
        "positivo": "Ação, realização, estabilidade, segurança, firmeza, justiça, honestidade, organização, realismo, conservadorismo, equilíbrio, meticulosidade, detalhismo, fidelidade, praticidade, disciplina, trabalho, cautela, construção, perseverança, sorte",
        "negativo": "Falta de versatilidade, visão limitada, medo do novo, conformismo, rigidez, avareza, sistematismo, apego ao passado, obsessão pelo trabalho"},
    "5": {"nome": "Cinco",
        "positivo": "Movimento, liberdade, aventura, evolução, curiosidade, inteligência, esperteza, brilho, ousadia, empreendedorismo, versatilidade, viagens, mudanças, novidades, entusiasmo, intelectualidade, sociabilidade, sensualidade",
        "negativo": "Impaciência, futilidade, infidelidade, instabilidade, impulsividade, ansiedade, irresponsabilidade, irritação, dificuldade em compromissos, desconfiança"},
    "6": {"nome": "Seis",
        "positivo": "Harmonia, conciliação, equilíbrio, verdade, justiça, emotividade, companheirismo, generosidade, preocupação com o lar, estabilidade, realismo, amizade, idealismo, serenidade, tranquilidade, calma, sinceridade, lealdade, afetividade, amor, união, virtude, beleza, criatividade",
        "negativo": "Ansiedade, apego excessivo, ciúme descontrolado, acomodação, instabilidade, falta de confiança, fazer-se de vítima, propensão a vícios, confusão, incerteza"},
    "7": {"nome": "Sete",
        "positivo": "Sabedoria, investigação, pesquisa, análise, lógica, reflexão, espiritualidade, inteligência, intelectualidade, meticulosidade, intuição, tranquilidade, introversão, perfeccionismo, discrição, religiosidade, prosperidade, triunfo, fama, honra, vitória, autodomínio",
        "negativo": "Dificuldade de expressão, desligamento, melancolia, crítica excessiva, exigência, autodestruição, falta de objetivos, conflito material/espiritual"},
    "8": {"nome": "Oito",
        "positivo": "Poder, reconhecimento, responsabilidade, riqueza material, eficiência, disciplina, perspicácia, compreensão, perseverança, prestígio, autoridade, ambição, administração, sucesso, riqueza, dom com dinheiro, diplomacia",
        "negativo": "Excesso de ambição e poder, intolerância, arrogância, desonestidade, autoritarismo, injustiça, teimosia, apego material, egocentrismo, separações, destruição"},
    "9": {"nome": "Nove",
        "positivo": "Compreensão, realização, amor universal, compaixão, generosidade, tolerância, paciência, atenção, agilidade, altruísmo, ajuda, fé, romantismo, idealismo, visão, disciplina, coragem, determinação, confiança, independência, sabedoria, mistério, virtude, humanitarismo, proteção",
        "negativo": "Excesso de altruísmo, sacrifício, solidão, fanatismo, possessividade, temperamento, autodestruição, vulnerabilidade, impaciência, decepções, dispersão"},
    "11": {"nome": "Onze (Número Mestre)",
        "positivo": "Idealismo, clarividência, perfeccionismo, intuição, colaboração, sensibilidade psíquica, imaginação, vibração, simpatia, humanitarismo, paciência, sabedoria, prestatividade, expansão, concentração, diplomacia, justiça, compreensão, inspiração, misticismo, poder, bravura, liberdade, energia, habilidade de cura",
        "negativo": "Nervosismo, impaciência, desonestidade, negligência, mesquinhez, desorientação, preguiça, dramatismo, fanatismo, falsa superioridade, cinismo, vícios, emotividade, egoísmo"},
    "22": {"nome": "Vinte e Dois (Número Mestre)",
        "positivo": "Espiritualidade, ligação com o mundo extra-físico, todas as boas qualidades dos números anteriores, praticidade, otimismo, habilidade, perspicácia, idealismo, empreendedorismo, cordialidade, trabalho, generosidade, inspiração, raciocínio lógico, genialidade, grande potencial de realização",
        "negativo": "Vaidade exagerada, complexo de inferioridade, pessimismo, autodestruição, cinismo, arrogância, ganância, falta de interesse em concluir projetos, propensão a traições"}
}

FOCOS = {
    "carreira": "Análise de vocação, talentos, aptidões profissionais e o caminho de realização no trabalho",
    "amor": "Análise de relacionamentos, afetividade, harmonia conjugal e a forma de amar e se relacionar",
    "saude": "Análise de vitalidade, pontos sensíveis do corpo, equilíbrio energético e bem-estar",
    "vida": "Análise geral do propósito de vida, missão e evolução pessoal"
}

def obter_conhecimento(signo, foco="vida"):
    """Retorna o conhecimento consolidado para o relatório."""
    signo_key = signo.lower().strip()
    signo_info = SIGNOS.get(signo_key, SIGNOS["aries"])
    foco_info = FOCOS.get(foco.lower().strip(), FOCOS["vida"])
    return {"signo": signo_info, "foco": foco_info}
