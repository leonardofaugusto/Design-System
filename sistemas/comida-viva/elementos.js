// Elementos ilustrados da cartilha (v1). Cada um é uma peça fixa: o mesmo desenho sempre, só muda o parâmetro de movimento.
// Estilo: formas chapadas com luz e sombra (sem contorno preto), sombra dura deslocada, cores da Liv Up.
// Sem filter:blur. Tudo é função de (p, t): p = progresso da ação (0..1), t = tempo em segundos (ondas, vapor, bolhas).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const C = { cereja: "#E50145", cerejaEsc: "#B80037", rosa: "#FF87A0", laranja: "#F15A22", laranjaEsc: "#C9430F", areia: "#F5D69E",
    amarelo: "#EFD600", creme: "#FFF9E9", verde: "#0C893E", verdeEsc: "#096B31", menta: "#63E578", roxo: "#962E9D", roxoEsc: "#6F2275",
    lilas: "#FAC7FF", tinta: "#2A0B2E" };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const el = (tipo, attrs, pai) => { const e = document.createElementNS(NS, tipo); for (const k in attrs) e.setAttribute(k, attrs[k]); if (pai) pai.appendChild(e); return e; };
  const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  let uid = 0;
  // catálogo: cada peça se registra com a sua ficha (o manifesto.json é gerado daqui, nunca escrito à mão)
  const catalogo = [];
  const reg = (m) => { catalogo.push(m); return m; };
  const SOMBRA = { fill: C.tinta, "fill-opacity": .24 };   // sombra dura: a silhueta deslocada, sem blur
  const grupo = (pai, x, y, s) => el("g", { transform: `translate(${x} ${y}) scale(${s})` }, pai);

  // ---------- FORMA-ASSINATURA: retângulo de cantos grandes com as bordas de cima e de baixo inclinadas (skewY -10°)
  // caixa local: x 20..220, y ~1..237; centro ~ (120,144)
  function forma(pai, cor, { x = 0, y = 0, s = 1, sombra = null } = {}) {
    const g = grupo(pai, x, y, s);
    if (sombra) { const m = el("g", { transform: "translate(14 12) translate(0 50) skewY(-10)" }, g); el("rect", { x: 20, y: 40, width: 200, height: 150, rx: 44, fill: sombra }, m); }
    const m = el("g", { transform: "translate(0 50) skewY(-10)" }, g);
    el("rect", { x: 20, y: 40, width: 200, height: 150, rx: 44, fill: cor }, m);
    return g;
  }

  // ---------- POTE com vitamina que enche. p: 0 vazio .. 1 cheio. Frutas caem dentro, a onda se mexe.
  function pote(pai, { x = 0, y = 0, s = 1 } = {}) {
    const id = "j" + (uid++);
    const g = grupo(pai, x, y, s);
    const corpo = "M44 70H156C170 70 176 80 176 94V252C176 274 162 288 140 288H60C38 288 24 274 24 252V94C24 80 30 70 44 70Z";
    el("path", { d: corpo, transform: "translate(20 16)", ...SOMBRA }, g);
    const defs = el("defs", {}, g);
    el("path", { d: corpo }, el("clipPath", { id }, defs));
    const gr = el("linearGradient", { id: id + "g", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [[0, "#BE63CA"], [.5, C.roxo], [1, C.roxoEsc]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, gr));
    el("path", { d: corpo, fill: "#fff", "fill-opacity": .45 }, g);
    const canudo = el("g", { transform: "rotate(12 100 70)" }, g);
    el("rect", { x: 112, y: -50, width: 14, height: 250, rx: 7, fill: C.creme }, canudo);
    el("rect", { x: 120, y: -50, width: 6, height: 250, rx: 3, fill: "#000", "fill-opacity": .08 }, canudo);
    [-20, 30, 80].forEach((yy) => el("rect", { x: 112, y: yy, width: 14, height: 9, fill: C.cereja }, canudo));
    const liq = el("g", { "clip-path": `url(#${id})` }, g);
    const corpoLiq = el("path", { fill: `url(#${id}g)` }, liq);
    const espuma = el("path", { fill: C.lilas }, liq);
    const bolhas = [...Array(7)].map(() => el("circle", { fill: "#fff", "fill-opacity": .5 }, liq));
    const ondulas = el("ellipse", { cx: 100, rx: 0, ry: 0, fill: "none", stroke: "#fff", "stroke-width": 3, "stroke-opacity": .8 }, liq);
    el("rect", { x: 36, y: 96, width: 12, height: 150, rx: 6, fill: "#fff", "fill-opacity": .55 }, g);
    el("rect", { x: 156, y: 100, width: 10, height: 140, rx: 5, fill: "#000", "fill-opacity": .08 }, g);
    el("rect", { x: 28, y: 60, width: 144, height: 16, rx: 8, fill: "#fff", "fill-opacity": .85 }, g);
    // hortelã e laranja na borda
    [[152, 52, -28], [172, 60, 20]].forEach(([cx, cy, r]) => { const f = el("g", { transform: `translate(${cx} ${cy}) rotate(${r})` }, g);
      el("ellipse", { rx: 17, ry: 8, fill: C.verde }, f); el("path", { d: "M-15 0H14", stroke: C.menta, "stroke-width": 2.5, "stroke-linecap": "round" }, f); });
    const frutas = [[78, "laranja"], [104, "rosa"], [130, "roxo"]].map(([fx, tipo]) => {
      const f = el("g", {}, g);
      if (tipo === "laranja") { el("circle", { r: 15, fill: C.laranja }, f); el("circle", { r: 10, fill: "#FFA23A" }, f); el("path", { d: "M-10 0H10M0 -10V10", stroke: C.creme, "stroke-width": 2 }, f); }
      else { el("circle", { r: 14, fill: tipo === "rosa" ? C.cereja : C.roxoEsc }, f); el("ellipse", { cx: -4, cy: -5, rx: 4, ry: 3, fill: "#fff", "fill-opacity": .7 }, f); }
      f.fx = fx; return f;
    });
    const NIVEL_VAZIO = 286, NIVEL_CHEIO = 98;
    const onda = (path, nivel, amp, fase, base) => {
      let d = ""; for (let xx = -4; xx <= 204; xx += 8) d += (xx < 0 ? "M" : "L") + xx + " " + (nivel + amp * Math.sin(xx * .09 + fase)).toFixed(1);
      path.setAttribute("d", d + `V${base}H-4Z`);
    };
    return { g, set(p, t = 0) {
      const nivel = NIVEL_VAZIO - (NIVEL_VAZIO - NIVEL_CHEIO) * ease(clamp(p));
      const amp = p <= 0 ? 0 : 5 * (1 - .55 * clamp(p));
      onda(corpoLiq, nivel, amp, t * 5, 320); onda(espuma, nivel - 9, amp, t * 5 + 1.3, nivel + 4);
      espuma.setAttribute("opacity", p <= 0 ? 0 : 1); corpoLiq.setAttribute("opacity", p <= 0 ? 0 : 1);
      bolhas.forEach((b, i) => { const alt = NIVEL_VAZIO - nivel; const cy = NIVEL_VAZIO - ((t * 34 + i * 43) % Math.max(alt, 20));
        b.setAttribute("cx", 48 + (i * 23) % 100); b.setAttribute("cy", cy); b.setAttribute("r", 2.5 + (i % 3));
        b.setAttribute("opacity", p > 0 && cy > nivel + 10 ? 1 : 0); });
      frutas.forEach((f, k) => { const t0 = [.06, .26, .46][k], loc = clamp((p - t0) / .2);
        const yy = -80 + (nivel - 14 + 80) * loc * loc;
        f.setAttribute("transform", `translate(${f.fx} ${yy}) rotate(${loc * 300})`); f.setAttribute("opacity", loc > 0 && loc < 1 ? 1 : 0); });
      const rr = clamp((p - .26) / .14); // marola quando a fruta cai
      const marola = [.26, .46].map((t0) => clamp((p - t0 - .2) / .12)).find((v) => v > 0 && v < 1);
      ondulas.setAttribute("cy", nivel); ondulas.setAttribute("rx", marola ? 14 + 60 * marola : 0); ondulas.setAttribute("ry", marola ? 3 + 8 * marola : 0);
      ondulas.setAttribute("stroke-opacity", marola ? .8 * (1 - marola) : 0);
    } };
  }

  // ---------- MARMITA vista de cima. p: 0 fechada .. 1 aberta. A tampa levanta, desliza e some; sai vapor; a comida dá um pulinho.
  function marmita(pai, { x = 0, y = 0, s = 1, cor = C.cereja, corEsc = C.cerejaEsc } = {}) {
    const g = grupo(pai, x, y, s);
    el("rect", { x: 10, y: 10, width: 300, height: 200, rx: 30, transform: "translate(18 15)", ...SOMBRA }, g);
    el("rect", { x: 10, y: 10, width: 300, height: 200, rx: 30, fill: cor }, g);
    el("rect", { x: 20, y: 20, width: 280, height: 180, rx: 22, fill: corEsc }, g);
    const comida = el("g", {}, g);
    [[30, 30, 140, 160], [180, 30, 110, 75], [180, 115, 110, 75]].forEach(([xx, yy, w, h]) => el("rect", { x: xx, y: yy, width: w, height: h, rx: 16, fill: "#fff" }, comida));
    for (let i = 0; i < 64; i++) { const a = rnd(i + 1) * Math.PI * 2, r = Math.sqrt(rnd(i + 90)) * 62;
      el("ellipse", { cx: 100 + r * Math.cos(a) * 1.0, cy: 112 + r * Math.sin(a) * 1.15, rx: 7, ry: 4, fill: i % 4 ? C.creme : C.areia, transform: `rotate(${rnd(i) * 180} ${100 + r * Math.cos(a)} ${112 + r * Math.sin(a) * 1.15})` }, comida); }
    for (let i = 0; i < 5; i++) { const bx = 120 + (i % 3) * 22, by = 52 + Math.floor(i / 3) * 24 + (i % 2) * 8;
      [[0, 0, 13], [-11, 7, 10], [10, 8, 10], [0, 11, 9]].forEach(([dx, dy, r], k) => el("circle", { cx: bx + dx, cy: by + dy, r, fill: k % 2 ? C.verde : C.verdeEsc }, comida));
      el("circle", { cx: bx - 3, cy: by - 4, r: 4, fill: C.menta }, comida); }
    for (let i = 0; i < 4; i++) { const cx = 205 + (i % 2) * 44, cy = 52 + Math.floor(i / 2) * 36;
      el("circle", { cx, cy, r: 17, fill: C.laranja }, comida); el("circle", { cx, cy, r: 11, fill: "#FF8A3D" }, comida); el("circle", { cx, cy, r: 4, fill: C.areia }, comida); }
    for (let i = 0; i < 3; i++) { const f = el("g", { transform: `translate(${235} ${132 + i * 20}) rotate(${-14 + i * 10})` }, comida);
      el("rect", { x: -44, y: -9, width: 88, height: 20, rx: 9, fill: "#D98A3D" }, f);
      [-24, -8, 8, 24].forEach((xx) => el("path", { d: `M${xx} -7L${xx + 5} 9`, stroke: "#8A4A1A", "stroke-width": 3, "stroke-linecap": "round" }, f)); }
    const vapor = [0, 1, 2].map((i) => el("path", { fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round", "stroke-opacity": 0 }, g));
    const sombraTampa = el("rect", { x: 4, y: 4, width: 312, height: 212, rx: 34, ...SOMBRA }, g);
    const tampa = el("g", {}, g);
    el("rect", { x: 4, y: 4, width: 312, height: 212, rx: 34, fill: "#fff", "fill-opacity": .62 }, tampa);
    el("rect", { x: 4, y: 4, width: 312, height: 212, rx: 34, fill: "none", stroke: "#fff", "stroke-width": 5 }, tampa);
    el("rect", { x: 40, y: 22, width: 22, height: 150, rx: 11, fill: "#fff", "fill-opacity": .5, transform: "rotate(18 51 97)" }, tampa);
    el("rect", { x: 76, y: 22, width: 10, height: 120, rx: 5, fill: "#fff", "fill-opacity": .4, transform: "rotate(18 81 82)" }, tampa);
    el("rect", { x: 296, y: 84, width: 30, height: 52, rx: 12, fill: C.creme }, tampa);
    return { g, set(p, t = 0) {
      const lift = ease(clamp(p / .25)), slide = ease(clamp((p - .25) / .45)), sumir = 1 - clamp((p - .6) / .25);
      const tx = slide * 360, ty = -lift * 16 - slide * 50, rot = slide * 16, sc = 1 + lift * .1;
      const T = `translate(${tx} ${ty}) translate(160 110) rotate(${rot}) scale(${sc}) translate(-160 -110)`;
      tampa.setAttribute("transform", T); tampa.setAttribute("opacity", sumir);
      sombraTampa.setAttribute("transform", `translate(${tx + 16 + lift * 14} ${ty + 14 + lift * 16}) translate(160 110) rotate(${rot}) scale(${sc}) translate(-160 -110)`);
      sombraTampa.setAttribute("opacity", sumir);
      const pulo = p > .55 ? 1 + .035 * Math.sin(Math.PI * clamp((p - .55) / .3)) : 1;
      comida.setAttribute("transform", `translate(160 110) scale(${pulo}) translate(-160 -110)`);
      const vis = ease(clamp((p - .6) / .2));
      vapor.forEach((v, i) => { const yy = 40 - ((t * 38 + i * 26) % 70), xx = 90 + i * 70;
        v.setAttribute("d", `M${xx} ${yy + 60}c-14 -14 14 -26 0 -40s14 -26 0 -40`); v.setAttribute("stroke-opacity", vis * (.55 - ((t * 38 + i * 26) % 70) / 140)); });
    } };
  }

  // ---------- frutas de enfeite (estáticas)
  function laranja(pai, { x = 0, y = 0, s = 1 } = {}) {
    const g = grupo(pai, x, y, s);
    el("circle", { cx: 0, cy: 0, r: 70, transform: "translate(16 14)", ...SOMBRA }, g);
    el("circle", { r: 70, fill: C.laranja }, g); el("circle", { r: 62, fill: C.creme }, g);
    for (let i = 0; i < 9; i++) { const a0 = i * 40 + 3, a1 = a0 + 34, r = 56, P = (a) => [r * Math.cos(a * Math.PI / 180), r * Math.sin(a * Math.PI / 180)];
      const [x0, y0] = P(a0), [x1, y1] = P(a1); el("path", { d: `M0 0L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`, fill: i % 2 ? "#FF9C2E" : "#FFA944" }, g); }
    el("circle", { r: 6, fill: C.creme }, g); el("path", { d: "M-40 -34A54 54 0 0 1 4 -54", fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", "stroke-opacity": .7 }, g);
    return g;
  }
  function abacate(pai, { x = 0, y = 0, s = 1 } = {}) {
    const g = grupo(pai, x, y, s);
    el("ellipse", { rx: 62, ry: 84, transform: "translate(16 14) rotate(14)", ...SOMBRA }, g);
    const f = el("g", { transform: "rotate(14)" }, g);
    el("ellipse", { rx: 62, ry: 84, fill: C.verdeEsc }, f); el("ellipse", { rx: 54, ry: 76, fill: C.verde }, f);
    el("ellipse", { rx: 47, ry: 69, fill: "#D6E96E" }, f); el("ellipse", { rx: 40, ry: 54, cy: 4, fill: "#B9D94F" }, f);
    el("circle", { cx: 0, cy: 22, r: 30, fill: "#8A4B24" }, f); el("ellipse", { cx: -9, cy: 12, rx: 9, ry: 6, fill: "#C98650" }, f);
    return g;
  }
  function cereja(pai, { x = 0, y = 0, s = 1 } = {}) {
    const g = grupo(pai, x, y, s);
    [[-34, 30, 38], [38, 44, 34]].forEach(([cx, cy, r]) => {
      el("circle", { cx, cy, r, transform: "translate(14 12)", ...SOMBRA }, g);
      el("circle", { cx, cy, r, fill: C.cereja }, g); el("path", { d: `M${cx - r + 6} ${cy + r * .5}A${r} ${r} 0 0 0 ${cx + r * .6} ${cy + r * .75}`, fill: "none", stroke: C.cerejaEsc, "stroke-width": 8, "stroke-linecap": "round" }, g);
      el("ellipse", { cx: cx - r * .35, cy: cy - r * .3, rx: r * .18, ry: r * .12, fill: "#fff", "fill-opacity": .8, transform: `rotate(-30 ${cx - r * .35} ${cy - r * .3})` }, g); });
    el("path", { d: "M-34 -8C-30 -50 -2 -70 20 -82M38 10C38 -30 26 -60 20 -82", fill: "none", stroke: "#5A8A2A", "stroke-width": 5, "stroke-linecap": "round" }, g);
    el("path", { d: "M20 -82C40 -100 70 -92 78 -80C60 -66 34 -68 20 -82Z", fill: C.verde }, g);
    return g;
  }
  function uva(pai, { x = 0, y = 0, s = 1 } = {}) {
    const g = grupo(pai, x, y, s);
    const pts = [[-40, -30], [0, -34], [40, -30], [-60, 6], [-20, 6], [20, 6], [60, 6], [-40, 42], [0, 46], [40, 42], [0, 82]];
    pts.forEach(([cx, cy]) => el("circle", { cx, cy, r: 24, transform: "translate(12 10)", ...SOMBRA }, g));
    pts.forEach(([cx, cy], i) => { el("circle", { cx, cy, r: 24, fill: i % 3 ? C.roxo : "#7B2483" }, g); el("ellipse", { cx: cx - 8, cy: cy - 9, rx: 6, ry: 4, fill: "#fff", "fill-opacity": .6 }, g); });
    el("path", { d: "M0 -34V-70", stroke: "#5A8A2A", "stroke-width": 6, "stroke-linecap": "round" }, g);
    return g;
  }

  const P3 = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }];
  const FICHAS = [
    ["forma", "Forma-assinatura", "forma", "objeto", "abrigar um objeto, um número ou um título; é a assinatura visual", "a tela já tem outra forma em destaque total; nunca use duas formas gigantes ao mesmo tempo", "fundo", { w: 240, h: 240 }, [{ nome: "cor", padrao: "cereja" }, { nome: "sombra", padrao: null }, ...P3], null],
    ["pote", "Pote de vitamina", "cozinha", "acao", "mostrar algo enchendo: vitamina, progresso, quantidade; é o gráfico-assinatura", "o assunto não é líquido nem enchimento", "meio", { w: 200, h: 300 }, P3, { param: "p", duracao_s: 2.4, descricao: "o nível sobe, a onda se mexe e três frutas caem fazendo marola" }],
    ["marmita", "Marmita", "cozinha", "acao", "revelar o prato pronto: a tampa levanta, desliza e some; sai vapor", "o assunto não é comida pronta", "meio", { w: 320, h: 220 }, [...P3, { nome: "cor", padrao: "cereja" }], { param: "p", duracao_s: 2.0, descricao: "a tampa levanta e cresce, desliza girando e some; a comida pula e o vapor sobe" }],
    ["laranja", "Laranja", "ingrediente", "objeto", "enfeite de fruta; vitamina C, frescor", "fundo laranja ou cereja sem forma contrastante", "meio", { w: 150, h: 150 }, P3, null],
    ["abacate", "Abacate", "ingrediente", "objeto", "enfeite de fruta; gordura boa, cremosidade", "fundo verde sem forma contrastante", "meio", { w: 130, h: 180 }, P3, null],
    ["cereja", "Cereja", "ingrediente", "objeto", "enfeite de fruta; doce, sobremesa, a cor da marca", "fundo cereja ou rosa sem forma contrastante", "meio", { w: 180, h: 200 }, P3, null],
    ["uva", "Uva", "ingrediente", "objeto", "enfeite de fruta; roxo, sobremesa, suco", "fundo roxo sem forma contrastante", "meio", { w: 180, h: 220 }, P3, null],
  ];
  FICHAS.forEach(([id, nome, familia, tipo, serve_para, nao_usar_quando, camada, caixa, parametros, movimento]) =>
    reg({ id, nome, familia, tipo, serve_para, nao_usar_quando, camada, caixa, parametros, movimento }));

  window.EL = { C, el, clamp, ease, back, grupo, SOMBRA, rnd, reg, catalogo, forma, pote, marmita, laranja, abacate, cereja, uva };
})();
