"""Transcreve a fala de um take, com tempo por palavra.

Uso: .venv\\Scripts\\python.exe tools\\transcrever.py prova-01\\take-01.wav

Adaptado do tools/transcribe.py do projeto animacoes, sem roteiro: aqui a pessoa fala livre,
então não há dica de vocabulário. Saída ao lado do áudio: palavras.json e transcricao.md.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy
from faster_whisper import WhisperModel

wav = Path(sys.argv[1])
# glossário de correções conhecidas, "errado=certo,errado=certo": dica de vocabulário no Whisper corrige uma sigla e estraga o resto
glossario = dict(x.split("=") for x in sys.argv[2].split(",")) if len(sys.argv) > 2 else {}
modelo = WhisperModel("small", device="cpu", compute_type="int8")
# decodifica com o ffmpeg: o PyAV desta instalação é incompatível com o decode_audio do faster-whisper
pcm = subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
audio = numpy.frombuffer(pcm, dtype=numpy.float32)
# vad_filter e sem condicionar no trecho anterior: evita alucinação (lição do animacoes)
segmentos, _ = modelo.transcribe(audio, language="pt", word_timestamps=True,
                                 vad_filter=True, condition_on_previous_text=False)

palavras, linhas = [], []
for seg in segmentos:
    texto = seg.text.strip()
    for errado, certo in glossario.items():
        texto = texto.replace(errado, certo)
    linhas.append(f"[{seg.start:6.2f} – {seg.end:6.2f}] {texto}")
    palavras += [{"texto": glossario.get(w.word.strip().strip(".,"), w.word.strip().strip(".,")) + (w.word.strip()[-1] if w.word.strip()[-1] in ".,?!" else ""), "ini": round(w.start, 2), "fim": round(w.end, 2), "p": round(w.probability, 2)}
                 for w in seg.words]

(wav.parent / "palavras.json").write_text(json.dumps(palavras, ensure_ascii=False, indent=1), encoding="utf-8")
duvidosas = [f"- {w['ini']:.2f}s \"{w['texto']}\" (p={w['p']})" for w in palavras if w["p"] < 0.6]
(wav.parent / "transcricao.md").write_text(
    f"# Transcrição de {wav.name}\n\n" + "\n".join(linhas)
    + "\n\n## Palavras com baixa confiança (conferir no áudio)\n\n" + ("\n".join(duvidosas) or "nenhuma") + "\n",
    encoding="utf-8",
)
print(f"{len(palavras)} palavras, {len(duvidosas)} duvidosas, fim em {palavras[-1]['fim']}s")
