"""Gera o manifesto.json de um sistema a partir do catálogo que as próprias peças registram.

Uso: .venv\\Scripts\\python.exe tools\\manifesto.py ..\\Design-System\\sistemas\\comida-viva [--versao 0.2.0]

O manifesto nunca é escrito à mão: ele é derivado das fichas (EL.catalogo) e por isso não envelhece.
A validação falha (e nada é escrito) se uma ficha estiver incompleta ou duplicada.
"""
import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("sistema")
ap.add_argument("--versao", default="0.2.0")
a = ap.parse_args()
pasta = Path(a.sistema).resolve()

CAMADAS = ["fundo", "meio", "frente"]
TIPOS = {"objeto", "acao", "texto", "grafico", "botao", "navegacao", "feedback", "transicao", "padrao", "layout"}
OBRIGATORIOS = ["id", "nome", "familia", "tipo", "serve_para", "nao_usar_quando", "camada", "caixa", "parametros"]

with sync_playwright() as pw:
    nav = pw.chromium.launch(channel="msedge")
    pg = nav.new_page()
    erros_pg = []
    pg.on("pageerror", lambda e: erros_pg.append(str(e)))
    pg.goto((pasta / "catalogo.html").as_uri())
    pg.wait_for_function("window._pronto === true", timeout=15000)
    pecas = json.loads(pg.evaluate("JSON.stringify(EL.catalogo)"))
    nav.close()
if erros_pg:
    sys.exit("erro ao carregar as peças:\n" + "\n".join(erros_pg))

problemas, vistos = [], set()
for p in pecas:
    pid = p.get("id", "?")
    for campo in OBRIGATORIOS:
        if p.get(campo) in (None, "", []):
            problemas.append(f"{pid}: falta o campo '{campo}'")
    if pid in vistos:
        problemas.append(f"{pid}: id duplicado")
    vistos.add(pid)
    if p.get("camada") not in CAMADAS:
        problemas.append(f"{pid}: camada inválida '{p.get('camada')}'")
    if p.get("tipo") not in TIPOS:
        problemas.append(f"{pid}: tipo inválido '{p.get('tipo')}'")
    if p.get("tipo") == "acao" and not p.get("movimento"):
        problemas.append(f"{pid}: ação sem 'movimento'")
    if p.get("movimento") and not p["movimento"].get("duracao_s") and p["movimento"].get("param") != "t":
        problemas.append(f"{pid}: movimento sem 'duracao_s'")
if problemas:
    sys.exit("manifesto NÃO gerado, fichas com problema:\n  - " + "\n  - ".join(problemas))

familias = {}
for p in pecas:
    familias.setdefault(p["familia"], []).append(p["id"])
manifesto = {
    "sistema": pasta.name,
    "versao": a.versao,
    "estado": "rascunho",
    "gerado_de": ["elementos.js", "cozinha.js", "layout.js", "computador.js", "dados.js"],
    "aviso": "GERADO pelas fichas das peças (tools/manifesto.py). Não edite à mão: mude a ficha na peça e gere de novo.",
    "camadas": CAMADAS,
    "tela": {"ig": [1080, 1920], "yt": [1920, 1080], "quadrado": [1080, 1080],
             "zona_segura": {"topo": None, "base": None, "lados": None, "nota": "a medir num celular"}},
    "tokens": {
        "cores": {"cereja": "#E50145", "rosa": "#FF87A0", "laranja": "#F15A22", "areia": "#F5D69E", "amarelo": "#EFD600", "creme": "#FFF9E9",
                  "verde": "#0C893E", "menta": "#63E578", "roxo": "#962E9D", "lilas": "#FAC7FF", "tinta": "#5C0A24"},
        "fontes": {"display": "Barlow Condensed (provisória; alvo: Amsi Pro Condensed)", "texto": "Outfit"},
    },
    "regras_de_cor": [
        "O cereja (#E50145) é a cor institucional e domina: cerca de metade dos fundos de cena e dos blocos grandes.",
        "Rosa e as claras (creme, lilás, areia, menta) preenchem painéis e fundos de respiro; nunca em rodízio de arco-íris.",
        "Amarelo, verde, roxo e laranja são acentos: objetos, chips e destaques. Não são fundo de cena em sequência.",
        "Texto sobre claro: cereja ou vinho (tinta). Texto sobre cor: creme. Preto puro nunca; a 'tinta' é um vinho da família do cereja.",
        "Duas cenas seguidas não repetem o mesmo fundo (a cortina de Forma precisa ter cor para varrer).",
    ],
    "regras": [
        "A peça é fixa: o modelo só escolhe qual, onde e quando; nunca redesenha.",
        "Sem contorno preto: formas chapadas, luz e sombra dura deslocada.",
        "Sem filter:blur em movimento.",
        "A cena é função do tempo: render(t).",
        "Cada peça vale pela sua ficha: use 'serve_para' e respeite 'nao_usar_quando'.",
    ],
    "familias": {k: len(v) for k, v in familias.items()},
    "pecas": pecas,
}
(pasta / "manifesto.json").write_text(json.dumps(manifesto, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"ok: {len(pecas)} peças em {len(familias)} famílias -> {pasta / 'manifesto.json'}")
for k, v in familias.items():
    print(f"  {k}: {len(v)}")
