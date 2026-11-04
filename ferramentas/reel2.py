"""Compõe o reel em três camadas com o layout definido em layout.json: fundo (animação) + apresentador (o take) + frente (moldura e legenda).

Uso:
  .venv\\Scripts\\python.exe tools\\reel2.py quadros prova-02 5,12,30,45
  .venv\\Scripts\\python.exe tools\\reel2.py render prova-02 [--de 0 --ate 54]

A geometria da janela, o recorte do vídeo e a inclinação vêm de layout.json (uma fonte só). A cena (cena.html + cena.js)
lê a mesma geometria por dados.js, gerado aqui a cada execução. O vídeo da pessoa não passa pelo navegador: o ffmpeg
o recorta, inclina e empilha, o que garante sincronia exata com o áudio.
"""
import argparse
import json
import math
import shutil
import subprocess
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

W, H, FPS = 1080, 1920, 30
FF = shutil.which("ffmpeg") or "ffmpeg"

ap = argparse.ArgumentParser()
ap.add_argument("modo", choices=["quadros", "render"])
ap.add_argument("pasta")
ap.add_argument("tempos", nargs="?", default="")
ap.add_argument("--de", type=float, default=0)
ap.add_argument("--ate", type=float)
a = ap.parse_args()
pasta = Path(a.pasta).resolve()
lay = json.loads((pasta / "layout.json").read_text(encoding="utf-8"))
palavras = json.loads((pasta / "palavras.json").read_text(encoding="utf-8"))
duracao = json.loads((pasta / "cortes.json").read_text(encoding="utf-8"))["corte"]
corte = pasta / "corte.mp4"

J, R = lay["janela"], lay["crop"]
cx, cy = J["x"] + J["w"] / 2, J["y"] + J["h"] / 2
assert abs(cx - W / 2) < 1, "a janela precisa estar centrada na horizontal"
assert cy > H / 2, "o centro da janela precisa estar abaixo do meio da tela (a inclinação gira em torno dele)"
H2 = int(round(2 * cy))  # tela auxiliar simétrica em torno do centro da janela, para girar em torno dele
APRES = (f"crop={R['w']}:{R['h']}:{R['x']}:{R['y']},scale={J['w']}:{J['h']},format=rgba,pad={W}:{H2}:{J['x']}:{J['y']}:color=black@0,"
         f"rotate={lay['inclinacao']}*PI/180:c=black@0:ow=iw:oh=ih,crop={W}:{H}:0:0")
EMPILHAR = f"[2:v]{APRES}[v];[0:v][v]overlay=format=auto[b];[b][1:v]overlay=format=auto"

(pasta / "dados.js").write_text("window.LAYOUT = " + json.dumps(lay) + ";\nwindow.DADOS = " + json.dumps({"palavras": palavras, "duracao": duracao}, ensure_ascii=False) + ";\n", encoding="utf-8")


def abrir(pw):
    nav = pw.chromium.launch(channel="msedge")
    pg = nav.new_page(viewport={"width": W, "height": H})
    pg.on("pageerror", lambda e: print("ERRO NA CENA:", e))
    pg.goto((pasta / "cena.html").as_uri())
    pg.wait_for_function("window._pronto === true", timeout=30000)
    pg.wait_for_timeout(300)
    return nav, pg


def camada(pg, nome, t, **kw):
    pg.evaluate("([n, t]) => { document.body.className = n; window.render(t); }", [nome, t])
    return pg.screenshot(type="png", **kw)


if a.modo == "quadros":
    saida = pasta / "quadros"
    saida.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        nav, pg = abrir(pw)
        for t in [float(x) for x in a.tempos.split(",")]:
            (saida / "_fundo.png").write_bytes(camada(pg, "so-fundo", t))
            (saida / "_frente.png").write_bytes(camada(pg, "so-frente", t, omit_background=True))
            destino = saida / f"q-{t:06.2f}.png"
            subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(saida / "_fundo.png"), "-i", str(saida / "_frente.png"),
                            "-ss", str(t), "-i", str(corte), "-filter_complex", EMPILHAR, "-frames:v", "1", str(destino)], check=True)
            print("quadro", destino.name)
        nav.close()
    for f in ("_fundo.png", "_frente.png"):
        (saida / f).unlink()
    raise SystemExit

fim = a.ate if a.ate is not None else duracao
teste = a.ate is not None or a.de > 0
n = math.ceil((fim - a.de) * FPS)
fundo_mp4, frente_mov = pasta / "_fundo.mp4", pasta / "_frente.mov"
enc_fundo = subprocess.Popen([FF, "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", str(fundo_mp4)], stdin=subprocess.PIPE)
enc_frente = subprocess.Popen([FF, "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                               "-c:v", "png", "-pix_fmt", "rgba", str(frente_mov)], stdin=subprocess.PIPE)
inicio = time.time()
with sync_playwright() as pw:
    nav, pg = abrir(pw)
    for i in range(n):
        t = a.de + i / FPS
        enc_fundo.stdin.write(camada(pg, "so-fundo", t))
        enc_frente.stdin.write(camada(pg, "so-frente", t, omit_background=True))
        if i and i % (FPS * 5) == 0:
            resta = (time.time() - inicio) / i * (n - i)
            linha = f"{100 * i / n:5.1f}%  quadro {i}/{n}  termina em ~{resta / 60:.1f} min"
            (pasta / "progresso.txt").write_text(linha + "\n", encoding="utf-8")
            print(linha, flush=True)
    nav.close()
for e in (enc_fundo, enc_frente):
    e.stdin.close()
    if e.wait():
        raise SystemExit("ffmpeg falhou ao codificar uma camada")

mp4 = pasta / ("teste.mp4" if teste else "reel.mp4")
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(fundo_mp4), "-i", str(frente_mov),
                "-ss", str(a.de), "-t", str(fim - a.de), "-i", str(corte),
                "-filter_complex", EMPILHAR + ",format=yuv420p[o]", "-map", "[o]", "-map", "2:a",
                "-c:v", "libx264", "-crf", "17", "-c:a", "aac", "-b:a", "192k", "-shortest", str(mp4)], check=True)
for f in (fundo_mp4, frente_mov):
    f.unlink()
print(f"ok: {mp4} ({time.time() - inicio:.0f}s)")
