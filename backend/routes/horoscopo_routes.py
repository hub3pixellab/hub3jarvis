# horoscopo_routes.py — Horoscopo simples do dia (gratuito, sem chamar modelo)
import datetime
import random
from fastapi import APIRouter, HTTPException
from conhecimento_agnes import SIGNOS

router = APIRouter(prefix="/api/agnes", tags=["Agnes Horoscopo"])

def _numero_do_dia():
    hoje = datetime.date.today()
    s = sum(int(c) for c in hoje.strftime("%Y%m%d"))
    while s > 9 and s not in (11, 22):
        s = sum(int(c) for c in str(s))
    return s

@router.get("/horoscopo")
async def horoscopo_diario(signo: str):
    chave = signo.lower().strip()
    if chave not in SIGNOS:
        raise HTTPException(status_code=400, detail="Signo invalido. Use: aries, touro, gemeos, cancer, leao, virgem, libra, escorpiao, sagitario, capricornio, aquario, peixes")
    info = SIGNOS[chave]
    hoje = datetime.date.today()
    semente = int(hoje.strftime("%Y%m%d")) + sum(ord(c) for c in chave)
    rng = random.Random(semente)
    positivos = [p.strip() for p in info["positivo"].split(",")][:8]
    alertas = [n.strip() for n in info["negativo"].split(",")][:4]
    escolhidos = rng.sample(positivos, k=min(3, len(positivos)))
    alerta = rng.choice(alertas)
    numero = _numero_do_dia()
    return {
        "data": hoje.strftime("%d/%m/%Y"),
        "signo": info["nome"],
        "numero_do_dia": numero,
        "cor_do_dia": info["cores"].split(",")[0].strip(),
        "mensagem": (
            f"Hoje a energia de {info['nome']} pede {', '.join(escolhidos).lower()}. "
            f"Numero do dia: {numero}. Cor que favorece: {info['cores'].split(',')[0].strip()}. "
            f"Atencao a tendencia de {alerta.lower()} — respire antes de agir. "
            f"Palavra-chave do seu signo: {info['palavra_chave']}"
        ),
        "aviso": "Horoscopo generico diario. Para analise completa do seu mapa, gere seu relatorio."
    }
