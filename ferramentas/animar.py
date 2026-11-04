"""Renderiza uma cena HTML (window.render(t)) em MP4 sem áudio, ou só quadros parados.

Uso:
  .venv\\Scripts\\python.exe tools\\animar.py pagina.html saida.mp4 --dur 7.6 [--w 1080 --h 1920 --fps 30]
  .venv\\Scripts\\python.exe tools\\animar.py pagina.html pasta_saida --quadros 0.5,2,3.7 [--w 1080 --h 1920]

A cena precisa expor window.render(t) e marcar window._pronto = true quando as fontes carregarem.
"""
import argparse
import math
import shutil
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("pagina")
ap.add_argument("saida")
ap.add_argument("--dur", type=float, default=5)
ap.add_argument("--w", type=int, default=1080)
ap.add_argument("--h", type=int, default=1920)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--quadros", default="")
a = ap.parse_args()
ff = shutil.which("ffmpeg") or "ffmpeg"

with sync_playwright() as pw:
    nav = pw.chromium.launch(channel="msedge")
    pg = nav.new_page(viewport={"width": a.w, "height": a.h})
    pg.on("pageerror", lambda e: print("ERRO NA CENA:", e))
    pg.goto(Path(a.pagina).resolve().as_uri())
    pg.wait_for_function("window._pronto === true", timeout=30000)
    pg.wait_for_timeout(300)
    if a.quadros:
        pasta = Path(a.saida)
        pasta.mkdir(parents=True, exist_ok=True)
        for t in [float(x) for x in a.quadros.split(",")]:
            pg.evaluate("t => window.render(t)", t)
            pg.screenshot(path=str(pasta / f"q-{t:05.2f}.png"))
            print("quadro", t)
    else:
        n = math.ceil(a.dur * a.fps)
        enc = subprocess.Popen([ff, "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(a.fps), "-i", "-",
                                "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", str(a.saida)], stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate("t => window.render(t)", i / a.fps)
            enc.stdin.write(pg.screenshot(type="png"))
        enc.stdin.close()
        if enc.wait():
            raise SystemExit("ffmpeg falhou")
        print(f"ok: {a.saida} ({n} quadros)")
    nav.close()
