"""Corta os silêncios de um take e normaliza o volume.

Uso: .venv\\Scripts\\python.exe tools\\cortar.py prova-01\\take-01.mov [--piso -35] [--minimo 0.40] [--folga 0.10]

Silêncio de `minimo` segundos ou mais é encurtado, deixando `folga` segundos de cada lado (a respiração
natural), e as pontas do take são aparadas. Corte seco, como em qualquer reel. Saída: corte.mp4 ao lado do take
(vertical, áudio a -16 LUFS) e cortes.json com o mapa de tempo, para conferir o que saiu.
"""
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("take")
ap.add_argument("--piso", type=float, default=-35)
ap.add_argument("--minimo", type=float, default=0.40)
ap.add_argument("--folga", type=float, default=0.10)
a = ap.parse_args()

ff = shutil.which("ffmpeg") or "ffmpeg"
take = Path(a.take)
dur = float(subprocess.run([shutil.which("ffprobe") or "ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=nw=1:nk=1", str(take)], capture_output=True, text=True, check=True).stdout)

log = subprocess.run([ff, "-hide_banner", "-i", str(take), "-map", "0:a:0", "-af", f"silencedetect=n={a.piso}dB:d={a.minimo}",
                      "-f", "null", "-"], capture_output=True, text=True).stderr
inis = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
if len(fins) < len(inis):  # silêncio que vai até o fim do arquivo
    fins.append(dur)

# intervalos removidos: o miolo de cada silêncio, deixando a folga dos dois lados
remover = []
for s, e in zip(inis, fins):
    ini = s + a.folga if s > 0.01 else 0.0           # silêncio no começo: apara tudo menos a folga final
    fim = e - a.folga if e < dur - 0.01 else dur     # silêncio no fim: apara tudo menos a folga inicial
    if s <= 0.01:
        ini = 0.0
    if fim - ini > 0.05:
        remover.append((ini, fim))

manter, cursor = [], 0.0
for ini, fim in remover:
    if ini - cursor > 0.05:
        manter.append((cursor, ini))
    cursor = fim
if dur - cursor > 0.05:
    manter.append((cursor, dur))

partes = []
for i, (s, e) in enumerate(manter):
    partes.append(f"[0:v:0]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS[v{i}]")
    partes.append(f"[0:a:0]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS[a{i}]")
ligar = "".join(f"[v{i}][a{i}]" for i in range(len(manter)))
partes.append(f"{ligar}concat=n={len(manter)}:v=1:a=1[v][ac]")
partes.append("[ac]loudnorm=I=-16:TP=-1.5:LRA=11[a]")
saida = take.parent / "corte.mp4"
subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(take), "-filter_complex", ";".join(partes),
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-r", "30",
                "-c:a", "aac", "-b:a", "192k", str(saida)], check=True)

novo = float(subprocess.run([shutil.which("ffprobe") or "ffprobe", "-v", "error", "-show_entries", "format=duration",
                             "-of", "default=nw=1:nk=1", str(saida)], capture_output=True, text=True, check=True).stdout)
(take.parent / "cortes.json").write_text(json.dumps({"original": round(dur, 2), "corte": round(novo, 2),
    "mantido": [[round(s, 2), round(e, 2)] for s, e in manter], "removido": [[round(s, 2), round(e, 2)] for s, e in remover]},
    indent=1), encoding="utf-8")
print(f"{dur:.1f}s -> {novo:.1f}s, {len(remover)} cortes, {len(manter)} trechos mantidos")
