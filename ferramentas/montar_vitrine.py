"""Monta design-system.html: a vitrine com TODAS as peças numa página só, num arquivo único (JS e manifesto embutidos).
Uso: python ferramentas/montar_vitrine.py sistemas/comida-viva
Lê catalogo.html (ordem dos scripts), manifesto.json e vitrine.src.html; escreve design-system.html ao lado."""
import json, re, sys
from pathlib import Path

pasta = Path(sys.argv[1] if len(sys.argv) > 1 else "sistemas/comida-viva")
cat = (pasta / "catalogo.html").read_text(encoding="utf-8")
scripts = re.findall(r'<script src="([^"]+\.js)"', cat)
js = "\n".join(f"// ===== {s} =====\n" + (pasta / s).read_text(encoding="utf-8") for s in scripts)
js = js.replace("</script>", r"<\/script>")
manifesto = "window.MANIFESTO = " + (pasta / "manifesto.json").read_text(encoding="utf-8") + ";"
html = (pasta / "vitrine.src.html").read_text(encoding="utf-8")
html = html.replace("/*@@MANIFESTO@@*/", manifesto).replace("/*@@JS@@*/", js)
saida = pasta / "design-system.html"
saida.write_text(html, encoding="utf-8")
print(f"ok: {saida} ({saida.stat().st_size/1024:.0f} KB, {len(scripts)} scripts)")

# versão para publicar como Artifact: sem doctype/html/body (o esqueleto do Artifact traz os dele)
art = html
for trecho in ("<!doctype html>", '<html lang="pt-BR" data-fundo="auto">', '<meta charset="utf-8">',
               '<meta name="viewport" content="width=device-width,initial-scale=1">', "<body>", "</body>", "</html>"):
    art = art.replace(trecho, "")
(pasta / "design-system.artifact.html").write_text(art.lstrip(), encoding="utf-8")
print("ok: design-system.artifact.html")
