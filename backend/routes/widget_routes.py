# widget_routes.py — Widget de horoscopo embutivel em outros sites (divulgacao)
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Agnes Widget"])
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

@router.get("/widget/horoscopo", response_class=HTMLResponse)
async def widget_horoscopo():
    arquivo = STATIC_DIR / "widget_horoscopo.html"
    if not arquivo.exists():
        return HTMLResponse("<h1>Widget nao encontrado</h1>", status_code=404)
    return HTMLResponse(arquivo.read_text(encoding="utf-8"))
