// Família DADOS: gráficos animados no estilo do sistema: barras, linha, rosca, medidor, número que conta e pictograma.
// Cada gráfico vem num cartão creme com sombra dura (cartao:false tira o cartão). Origem = CENTRO. set(p, t): p = 0..1.
(() => {
  const { C, el, clamp, ease, back, SOMBRA, reg } = EL;
  const lim = (x) => clamp(x, 0, 1), lerp = (a, b, u) => a + (b - a) * u;
  const nova = (pai, x = 0, y = 0, s = 1, rot = 0) => { const g = el("g", {}, pai); g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`); return g; };
  const UI = 'font-family:Outfit,"Segoe UI",sans-serif;font-weight:700;text-transform:none';
  const DISP = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const txt = (pai, x, y, t, fs, fill, estilo = UI, anchor = "middle") => { const e = el("text", { x, y, "font-size": fs, fill, "text-anchor": anchor, style: estilo }, pai); e.textContent = t; return e; };
  const cartao = (g, w, h, on = true) => { if (!on) return; el("rect", { x: -w / 2 + 14, y: -h / 2 + 12, width: w, height: h, rx: 28, ...SOMBRA }, g); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 28, fill: C.creme }, g); };
  const BASE = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }, { nome: "cartao", padrao: true }];
  const ficha = (id, nome, serve, nao, caixa, params, descricao, usa_t = false, dur = 1.6) => reg({ id, nome, familia: "dados", tipo: "grafico", serve_para: serve, nao_usar_quando: nao, camada: "meio", caixa, parametros: [...BASE, ...params], movimento: { param: "p", duracao_s: dur, descricao, usa_t } });
  const COR5 = [C.cereja, C.laranja, C.amarelo, C.verde, C.roxo];

  // ---------- BARRAS
  const barras = (pai, { x, y, s, rot, cartao: ct = true, valores = [40, 70, 55, 92, 65], cores = COR5, rotulos = ["Seg", "Ter", "Qua", "Qui", "Sex"], max = 100 } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 480, h = 360; cartao(g, w, h, ct);
    const n = valores.length, bw = (w - 80) / n * .66, gap = (w - 80) / n, base = h / 2 - 56, alt = h - 150;
    el("line", { x1: -w / 2 + 28, x2: w / 2 - 28, y1: base, y2: base, stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round" }, g);
    const bs = valores.map((v, i) => { const cx = -w / 2 + 40 + gap * (i + .5), b = el("rect", { x: cx - bw / 2, width: bw, rx: 10, fill: cores[i % cores.length] }, g), t = txt(g, cx, 0, String(v), 26, C.tinta);
      txt(g, cx, base + 34, rotulos[i] || "", 22, C.tinta).setAttribute("fill-opacity", .7); return { b, t, cx, hh: alt * v / max }; });
    return { g, set(p) { bs.forEach((o, i) => { const u = ease(lim((p - i * .12) / .5)), hh = o.hh * u; o.b.setAttribute("y", base - hh); o.b.setAttribute("height", Math.max(hh, .1)); o.t.setAttribute("y", base - hh - 12); o.t.setAttribute("opacity", lim((u - .6) / .4)); }); } };
  };
  ficha("barras", "Gráfico de barras", "comparar valores entre categorias; as barras crescem uma após a outra", "são mais de 7 categorias", { w: 480, h: 360 },
    [{ nome: "valores", padrao: "lista de números" }, { nome: "rotulos", padrao: "lista de textos" }, { nome: "max", padrao: 100 }], "cada barra sobe com desaceleração e o número aparece no topo");

  // ---------- LINHA
  const linha = (pai, { x, y, s, rot, cartao: ct = true, pontos = [20, 38, 30, 62, 55, 90], cor = C.cereja } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 480, h = 340; cartao(g, w, h, ct);
    const n = pontos.length, px = (i) => -w / 2 + 50 + i * (w - 100) / (n - 1), py = (v) => h / 2 - 60 - (h - 130) * v / 100, d = pontos.map((v, i) => (i ? "L" : "M") + px(i) + " " + py(v)).join("");
    el("line", { x1: -w / 2 + 28, x2: w / 2 - 28, y1: h / 2 - 44, y2: h / 2 - 44, stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round" }, g);
    const area = el("path", { d: d + `L${px(n - 1)} ${h / 2 - 44}L${px(0)} ${h / 2 - 44}Z`, fill: cor, "fill-opacity": .18 }, g);
    const tr = el("path", { d, fill: "none", stroke: cor, "stroke-width": 14, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); const L = tr.getTotalLength ? tr.getTotalLength() : 600;
    tr.setAttribute("stroke-dasharray", L);
    const dots = pontos.map((v, i) => el("circle", { cx: px(i), cy: py(v), r: 12, fill: C.creme, stroke: cor, "stroke-width": 7 }, g));
    return { g, set(p) { const u = ease(lim(p)); tr.setAttribute("stroke-dashoffset", L * (1 - u)); area.setAttribute("opacity", lim((p - .5) / .5));
      dots.forEach((c, i) => { const q = lim((u * (n - 1) - (i - .15)) / .4); c.setAttribute("transform", `translate(${px(i)} ${py(pontos[i])}) scale(${back(q)}) translate(${-px(i)} ${-py(pontos[i])})`); c.setAttribute("opacity", q > 0 ? 1 : 0); }); } };
  };
  ficha("linha", "Gráfico de linha", "evolução no tempo, crescimento, tendência; a linha se desenha e os pontos pulam", "são menos de 3 pontos (use número)", { w: 480, h: 340 },
    [{ nome: "pontos", padrao: "lista de números 0-100" }, { nome: "cor", padrao: "cereja" }], "a linha se desenha da esquerda para a direita, a área aparece e cada ponto pula quando a linha passa");

  // ---------- ROSCA
  const rosca = (pai, { x, y, s, rot, cartao: ct = true, fatias = [[C.cereja, .38], [C.laranja, .24], [C.verde, .22], [C.roxo, .16]], centro = "100%" } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 400, h = 400, R = 112, cx = 0, cy = 0; cartao(g, w, h, ct);
    const arcos = fatias.map(([c]) => el("path", { fill: "none", stroke: c, "stroke-width": 62 }, g)); el("circle", { r: R + 31, fill: "none", stroke: C.tinta, "stroke-opacity": .1, "stroke-width": 3 }, g);
    const t = txt(g, 0, 20, centro, 64, C.tinta, DISP);
    return { g, set(p) { let a = -90; fatias.forEach(([c, v], i) => { const u = lim((p - i * .15) / .5), sw = v * 360 * ease(u), a2 = a + sw, P = (ang) => [cx + R * Math.cos(ang * Math.PI / 180), cy + R * Math.sin(ang * Math.PI / 180)];
      const [x1, y1] = P(a), [x2, y2] = P(a2 - (sw > 1 ? .01 : 0)); arcos[i].setAttribute("d", sw < .5 ? "" : `M${x1} ${y1}A${R} ${R} 0 ${sw > 180 ? 1 : 0} 1 ${x2} ${y2}`); a += v * 360; }); t.setAttribute("opacity", lim((p - .3) / .3)); } };
  };
  ficha("rosca", "Gráfico de rosca", "partes de um todo (porcentagens); as fatias se abrem em sequência", "são mais de 5 fatias", { w: 400, h: 400 },
    [{ nome: "fatias", padrao: "[[cor, fração], ...] somando 1" }, { nome: "centro", padrao: "100%" }], "cada fatia varre seu arco, em sequência, e o texto do centro aparece");

  // ---------- MEDIDOR
  const medidor = (pai, { x, y, s, rot, cartao: ct = true, valor = .72, rotulo = "Meta" } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 440, h = 320; cartao(g, w, h, ct); const R = 130, cy = 60;
    [[C.cereja, 180, 240], [C.amarelo, 240, 300], [C.verde, 300, 360]].forEach(([c, a0, a1]) => { const P = (a) => [R * Math.cos(a * Math.PI / 180), cy + R * Math.sin(a * Math.PI / 180)]; const [x1, y1] = P(a0), [x2, y2] = P(a1);
      el("path", { d: `M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}`, fill: "none", stroke: c, "stroke-width": 44 }, g); });
    const ag = el("g", {}, g); el("path", { d: `M-8 ${cy}L0 ${cy - 112}L8 ${cy}Z`, fill: C.tinta }, ag); el("circle", { cy, r: 18, fill: C.tinta }, ag); el("circle", { cy, r: 6, fill: C.creme }, g);
    txt(g, 0, cy + 76, rotulo, 34, C.tinta, DISP);
    return { g, set(p) { const e = back(lim(p / .8)); ag.setAttribute("transform", `rotate(${-90 + 180 * valor * Math.min(e, 1.08)} 0 ${cy})`); } };
  };
  ficha("medidor", "Medidor", "nível ou meta atingida; o ponteiro sobe até o valor com leve passada", "o valor não é uma proporção entre 0 e 1", { w: 440, h: 320 },
    [{ nome: "valor", padrao: 0.72 }, { nome: "rotulo", padrao: "Meta" }], "o ponteiro gira do início até o valor, passando um pouco e voltando");

  // ---------- NÚMERO QUE CONTA
  const numero = (pai, { x, y, s, rot, cartao: ct = false, valor = 87, sufixo = "%", cor = C.cereja, fs = 220, legenda = "" } = {}) => {
    const g = nova(pai, x, y, s, rot); if (ct) cartao(g, 460, 300, true);
    const t = txt(g, 0, 40, "0", fs, cor, DISP); const su = txt(g, 0, 40, sufixo, fs * .45, C.tinta, DISP, "start"); if (legenda) txt(g, 0, 100, legenda, 40, C.tinta, DISP).setAttribute("opacity", .85);
    return { g, set(p) { const v = Math.round(valor * ease(lim(p))), s_ = String(v); t.textContent = s_; const w = s_.length * fs * .44; t.setAttribute("x", -fs * .18); su.setAttribute("x", w * .5 - fs * .12); su.setAttribute("y", 40 - fs * .3); } };
  };
  ficha("numero", "Número que conta", "um dado em destaque (percentual, total, resultado); sobe de 0 até o valor", "o número tem mais de 5 dígitos", { w: 460, h: 300 },
    [{ nome: "valor", padrao: 87 }, { nome: "sufixo", padrao: "%" }, { nome: "cor", padrao: "cereja" }, { nome: "fs", padrao: 220 }, { nome: "legenda", padrao: "" }], "o número sobe de 0 até o valor com desaceleração");

  // ---------- PICTOGRAMA
  const pictograma = (pai, { x, y, s, rot, cartao: ct = true, total = 10, cheios = 7, cor = C.verde } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 520, h = 240; cartao(g, w, h, ct); const cols = Math.ceil(total / 2), ic = [];
    for (let i = 0; i < total; i++) { const c = i % cols, r = Math.floor(i / cols), px = -w / 2 + 70 + c * ((w - 100) / (cols - 1 || 1)), py = -34 + r * 84, o = el("g", {}, g);
      el("circle", { cx: px, cy: py, r: 32, fill: "#E3DAE9" }, o); const on = el("g", {}, o); el("circle", { cx: px, cy: py, r: 32, fill: i < cheios ? cor : "none" }, on);
      if (i < cheios) el("path", { d: `M${px - 14} ${py}L${px - 4} ${py + 11}L${px + 15} ${py - 11}`, fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, on); ic.push({ on, px, py, cheio: i < cheios, i }); }
    return { g, set(p) { ic.forEach((o) => { const u = o.cheio ? lim((p - o.i * .07) / .2) : 0; o.on.setAttribute("opacity", u); o.on.setAttribute("transform", `translate(${o.px} ${o.py}) scale(${.4 + .6 * back(u)}) translate(${-o.px} ${-o.py})`); }); } };
  };
  ficha("pictograma", "Pictograma", "'X de cada 10': círculos que se preenchem com check, um por vez", "o total é diferente de 10 ou 12", { w: 520, h: 240 },
    [{ nome: "total", padrao: 10 }, { nome: "cheios", padrao: 7 }, { nome: "cor", padrao: "verde" }], "os círculos marcados ganham um check, da esquerda para a direita");

  Object.assign(EL, { barras, linha, rosca, medidor, numero, pictograma });
})();
