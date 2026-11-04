// Família GRÁFICOS: gráficos e tabelas com personalidade, cada um com 3 ESTILOS (parâmetro `estilo`) sobre o MESMO contrato de dados.
// O modelo escolhe a peça e o estilo e preenche os números; o desenho é sempre o mesmo. Dados de exemplo são inventados (nada real).
//   progresso      → estilo "pote" | "bag" | "marmita"       dados: valor 0..1
//   barras_comida  → estilo "frutas" | "marmitas" | "reguas"  dados: [{rotulo, valor}], max
//   tabela_viva    → estilo "deslizar" | "cartoes" | "celula" dados: colunas, linhas, col (coluna numérica)
// Regras de honestidade: a escala começa no zero e o número SEMPRE aparece em texto. Origem = CENTRO. set(p, t): p = 0..1, t em segundos.
(() => {
  const { C, el, clamp, ease, back, SOMBRA, reg } = EL;
  const lim = (x) => clamp(x, 0, 1), lerp = (a, b, u) => a + (b - a) * u;
  const nova = (pai, x = 0, y = 0, s = 1, rot = 0) => { const g = el("g", {}, pai); g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`); return g; };
  const UI = 'font-family:Outfit,"Segoe UI",sans-serif;font-weight:700;text-transform:none';
  const DISP = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const txt = (pai, x, y, t, fs, fill, estilo = UI, anchor = "middle") => { const e = el("text", { x, y, "font-size": fs, fill, "text-anchor": anchor, style: estilo }, pai); e.textContent = t; return e; };
  const cartao = (g, w, h, on = true) => { if (!on) return; el("rect", { x: -w / 2 + 14, y: -h / 2 + 12, width: w, height: h, rx: 28, ...SOMBRA }, g); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 28, fill: C.creme }, g); };
  const sombra = (pai, x, y, w, h, rx) => el("rect", { x: x + 14, y: y + 12, width: w, height: h, rx, ...SOMBRA }, pai);
  const COR5 = [C.cereja, C.laranja, C.amarelo, C.verde, C.roxo];
  let nid = 0;
  const clip = (g, attrs, tipo = "rect") => { const id = "gc" + (nid++); el("clipPath", { id }, el("defs", {}, g)).appendChild(el(tipo, attrs, null)); return id; };
  const BASE = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];
  const ficha = (id, nome, serve, nao, caixa, params, descricao, usa_t = false, dur = 2) => reg({ id, nome, familia: "graficos", tipo: "grafico", serve_para: serve, nao_usar_quando: nao, camada: "meio", caixa, parametros: [...BASE, ...params], movimento: { param: "p", duracao_s: dur, descricao, usa_t } });
  const DADOS = "[{rotulo, valor}] (valores sempre a partir do zero)";

  // =============== PROGRESSO (um valor de 0 a 1): pote, bag térmica ou marmita
  const progresso = (pai, { x, y, s, rot, estilo = "pote", valor = .72, rotulo = "", cor = null } = {}) => {
    const g = nova(pai, x, y, s, rot), obj = el("g", {}, g); let corpo;
    if (estilo === "bag") {
      const c = cor || C.amarelo; sombra(obj, -130, -110, 260, 220, 36);
      el("path", { d: "M-62 -112V-170Q-62 -214 0 -214Q62 -214 62 -170V-112", fill: "none", stroke: C.cerejaEsc, "stroke-width": 20, "stroke-linecap": "round" }, obj);
      el("rect", { x: -130, y: -110, width: 260, height: 220, rx: 36, fill: C.cereja }, obj); el("rect", { x: -136, y: -128, width: 272, height: 64, rx: 30, fill: C.cerejaEsc }, obj);
      el("path", { d: "M-100 -96H100", stroke: C.cereja, "stroke-width": 5, "stroke-dasharray": "14 10", "stroke-linecap": "round" }, obj);
      el("rect", { x: -52, y: -48, width: 104, height: 150, rx: 22, fill: C.creme }, obj);
      const tr = { x: -22, y: -34, width: 44, height: 112, rx: 22 }, id = clip(obj, tr); el("rect", { ...tr, fill: "#E3DAE9" }, obj);
      [0, 1, 2, 3].forEach((i) => el("rect", { x: 28, y: -30 + i * 36, width: 14, height: 6, rx: 3, fill: C.tinta, "fill-opacity": .5 }, obj));
      const f = el("rect", { x: -22, width: 44, fill: c, "clip-path": `url(#${id})` }, obj); el("circle", { cy: 92, r: 26, fill: c }, obj);
      corpo = (v) => { const hh = 112 * v; f.setAttribute("y", 78 - hh); f.setAttribute("height", Math.max(hh, .1)); };
    } else if (estilo === "marmita") {
      sombra(obj, -150, -130, 300, 220, 34); el("rect", { x: -150, y: -130, width: 300, height: 220, rx: 34, fill: C.creme }, obj);
      const cs = [[-132, -112, 122, 184, C.verde], [8, -112, 124, 88, C.laranja], [8, -16, 124, 88, C.cereja]].map(([cx, cy, w, h, c]) => { const id = clip(obj, { x: cx, y: cy, width: w, height: h, rx: 20 });
        el("rect", { x: cx, y: cy, width: w, height: h, rx: 20, fill: "#E9DDE0" }, obj); const grupo = el("g", { "clip-path": `url(#${id})` }, obj), f = el("rect", { x: cx, width: w }, grupo); f.setAttribute("fill", c);
        [[.25, .3], [.7, .45], [.45, .75]].forEach(([a, b]) => el("circle", { cx: cx + w * a, cy: cy + h * b, r: Math.min(w, h) * .09, fill: C.creme, "fill-opacity": .35 }, grupo)); return { f, cy, h }; });
      corpo = (v) => cs.forEach((o, i) => { const q = lim(v * 3 - i), hh = o.h * q; o.f.setAttribute("y", o.cy + o.h - hh); o.f.setAttribute("height", Math.max(hh, .1)); });
      obj.setAttribute("transform", "translate(0 -30)");
    } else {
      const c = cor || C.cereja; sombra(obj, -110, -150, 220, 260, 40);
      const id = clip(obj, { x: -96, y: -136, width: 192, height: 232, rx: 30 }); el("rect", { x: -110, y: -150, width: 220, height: 260, rx: 40, fill: C.creme }, obj);
      const liq = el("g", { "clip-path": `url(#${id})` }, obj), onda = el("path", { fill: c }, liq), bol = [-52, -10, 32, 62].map((bx, i) => el("circle", { cx: bx, r: 6 + (i % 2) * 3, fill: C.creme, "fill-opacity": .5 }, liq));
      el("rect", { x: -86, y: -128, width: 14, height: 190, rx: 7, fill: "#fff", "fill-opacity": .55 }, obj); el("rect", { x: -100, y: -192, width: 200, height: 50, rx: 16, fill: C.laranja }, obj);
      corpo = (v, t) => { const top = 96 - 232 * v; let d = "M-100 100"; for (let xx = -100; xx <= 100; xx += 8) d += `L${xx} ${top + 7 * Math.sin(xx * .07 + t * 3)}`; onda.setAttribute("d", d + "L100 100Z");
        bol.forEach((b, i) => { const lh = Math.max(232 * v, 1); b.setAttribute("cy", 88 - ((t * 45 + i * 63) % lh)); b.setAttribute("opacity", lh > 40 ? 1 : 0); }); };
    }
    const h = rotulo ? 150 : 112, yc = 250; sombra(g, -135, yc - h / 2, 270, h, 30); el("rect", { x: -135, y: yc - h / 2, width: 270, height: h, rx: 30, fill: C.creme }, g);
    const num = txt(g, 0, yc - h / 2 + 84, "0%", 88, C.cereja, DISP); if (rotulo) txt(g, 0, yc - h / 2 + 130, rotulo, 30, C.tinta, UI);
    return { g, set(p, t = 0) { const v = valor * ease(lim(p)); corpo(v, t); num.textContent = Math.round(v * 100) + "%"; obj.setAttribute("opacity", 1); } };
  };
  ficha("progresso", "Progresso (um valor)", "mostrar UM valor de 0 a 100%: pote que enche, bag térmica com marcador, ou marmita se preenchendo", "são vários valores para comparar (use barras_comida)", { w: 320, h: 540 },
    [{ nome: "estilo", padrao: "pote | bag | marmita" }, { nome: "valor", padrao: .72 }, { nome: "rotulo", padrao: "" }, { nome: "cor", padrao: "depende do estilo" }], "o nível sobe até o valor e o percentual conta junto (pote: onda e bolhas, que usam t)", true);

  // =============== BARRAS (vários valores): frutas empilhadas, marmitas empilhadas ou réguas com ícone
  const barrasComida = (pai, { x, y, s, rot, cartao: ct = true, estilo = "frutas", dados = [{ rotulo: "Seg", valor: 40 }, { rotulo: "Ter", valor: 70 }, { rotulo: "Qua", valor: 55 }, { rotulo: "Qui", valor: 92 }, { rotulo: "Sex", valor: 65 }], max = 100 } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 520, h = 420, n = dados.length; cartao(g, w, h, ct); const base = h / 2 - 60, itens = [], ult = [];
    if (estilo === "reguas") {
      const rh = Math.min(70, (h - 90) / n), tw = w - 250, x0 = -w / 2 + 130, y0 = -h / 2 + 50 + rh / 2;
      dados.forEach((d, i) => { const yy = y0 + i * rh, c = COR5[i % 5], gr = el("g", {}, g); txt(gr, -w / 2 + 28, yy + 9, d.rotulo, 26, C.tinta, UI, "start");
        el("rect", { x: x0, y: yy - 13, width: tw, height: 26, rx: 13, fill: "#E3DAE9" }, gr); const f = el("rect", { x: x0, y: yy - 13, height: 26, rx: 13, fill: c }, gr);
        const ic = el("g", {}, gr); el("circle", { r: 22, fill: c }, ic); el("circle", { cx: -7, cy: -7, r: 6, fill: "#fff", "fill-opacity": .5 }, ic); el("path", { d: "M0 -20Q12 -34 24 -26Q14 -14 0 -20Z", fill: C.verde }, ic);
        const nu = txt(gr, w / 2 - 28, yy + 10, String(d.valor), 28, C.tinta, DISP, "end"); itens.push({ f, ic, nu, yy, x0, tw, v: d.valor / max, i }); });
      return { g, set(p) { itens.forEach((o) => { const u = ease(lim((p - o.i * .12) / .55)), ww = Math.max(o.tw * o.v * u, 26); o.f.setAttribute("width", ww); o.ic.setAttribute("transform", `translate(${o.x0 + ww - 4} ${o.yy}) rotate(${u * 360 * 1.5})`); o.nu.setAttribute("opacity", lim((u - .6) / .4)); }); } };
    }
    el("line", { x1: -w / 2 + 28, x2: w / 2 - 28, y1: base, y2: base, stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round" }, g);
    const gap = (w - 60) / n, K = 7, passo = 36;
    dados.forEach((d, i) => { const cx = -w / 2 + 30 + gap * (i + .5), c = COR5[i % 5], cnt = Math.max(d.valor > 0 ? 1 : 0, Math.round(d.valor / max * K)), un = [];
      txt(g, cx, base + 34, d.rotulo, 22, C.tinta, UI).setAttribute("fill-opacity", .7); const nu = txt(g, cx, 0, String(d.valor), 26, C.tinta, DISP);
      for (let k = 0; k < cnt; k++) { const u = el("g", {}, g), yy = base - 20 - k * passo;
        if (estilo === "marmitas") { const bw = Math.min(78, gap * .82); el("rect", { x: -bw / 2, y: -14, width: bw, height: 30, rx: 8, fill: c }, u); el("rect", { x: -bw / 2, y: -14, width: bw, height: 11, rx: 6, fill: "#fff", "fill-opacity": .35 }, u); }
        else { el("circle", { r: 17, fill: c }, u); el("circle", { cx: -6, cy: -6, r: 5, fill: "#fff", "fill-opacity": .5 }, u); }
        u.dataset.cx = cx; u.dataset.yy = yy; un.push(u); }
      itens.push({ un, nu, cx, topo: base - 20 - Math.max(cnt - 1, 0) * passo - 34, i, cnt }); });
    return { g, set(p) { itens.forEach((o) => { o.un.forEach((u, k) => { const q = lim((p - o.i * .08 - k * .06) / .25), yoff = -(1 - back(q)) * 150;
        u.setAttribute("transform", `translate(${u.dataset.cx} ${+u.dataset.yy + yoff})`); u.setAttribute("opacity", lim(q * 6)); });
      const fim = lim((p - o.i * .08 - o.cnt * .06 - .2) / .15); o.nu.setAttribute("x", o.cx); o.nu.setAttribute("y", o.topo); o.nu.setAttribute("opacity", fim); }); } };
  };
  ficha("barras_comida", "Barras de comida", "comparar 2 a 7 valores: pilhas de frutas, pilhas de marmitas, ou réguas com um ícone que corre", "são mais de 7 itens ou os valores precisam de precisão fina (use tabela_viva)", { w: 520, h: 420 },
    [{ nome: "estilo", padrao: "frutas | marmitas | reguas" }, { nome: "dados", padrao: DADOS }, { nome: "max", padrao: 100 }, { nome: "cartao", padrao: true }], "frutas/marmitas caem e empilham, barra após barra; as réguas enchem com o ícone correndo na ponta; o número aparece no fim", false, 2.2);

  // =============== TABELA VIVA: linhas que se reordenam, cartões de ranking ou célula-herói com cursor
  const tabelaViva = (pai, { x, y, s, rot, estilo = "deslizar", w = 560, colunas = ["Item", "Pedidos"], linhas = [["Marmita fit", "420"], ["Sopa", "310"], ["Salada", "640"], ["Suco", "180"]], col = 1, cor = C.cereja, heroLinha = null } = {}) => {
    const g = nova(pai, x, y, s, rot), n = linhas.length, num = (l) => parseFloat(String(l[col]).replace(/[^\d.,-]/g, "").replace(",", ".")) || 0;
    const ordem = linhas.map((l, i) => i).sort((a, b) => num(linhas[b]) - num(linhas[a])), rk = []; ordem.forEach((i, r) => (rk[i] = r)); const mx = Math.max(...linhas.map(num), 1);
    const cw = w / colunas.length;
    if (estilo === "cartoes") {
      const ch = 84, gp = 16, H = n * ch + (n - 1) * gp, itens = linhas.map((l, i) => { const gr = el("g", {}, g), y0 = -H / 2 + i * (ch + gp), y1 = -H / 2 + rk[i] * (ch + gp);
        sombra(gr, -w / 2, 0, w, ch, 22); el("rect", { x: -w / 2, width: w, height: ch, rx: 22, fill: C.creme }, gr); txt(gr, -w / 2 + 100, 38, l[0], 32, C.tinta, UI, "start");
        el("rect", { x: -w / 2 + 100, y: 52, width: w - 240, height: 12, rx: 6, fill: "#E3DAE9" }, gr); const br = el("rect", { x: -w / 2 + 100, y: 52, height: 12, rx: 6, fill: COR5[rk[i] % 5] }, gr);
        txt(gr, w / 2 - 28, 56, l[col], 40, C.tinta, DISP, "end"); const md = el("g", {}, gr); el("circle", { cx: -w / 2 + 50, cy: ch / 2, r: 28, fill: [C.amarelo, C.rosa, C.areia][rk[i]] || "#E3DAE9" }, md); txt(md, -w / 2 + 50, ch / 2 + 14, String(rk[i] + 1), 40, C.tinta, DISP);
        return { gr, y0, y1, br, md, v: num(l) / mx, i }; });
      return { g, set(p) { itens.forEach((o) => { const e = ease(lim((p - o.i * .1) / .25)), mv = ease(lim((p - .35 - o.i * .04) / .35)); o.gr.setAttribute("opacity", e);
        o.gr.setAttribute("transform", `translate(${(1 - e) * -50} ${lerp(o.y0, o.y1, mv)}) ${rk[o.i] === 0 ? `translate(0 ${ch / 2}) scale(${1 + .04 * lim((p - .8) / .15)}) translate(0 ${-ch / 2})` : ""}`);
        o.br.setAttribute("width", Math.max((w - 240) * o.v * ease(lim((p - .15 - o.i * .06) / .4)), .1)); const m = back(lim((p - .78) / .2)); o.md.setAttribute("transform", `translate(${-w / 2 + 50} ${ch / 2}) scale(${Math.max(m, .001)}) translate(${w / 2 - 50} ${-ch / 2})`); }); } };
    }
    const hH = 62, rH = 56, H = hH + rH * n, sh = sombra(g, -w / 2, -H / 2, w, H, 20), cab = el("g", {}, g);
    el("path", { d: `M${-w / 2} ${-H / 2 + hH}V${-H / 2 + 20}Q${-w / 2} ${-H / 2} ${-w / 2 + 20} ${-H / 2}H${w / 2 - 20}Q${w / 2} ${-H / 2} ${w / 2} ${-H / 2 + 20}V${-H / 2 + hH}Z`, fill: cor }, cab);
    colunas.forEach((c, i) => txt(cab, -w / 2 + i * cw + 20, -H / 2 + 41, c, 26, C.creme, UI, "start"));
    const caixaT = el("g", {}, g), id = clip(g, { d: `M${-w / 2} ${-H / 2 + hH}H${w / 2}V${H / 2 - 20}Q${w / 2} ${H / 2} ${w / 2 - 20} ${H / 2}H${-w / 2 + 20}Q${-w / 2} ${H / 2} ${-w / 2} ${H / 2 - 20}Z` }, "path"); caixaT.setAttribute("clip-path", `url(#${id})`);
    const ult = (i) => (estilo === "deslizar" ? 0 : i === n - 1), rows = linhas.map((l, i) => { const gr = el("g", {}, caixaT), yy = -H / 2 + hH, hi = el("rect", { x: -w / 2, y: yy, width: w, height: rH, fill: C.amarelo, opacity: 0 }, gr);
      el("rect", { x: -w / 2, y: yy, width: w, height: rH + .5, fill: i % 2 ? C.lilas : C.creme }, gr).setAttribute("opacity", 1); gr.insertBefore(hi, null);
      l.forEach((c, k) => txt(gr, -w / 2 + k * cw + 20, yy + 37, c, 25, C.tinta, UI, "start")); return { gr, hi, y0: i * rH, y1: rk[i] * rH, i }; });
    if (estilo === "celula") {
      const hr = heroLinha != null ? heroLinha : ordem[0], hx = -w / 2 + col * cw + 8, hy = -H / 2 + hH + hr * rH + 4, hw = cw - 16, hh = rH - 8, cel = el("g", {}, g);
      el("rect", { x: hx + 8, y: hy + 7, width: hw, height: hh, rx: 12, ...SOMBRA }, cel); el("rect", { x: hx, y: hy, width: hw, height: hh, rx: 12, fill: C.amarelo }, cel); txt(cel, hx + 14, hy + 38, linhas[hr][col], 30, C.tinta, DISP, "start");
      const cur = el("g", {}, g); el("path", { d: "M0 0L0 40L11 30L19 48L28 44L20 27L35 27Z", fill: C.tinta, stroke: C.creme, "stroke-width": 4, "stroke-linejoin": "round" }, cur);
      return { g, set(p) { sh.setAttribute("opacity", lim(p / .12) * .24); cab.setAttribute("opacity", lim(p / .12)); rows.forEach((o) => { const u = lim((p - .12 - o.i * .1) / .2); o.gr.setAttribute("opacity", u); o.gr.setAttribute("transform", `translate(${(1 - ease(u)) * -40} ${o.y0})`); });
        const m = ease(lim((p - .4) / .3)), ex = lerp(w / 2 + 40, hx + hw * .55, m), ey = lerp(H / 2 + 80, hy + hh * .5, m); cur.setAttribute("transform", `translate(${ex} ${ey}) scale(${1 - .12 * lim((p - .72) / .08)})`); cur.setAttribute("opacity", lim((p - .4) / .1));
        const q = back(lim((p - .72) / .22)); cel.setAttribute("opacity", lim((p - .72) / .08)); cel.setAttribute("transform", `translate(${hx + hw / 2} ${hy + hh / 2}) scale(${Math.max(.9 + .14 * q, .001)}) translate(${-hx - hw / 2} ${-hy - hh / 2})`); } };
    }
    return { g, set(p) { sh.setAttribute("opacity", lim(p / .12) * .24); cab.setAttribute("opacity", lim(p / .12));
      rows.forEach((o) => { const u = lim((p - .12 - o.i * .1) / .2), mv = ease(lim((p - .42 - o.i * .05) / .35)); o.gr.setAttribute("opacity", u); o.gr.setAttribute("transform", `translate(${(1 - ease(u)) * -40} ${lerp(o.y0, o.y1, mv)})`); o.hi.setAttribute("opacity", rk[o.i] === 0 ? lim((p - .82) / .15) : 0); }); } };
  };
  ficha("tabela_viva", "Tabela viva", "dados em linhas que mudam de ordem: ranking. As linhas deslizam, viram cartões com medalha, ou o cursor escolhe uma célula-herói", "são mais de 6 linhas ou 4 colunas (não cabe legível)", { w: 560, h: 330 },
    [{ nome: "estilo", padrao: "deslizar | cartoes | celula" }, { nome: "colunas", padrao: "lista de títulos" }, { nome: "linhas", padrao: "matriz de textos" }, { nome: "col", padrao: "índice da coluna numérica (ordena do maior para o menor)" }, { nome: "heroLinha", padrao: "linha da célula-herói (celula)" }],
    "as linhas entram, depois se reordenam do maior para o menor; o primeiro lugar ganha destaque (cartões: medalhas; célula: cursor + pop)", false, 2.6);

  // =============== MOTO DE ENTREGA (peça de apoio, reaproveitada em linha e corrida): scooter com a bag térmica vermelha na garupa
  // Origem = chão sob o meio da moto, olhando para a direita. { g, rodas(a) } gira as rodas.
  const moto = (pai, cor = C.amarelo) => {
    const g = el("g", {}, pai);
    el("rect", { x: -80, y: -80, width: 46, height: 42, rx: 10, fill: C.cereja }, g); el("rect", { x: -80, y: -66, width: 46, height: 8, fill: C.creme }, g);
    el("path", { d: "M-44 -30Q-44 -44 -30 -44H20L34 -68H46L42 -30Q42 -22 34 -22H-34Q-44 -22 -44 -30Z", fill: cor }, g);
    el("rect", { x: -40, y: -54, width: 46, height: 11, rx: 5, fill: C.tinta }, g); el("rect", { x: 30, y: -76, width: 24, height: 8, rx: 4, fill: C.tinta }, g);
    const rs = [-30, 36].map((cx) => { const r = el("g", {}, g); el("circle", { r: 16, fill: C.tinta }, r); el("circle", { r: 7, fill: C.creme }, r); el("rect", { x: -1.5, y: -14, width: 3, height: 28, fill: C.creme }, r); r.dataset.cx = cx; return r; });
    return { g, rodas(a) { rs.forEach((r) => r.setAttribute("transform", `translate(${r.dataset.cx} -16) rotate(${a})`)); } };
  };

  // =============== LINHA VIVA: a evolução no tempo com um viajante (pin, moto) ou um broto que cresce
  const linhaViva = (pai, { x, y, s, rot, cartao: ct = true, estilo = "pin", dados = [{ rotulo: "Jan", valor: 20 }, { rotulo: "Fev", valor: 38 }, { rotulo: "Mar", valor: 30 }, { rotulo: "Abr", valor: 62 }, { rotulo: "Mai", valor: 90 }], max = 100, cor = null } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 520, h = 420, n = dados.length; cartao(g, w, h, ct);
    const base = h / 2 - 90, alt = 220, px = (i) => -w / 2 + 70 + i * (w - 140) / (n - 1), py = (v) => base - alt * v / max, brt = estilo === "broto", c = cor || (brt ? C.verde : C.cereja);
    el("line", { x1: -w / 2 + 28, x2: w / 2 - 28, y1: base, y2: base, stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round" }, g);
    const d = dados.map((q, i) => (i ? "L" : "M") + px(i) + " " + py(q.valor)).join("");
    if (!brt) el("path", { d: d + `L${px(n - 1)} ${base}L${px(0)} ${base}Z`, fill: c, "fill-opacity": .16 }, g);
    const tr = el("path", { d, fill: "none", stroke: c, "stroke-width": brt ? 14 : 12, "stroke-linecap": "round", "stroke-linejoin": "round" }, g), L = tr.getTotalLength();
    tr.setAttribute("stroke-dasharray", L);
    const pts = dados.map((q, i) => { const o = { i };
      txt(g, px(i), base + 36, q.rotulo, 22, C.tinta, UI).setAttribute("fill-opacity", .7); o.nu = txt(g, px(i), base + 72, String(q.valor), 30, C.tinta, DISP);
      if (brt) { if (i < n - 1) { o.fo = [1, -1].map((lado) => { const f = el("g", {}, g); el("path", { d: "M0 0Q22 -4 38 -26Q12 -34 0 0Z", fill: i % 2 ? C.menta : C.verde, transform: `scale(${lado} 1)` }, f); f.dataset.lado = lado; return f; }); } }
      else o.dot = el("circle", { r: 11, fill: C.creme, stroke: c, "stroke-width": 6 }, g);
      return o; });
    let ve = null, fruto = null, bud = null;
    if (estilo === "pin") { ve = el("g", {}, g); el("path", { d: "M0 0C-10 -16 -30 -30 -30 -50A30 30 0 1 1 30 -50C30 -30 10 -16 0 0Z", fill: C.cereja }, ve); el("circle", { cy: -50, r: 11, fill: C.creme }, ve); }
    else if (estilo === "moto") { const m = moto(g, C.amarelo); ve = m.g; ve.rodas = m.rodas; }
    else { bud = el("circle", { r: 13, fill: C.menta }, g); fruto = el("g", {}, g); el("circle", { r: 24, fill: C.cereja }, fruto); el("circle", { cx: -8, cy: -8, r: 7, fill: "#fff", "fill-opacity": .5 }, fruto); el("path", { d: "M0 -22Q14 -38 28 -30Q16 -18 0 -22Z", fill: C.verde }, fruto); }
    return { g, set(p) { const u = ease(lim(p)); tr.setAttribute("stroke-dashoffset", L * (1 - u)); const pos = tr.getPointAtLength(L * u), p2 = tr.getPointAtLength(Math.min(L, L * u + 2)), p1 = tr.getPointAtLength(Math.max(0, L * u - 2));
      const ang = Math.max(-38, Math.min(38, Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI));
      pts.forEach((o) => { const q = lim((u * (n - 1) - (o.i - .3)) / .3); o.nu.setAttribute("opacity", q); const tp = (e, sc) => e.setAttribute("transform", `translate(${px(o.i)} ${py(dados[o.i].valor)}) scale(${Math.max(sc, .001)})`);
        if (o.dot) { tp(o.dot, back(q)); o.dot.setAttribute("opacity", q > 0 ? 1 : 0); }
        if (o.fo) o.fo.forEach((f, k) => { const sc = back(q); f.setAttribute("transform", `translate(${px(o.i)} ${py(dados[o.i].valor)}) rotate(${-14 - k * 4}) scale(${Math.max(sc, .001) * (+f.dataset.lado)} ${Math.max(sc, .001)})`); f.setAttribute("opacity", q > 0 ? 1 : 0); }); });
      if (estilo === "pin") { ve.setAttribute("transform", `translate(${pos.x} ${pos.y}) scale(${.9 + .1 * Math.sin(u * 40)})`); ve.setAttribute("opacity", p > 0 ? 1 : 0); }
      else if (estilo === "moto") { ve.setAttribute("transform", `translate(${pos.x} ${pos.y}) rotate(${ang}) scale(.82)`); ve.rodas(u * 1100); ve.setAttribute("opacity", p > 0 ? 1 : 0); }
      else { const f = back(lim((p - .86) / .14)); bud.setAttribute("transform", `translate(${pos.x} ${pos.y}) scale(${1 - lim((p - .86) / .1)})`); fruto.setAttribute("transform", `translate(${px(n - 1)} ${py(dados[n - 1].valor) - 6}) scale(${Math.max(f, .001)})`); } } };
  };
  ficha("linha_viva", "Linha viva", "evolução no tempo com 3 a 8 pontos: um pin de mapa, uma moto de entrega ou um broto percorre a linha e cada ponto aparece quando é alcançado", "são menos de 3 pontos (use numero) ou os pontos não seguem uma ordem no tempo", { w: 520, h: 420 },
    [{ nome: "estilo", padrao: "pin | moto | broto" }, { nome: "dados", padrao: DADOS }, { nome: "max", padrao: 100 }, { nome: "cor", padrao: "depende do estilo" }, { nome: "cartao", padrao: true }],
    "a linha se desenha com o viajante na ponta (a moto gira as rodas e acompanha a inclinação; o broto solta folhas e termina em fruto)", false, 2.6);

  // =============== CORRIDA: quem passa quem. Barras que trocam de posição, pódio ou pistas com motos
  const corrida = (pai, { x, y, s, rot, cartao: ct = true, estilo = "barras", dados = [{ rotulo: "Sopa", de: 20, valor: 90 }, { rotulo: "Salada", de: 60, valor: 70 }, { rotulo: "Marmita", de: 80, valor: 50 }, { rotulo: "Suco", de: 30, valor: 85 }], max = 100 } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 520, h = 420, n = dados.length; cartao(g, w, h, ct);
    const val = (o, u) => lerp(o.de == null ? 0 : o.de, o.valor, u);
    if (estilo === "podio") {
      const top = [...dados].sort((a, b) => b.valor - a.valor).slice(0, 3), ord = [1, 0, 2], hts = [190, 140, 100], cs = [C.amarelo, C.rosa, C.areia], base = h / 2 - 70, bw = 138;
      const it = ord.map((r, k) => { const d = top[r]; if (!d) return null; const cx = -150 + k * 150, gr = el("g", {}, g), bl = el("g", {}, gr);
        el("rect", { x: cx - bw / 2 + 8, y: base - hts[r] + 7, width: bw, height: hts[r], rx: 14, ...SOMBRA }, bl); el("rect", { x: cx - bw / 2, y: base - hts[r], width: bw, height: hts[r], rx: 14, fill: cs[r] }, bl);
        txt(bl, cx, base - hts[r] + 60, String(r + 1), 64, C.tinta, DISP); const vn = txt(bl, cx, base - 14, "0", 34, C.tinta, DISP); txt(g, cx, base + 38, d.rotulo, 22, C.tinta, UI).setAttribute("fill-opacity", .75);
        const fr = el("g", {}, gr); el("circle", { r: 26, fill: COR5[r === 0 ? 0 : r === 1 ? 1 : 3] }, fr); el("circle", { cx: -8, cy: -8, r: 8, fill: "#fff", "fill-opacity": .5 }, fr); el("path", { d: "M0 -24Q14 -40 30 -32Q18 -20 0 -24Z", fill: C.verde }, fr);
        let st = null; if (r === 0) { st = el("path", { d: "M0 -26L8 -8L28 -6L13 7L18 27L0 17L-18 27L-13 7L-28 -6L-8 -8Z", fill: C.amarelo }, gr); }
        return { cx, r, bl, vn, fr, st, topo: base - hts[r], v: d.valor }; }).filter(Boolean);
      return { g, set(p) { it.forEach((o) => { const q = lim((p - (2 - o.r) * .16) / .35), e = ease(q), f = back(lim((p - (2 - o.r) * .16 - .3) / .25));
        o.bl.setAttribute("transform", `translate(0 ${base}) scale(1 ${Math.max(e, .001)}) translate(0 ${-base})`); o.vn.textContent = String(Math.round(o.v * ease(lim((p - .3 - (2 - o.r) * .1) / .5))));
        o.fr.setAttribute("transform", `translate(${o.cx} ${o.topo - 30 - (1 - f) * 120}) scale(${Math.max(lim(f * 3), .001)})`); o.fr.setAttribute("opacity", lim(f * 4));
        if (o.st) { const sf = back(lim((p - .82) / .18)); o.st.setAttribute("transform", `translate(${o.cx} ${o.topo - 96}) rotate(${(1 - sf) * -180}) scale(${Math.max(sf, .001)})`); } }); } };
    }
    if (estilo === "pistas") {
      const lh = Math.min(78, (h - 100) / n), y0 = -h / 2 + 50, x0 = -w / 2 + 160, x1 = w / 2 - 138, itens = dados.map((d, i) => { const yy = y0 + i * lh + lh / 2, c = COR5[i % 5];
        el("rect", { x: -w / 2 + 120, y: yy - lh / 2 + 4, width: w - 144, height: lh - 8, rx: 16, fill: "#E9DDE0" }, g); txt(g, -w / 2 + 28, yy + 9, d.rotulo, 24, C.tinta, UI, "start");
        el("line", { x1: x0, x2: x1 + 26, y1: yy + lh * .27, y2: yy + lh * .27, stroke: "#fff", "stroke-width": 3, "stroke-dasharray": "10 10", "stroke-opacity": .8 }, g);
        const m = moto(g, c), nu = txt(g, w / 2 - 24, yy + 10, "0", 28, C.tinta, DISP, "end"); return { d, m, nu, yy }; });
      for (let k = 0; k < Math.floor(lh * n / 10); k++) el("rect", { x: x1 + 30 + (k % 2) * 10, y: y0 + 8 + k * 10, width: 10, height: 10, fill: (k + Math.floor(k / 2)) % 2 ? C.tinta : C.creme }, g);
      return { g, set(p) { const u = ease(lim((p - .08) / .85)); itens.forEach((o) => { const v = val(o.d, u), xx = x0 + (x1 - x0) * v / max; o.m.g.setAttribute("transform", `translate(${xx} ${o.yy + lh * .3}) scale(.5)`); o.m.rodas(u * 1400); o.nu.textContent = String(Math.round(v)); }); } };
    }
    const rh = Math.min(82, (h - 80) / n), y0 = -h / 2 + 40, x0 = -w / 2 + 140, tw = w - 140 - 100, s0 = max * .012;
    const rows = dados.map((d, i) => { const gr = el("g", {}, g); txt(gr, -w / 2 + 28, 9, d.rotulo, 26, C.tinta, UI, "start"); const b = el("rect", { x: x0, y: -19, height: 38, rx: 19, fill: COR5[i % 5] }, gr), nu = txt(gr, w / 2 - 24, 10, "0", 30, C.tinta, DISP, "end"); return { d, gr, b, nu }; });
    return { g, set(p) { const u = ease(lim((p - .1) / .8)), vs = dados.map((d) => val(d, u));
      rows.forEach((o, i) => { let rk = 0; vs.forEach((v, j) => { if (j !== i) rk += 1 / (1 + Math.exp(-(v - vs[i]) / s0)); }); o.gr.setAttribute("transform", `translate(0 ${y0 + rk * rh + rh / 2})`); o.gr.setAttribute("opacity", lim(p / .1));
        o.b.setAttribute("width", Math.max(tw * vs[i] / max, 38)); o.nu.textContent = String(Math.round(vs[i])); }); } };
  };
  ficha("corrida", "Corrida (ranking que muda)", "mostrar quem passou quem: barras que trocam de posição, pódio dos 3 primeiros, ou pistas com motos de entrega correndo até a linha de chegada", "só existe um momento no tempo (use barras_comida) ou são mais de 6 itens", { w: 520, h: 420 },
    [{ nome: "estilo", padrao: "barras | podio | pistas" }, { nome: "dados", padrao: "[{rotulo, de, valor}]: de = valor inicial (opcional, padrão 0), valor = final; podio usa só os 3 maiores valores e mostra a POSIÇÃO (valores em texto)" }, { nome: "max", padrao: 100 }, { nome: "cartao", padrao: true }],
    "os valores vão de `de` até `valor`; nas barras, quem passa troca de lugar suavemente; nas pistas as motos correm; no pódio os degraus sobem e a estrela cai no 1º", false, 2.8);

  Object.assign(EL, { progresso, barras_comida: barrasComida, tabela_viva: tabelaViva, moto, linha_viva: linhaViva, corrida });
})();
