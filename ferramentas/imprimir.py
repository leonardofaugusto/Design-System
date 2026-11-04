"""Renderiza uma página HTML em PNG (página inteira), no Edge via Playwright.

Uso: .venv\\Scripts\\python.exe tools\\imprimir.py caminho\\pagina.html saida.png [largura=1800]
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

pagina, saida = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
largura = int(sys.argv[3]) if len(sys.argv) > 3 else 1800
with sync_playwright() as pw:
    nav = pw.chromium.launch(channel="msedge")
    pg = nav.new_page(viewport={"width": largura, "height": 1000})
    pg.on("pageerror", lambda e: print("ERRO NA PÁGINA:", e))
    pg.goto(pagina.as_uri())
    pg.wait_for_function("document.fonts.status === 'loaded'", timeout=30000)
    pg.wait_for_timeout(500)
    # o grão (camada SVG) cobre a página inteira: dimensiona depois do layout
    pg.screenshot(path=str(saida), full_page=True)
    print("ok:", saida, pg.evaluate("[document.body.scrollWidth, document.body.scrollHeight]"))
    nav.close()
