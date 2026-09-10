from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from .agnes_routes import gerar_relatorio, RequisicaoRelatorio, AGNES_KEY

router = APIRouter(prefix="/api/agnes", tags=["agnes"])

class RequisicaoApresentacao(BaseModel):
    nome: str
    data_nascimento: str
    signo: str = ""
    foco: str = "geral"

def _montar_slides(texto: str) -> list:
    """Divide o relatorio em slides por blocos de texto."""
    blocos = [b.strip() for b in texto.split("\n\n") if b.strip()]
    slides = []
    atual = []
    for b in blocos:
        if b.startswith("#"):
            if atual:
                slides.append("\n".join(atual))
                atual = []
            atual.append(b)
        else:
            atual.append(b)
    if atual:
        slides.append("\n".join(atual))
    return slides

def _slide_html(titulo: str, conteudo: str, idx: int, total: int) -> str:
    conteudo_limpo = conteudo
    conteudo_limpo = conteudo_limpo.replace("**", "").replace("##", "").replace("#", "")
    paragrafos = "".join(f"<p>{p.strip()}</p>" for p in conteudo_limpo.split("\n") if p.strip())
    return f"""
    <section class="slide">
      <div class="slide-inner">
        <div class="slide-tag">Mestre Agnes</div>
        <h2>{titulo}</h2>
        <div class="slide-body">{paragrafos}</div>
        <div class="slide-num">{idx} / {total}</div>
      </div>
    </section>"""

def _montar_apresentacao(nome: str, data_nascimento: str, texto: str, numero: str) -> str:
    slides = _montar_slides(texto)
    total = len(slides) + 2
    partes = []

    # Slide 1 - Capa
    partes.append(f"""
    <section class="slide capa">
      <div class="slide-inner">
        <div class="estrela">✦</div>
        <div class="slide-tag">Mestre Agnes · Astrologia &amp; Numerologia</div>
        <h1>Seu Mapa Astral</h1>
        <p class="subtitulo">{nome}</p>
        <p class="data">Nascimento: {data_nascimento}</p>
        <div class="roda">☾ ✦ ☉ ✦ ☽</div>
      </div>
    </section>""")

    # Slides de conteudo
    for i, s in enumerate(slides, start=2):
        titulo = s.split("\n")[0].replace("#", "").strip() or f"Revelação {i-1}"
        partes.append(_slide_html(titulo, s, i, total))

    # Slide final
    partes.append(f"""
    <section class="slide final">
      <div class="slide-inner">
        <div class="estrela">✦</div>
        <h2>Deixe as estrelas guiarem seu caminho</h2>
        <p class="subtitulo">— Mestre Agnes</p>
        <div class="roda">☾ ✦ ☉ ✦ ☽</div>
      </div>
    </section>""")

    slides_html = "\n".join(partes)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Seu Mapa Astral — {nome}</title>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    font-family: 'Georgia', 'Times New Roman', serif;
    background: radial-gradient(ellipse at center, #1A1A2E 0%, #0B1B3D 55%, #05060F 100%);
    color: #F5E9C8;
    overflow: hidden;
    height: 100vh;
  }}
  .deck {{ height:100vh; position:relative; }}
  .slide {{
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    opacity:0; pointer-events:none;
    transition: opacity .6s ease;
    padding: 8vh 10vw;
  }}
  .slide.ativa {{ opacity:1; pointer-events:auto; }}
  .slide-inner {{ max-width: 900px; text-align:center; }}
  .slide-tag {{
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: .8rem; letter-spacing: .35em; text-transform: uppercase;
    color: #D4AF37; margin-bottom: 2rem;
  }}
  h1 {{
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    font-weight: normal; color: #F5E9C8;
    margin-bottom: 1.5rem; line-height: 1.1;
  }}
  h2 {{
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: normal; color: #D4AF37;
    margin-bottom: 2rem; line-height: 1.2;
  }}
  .subtitulo {{ font-size: clamp(1.2rem, 3vw, 1.8rem); color: #F5E9C8; margin-bottom: 1rem; }}
  .data {{ font-size: 1rem; color: #B8A97A; letter-spacing: .1em; }}
  .slide-body {{ text-align: left; max-width: 720px; margin: 0 auto; }}
  .slide-body p {{
    font-size: clamp(1rem, 2.2vw, 1.25rem);
    line-height: 1.7; color: #E8DCC0;
    margin-bottom: 1.2rem;
  }}
  .slide-num {{
    position:absolute; bottom: 4vh; right: 5vw;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: .8rem; color: #6B5D3A; letter-spacing: .2em;
  }}
  .estrela {{ font-size: 3rem; color: #D4AF37; margin-bottom: 1.5rem; }}
  .roda {{ font-size: 1.6rem; color: #D4AF37; letter-spacing: 1.5rem; margin-top: 2.5rem; opacity:.8; }}
  .capa h1 {{ color: #D4AF37; }}
  .final h2 {{ color: #F5E9C8; }}
  .navegacao {{
    position:fixed; bottom: 4vh; left: 50%; transform: translateX(-50%);
    display:flex; gap:1rem; z-index:10;
  }}
  .navegacao button {{
    background: rgba(212,175,55,.15); border:1px solid rgba(212,175,55,.4);
    color:#D4AF37; font-size:1.2rem; width:44px; height:44px;
    border-radius:50%; cursor:pointer; font-family: Arial, sans-serif;
  }}
  .navegacao button:hover {{ background: rgba(212,175,55,.3); }}
  .progresso {{
    position:fixed; top:0; left:0; height:3px; background:#D4AF37;
    transition: width .4s ease; z-index:10;
  }}
</style>
</head>
<body>
<div class="progresso" id="progresso"></div>
<div class="deck" id="deck">
  {slides_html}
</div>
<div class="navegacao">
  <button onclick="anterior()">◀</button>
  <button onclick="proxima()">▶</button>
</div>
<script>
  const slides = document.querySelectorAll('.slide');
  let atual = 0;
  function mostrar(i) {{
    slides.forEach((s, k) => s.classList.toggle('ativa', k === i));
    document.getElementById('progresso').style.width = ((i+1)/slides.length*100) + '%';
  }}
  function proxima() {{ if (atual < slides.length-1) {{ atual++; mostrar(atual); }} }}
  function anterior() {{ if (atual > 0) {{ atual--; mostrar(atual); }} }}
  document.addEventListener('keydown', e => {{
    if (e.key === 'ArrowRight' || e.key === ' ') proxima();
    if (e.key === 'ArrowLeft') anterior();
  }});
  mostrar(0);
</script>
</body>
</html>"""

@router.post("/relatorio/apresentacao")
async def relatorio_apresentacao(req: RequisicaoApresentacao, x_api_key: str = Header(None), x_forwarded_for: str = Header(None)):
    if x_api_key != AGNES_KEY:
        raise HTTPException(status_code=401, detail="Chave de API invalida")
    resultado = await gerar_relatorio(
        RequisicaoRelatorio(nome=req.nome, data_nascimento=req.data_nascimento, signo=req.signo, foco=req.foco),
        x_api_key=x_api_key, x_forwarded_for=x_forwarded_for
    )
    texto = resultado.get("relatorio", "Erro ao gerar relatorio")
    numero = resultado.get("numero_caminho_vida", "")
    html = _montar_apresentacao(req.nome, req.data_nascimento, texto, numero)
    return HTMLResponse(content=html, media_type="text/html")
