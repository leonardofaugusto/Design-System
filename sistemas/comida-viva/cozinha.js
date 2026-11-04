// Família COZINHA: talheres, utensílios, ingredientes e cinco ações (serve, corta, mexe, tempera, monta).
// Mesmo estilo do resto: formas chapadas com luz e sombra dura, sem contorno preto, sem blur.
// Origem das coordenadas: o CENTRO de cada peça. Ações recebem p (0..1) e t (segundos, para loops).
(() => {
  const { C, el, clamp, ease, back, SOMBRA, rnd, reg, catalogo } = EL;
  const MET = { base: "#DDE2EC", som: "#B3BBCB" };
  const MAD = { base: "#E0A964", esc: "#BC8247", claro: "#F2C98F" };
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const nova = (pai, x, y, s, rot) => { const g = el("g", {}, pai); mover(g, x, y, s, rot); return g; };
  let n = 0;
  const grad = (g, stops, { x1 = 0, y1 = 0, x2 = 1, y2 = 1, radial = false } = {}) => {
    const id = "c" + (n++); const d = el("defs", {}, g);
    const gr = radial ? el("radialGradient", { id, cx: .35, cy: .3, r: .8 }, d) : el("linearGradient", { id, x1, y1, x2, y2 }, d);
    stops.forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, gr)); return `url(#${id})`;
  };
  const P3 = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];
  const objeto = (id, nome, familia, serve_para, nao_usar_quando, caixa, fn) => { reg({ id, nome, familia, tipo: "objeto", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: P3, movimento: null }); return fn; };
  const acao = (id, nome, serve_para, nao_usar_quando, caixa, duracao_s, descricao, fn) => { reg({ id, nome, familia: "cozinha", tipo: "acao", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: P3, movimento: { param: "p", duracao_s, descricao, usa_t: true } }); return fn; };

  // ============ TALHERES E UTENSÍLIOS ============
  const talher = (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true }, silh, brilhos, cor = MET.base) => {
    const g = nova(pai, x, y, s, rot);
    if (sombra) { const sh = el("g", { transform: "translate(14 12)" }, g); silh.forEach(([t, a]) => el(t, { ...a, ...SOMBRA }, sh)); }
    silh.forEach(([t, a]) => el(t, { ...a, fill: cor }, g));
    brilhos.forEach((d) => el("path", { d, fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", "stroke-opacity": .85 }, g));
    return g;
  };
  const GARFO = [["rect", { x: -36, y: -160, width: 12, height: 90, rx: 6 }], ["rect", { x: -16, y: -160, width: 12, height: 90, rx: 6 }], ["rect", { x: 4, y: -160, width: 12, height: 90, rx: 6 }], ["rect", { x: 24, y: -160, width: 12, height: 90, rx: 6 }],
    ["path", { d: "M-36 -96H36V-84Q36 -46 8 -34V-22H-8V-34Q-36 -46 -36 -84Z" }], ["path", { d: "M-9 -40H9L13 128Q13 156 0 156Q-13 156 -13 128Z" }]];
  const garfo = objeto("garfo", "Garfo", "talher", "talher, refeição, 'à mesa'; combine com faca e colher", "o assunto não é comer; evite em cenas só de gráfico", { w: 72, h: 316 },
    (pai, o = {}) => talher(pai, o, GARFO, ["M-31 -150V-80", "M-4 -34L-6 120"]));
  const FACA = [["path", { d: "M-14 -160C24 -156 34 -110 34 -50V-22H-14Z" }], ["path", { d: "M-14 -24H34V128Q34 156 10 156Q-14 156 -14 128Z" }]];
  const faca = objeto("faca", "Faca", "talher", "cortar, preparar; é a ferramenta da ação 'corta'", "o assunto não envolve preparo", { w: 48, h: 316 },
    (pai, o = {}) => talher(pai, o, FACA, ["M-8 -150C10 -140 24 -110 24 -60", "M-6 0V120"]));
  const COLHER = [["ellipse", { cx: 0, cy: -112, rx: 34, ry: 48 }], ["path", { d: "M-8 -68H8L12 128Q12 156 0 156Q-12 156 -12 128Z" }]];
  const colher = objeto("colher", "Colher", "talher", "sobremesa, sopa, 'provar'", "o assunto não é comer", { w: 68, h: 316 },
    (pai, o = {}) => talher(pai, o, COLHER, ["M-20 -138Q-26 -112 -18 -90", "M-3 -60L-4 120"]));
  const colherPau = objeto("colher-de-pau", "Colher de pau", "utensilio", "cozinhar, 'feito em casa'; é a ferramenta da ação 'mexe'", "o assunto é industrial ou rápido demais", { w: 60, h: 316 },
    (pai, o = {}) => { const g = talher(pai, o, [["ellipse", { cx: 0, cy: -110, rx: 30, ry: 44 }], ["path", { d: "M-9 -70H9L12 130Q12 156 0 156Q-12 156 -12 130Z" }]], ["M-4 0V120"], MAD.base);
      el("ellipse", { cx: 0, cy: -106, rx: 20, ry: 32, fill: MAD.esc }, g); el("ellipse", { cx: -6, cy: -114, rx: 6, ry: 12, fill: MAD.claro, "fill-opacity": .8 }, g); return g; });
  const concha = objeto("concha", "Concha", "utensilio", "servir sopa e caldo; é a ferramenta da ação 'serve'", "o assunto não é servir", { w: 260, h: 110 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      const silh = [["path", { d: "M-50 0A50 50 0 0 0 50 0Z" }], ["path", { d: "M40 -10L214 -66L220 -46L44 10Z" }]];
      if (sombra) { const sh = el("g", { transform: "translate(14 12)" }, g); silh.forEach(([t, a]) => el(t, { ...a, ...SOMBRA }, sh)); }
      silh.forEach(([t, a]) => el(t, { ...a, fill: MET.base }, g));
      el("path", { d: "M-40 10A42 42 0 0 0 -6 34", fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", "stroke-opacity": .85 }, g); return g; });
  const tabua = objeto("tabua", "Tábua de corte", "utensilio", "base para cortar; sempre sob o ingrediente", "o assunto não é preparo", { w: 352, h: 42 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("rect", { x: -176, y: 2, width: 352, height: 42, rx: 16, transform: "translate(14 12)", ...SOMBRA }, g);
      el("rect", { x: -176, y: 0, width: 352, height: 42, rx: 16, fill: MAD.base }, g); el("rect", { x: -176, y: 0, width: 352, height: 12, rx: 6, fill: MAD.claro }, g);
      ["M-140 26H-40", "M-10 26H120", "M-100 34H0"].forEach((d) => el("path", { d, stroke: MAD.esc, "stroke-width": 3, "stroke-linecap": "round", "stroke-opacity": .6 }, g)); return g; });

  // vistos de cima: prato e panela
  const prato = objeto("prato", "Prato", "louca", "base para servir; visto de cima", "o assunto é líquido que não precisa de base", { w: 260, h: 260 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("circle", { r: 130, transform: "translate(16 14)", ...SOMBRA }, g);
      el("circle", { r: 130, fill: "#fff" }, g); el("circle", { r: 106, fill: "#EEE8F3" }, g); el("circle", { r: 98, fill: "#fff" }, g);
      el("path", { d: "M-106 -40A114 114 0 0 1 -40 -106", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round" }, g); return g; });
  const panela = objeto("panela", "Panela", "louca", "cozinhar; vista de cima, com alças dos lados", "o assunto não é cozinhar", { w: 360, h: 260 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true, cor = C.verde, corEsc = C.verdeEsc, sopa = "#E84A1F" } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) { el("circle", { r: 130, transform: "translate(16 14)", ...SOMBRA }, g); }
      [-1, 1].forEach((d) => el("rect", { x: d < 0 ? -186 : 118, y: -14, width: 68, height: 28, rx: 14, fill: corEsc }, g));
      el("circle", { r: 130, fill: cor }, g); el("circle", { r: 112, fill: corEsc }, g); el("circle", { r: 100, fill: sopa }, g);
      el("path", { d: "M-112 -34A118 118 0 0 1 -34 -112", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", "stroke-opacity": .6 }, g); return g; });
  const tigela = objeto("tigela", "Tigela", "louca", "montar e misturar; vista em 3/4 com a borda aberta", "o assunto é prato raso", { w: 300, h: 200 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, cor = C.roxo, corEsc = C.roxoEsc, sombra = true, dentro = null } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("path", { d: "M-150 -40A150 42 0 0 0 150 -40Q150 90 0 100Q-150 90 -150 -40Z", transform: "translate(18 14)", ...SOMBRA }, g);
      el("ellipse", { cx: 0, cy: -40, rx: 150, ry: 42, fill: corEsc }, g);
      const miolo = el("g", {}, g); if (dentro) dentro(miolo);
      el("path", { d: "M-150 -40A150 42 0 0 0 150 -40Q150 90 0 100Q-150 90 -150 -40Z", fill: cor }, g);
      el("path", { d: "M-150 -40A150 42 0 0 0 150 -40", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-opacity": .35 }, g);
      el("path", { d: "M-120 20Q-110 64 -60 80", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round", "stroke-opacity": .5 }, g); return g; });
  const azeite = objeto("garrafa-azeite", "Garrafa de azeite", "utensilio", "temperar; a ação 'tempera' inclina e faz o fio escorrer", "o assunto não é tempero", { w: 68, h: 240 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      const corpo = "M-34 20Q-34 0 -16 -14L-10 -44H10L16 -14Q34 0 34 20V136Q34 152 18 152H-18Q-34 152 -34 136Z";
      if (sombra) el("path", { d: corpo, transform: "translate(14 12)", ...SOMBRA }, g);
      el("path", { d: corpo, fill: C.verdeEsc }, g); el("rect", { x: -12, y: -66, width: 24, height: 26, rx: 6, fill: C.amarelo }, g);
      el("rect", { x: -26, y: 40, width: 52, height: 70, rx: 12, fill: C.creme }, g); el("circle", { cx: 0, cy: 75, r: 14, fill: C.amarelo }, g);
      el("path", { d: "M-26 8V120", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", "stroke-opacity": .35, transform: "translate(-4 0)" }, g); return g; });

  // ============ INGREDIENTES ============
  const tomate = objeto("tomate", "Tomate", "ingrediente", "ingrediente: salada, molho, frescor", "o assunto é doce", { w: 100, h: 100 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("circle", { r: 46, transform: "translate(10 9)", ...SOMBRA }, g);
      el("circle", { r: 46, fill: grad(g, [[0, "#FF4B6E"], [.55, C.cereja], [1, C.cerejaEsc]], { radial: true }) }, g);
      el("ellipse", { cx: -18, cy: -18, rx: 9, ry: 6, fill: "#fff", "fill-opacity": .7, transform: "rotate(-35 -18 -18)" }, g);
      const c = el("g", { transform: "translate(0 -40)" }, g); [0, 72, 144, 216, 288].forEach((a) => el("ellipse", { cx: 0, cy: -7, rx: 5, ry: 12, fill: C.verde, transform: `rotate(${a})` }, c)); return g; });
  const cenoura = objeto("cenoura", "Cenoura", "ingrediente", "ingrediente: legume, vitamina A, colheita", "o assunto é doce ou fruta", { w: 70, h: 150 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      const d = "M-18 -56Q0 -66 18 -56L24 -6Q10 56 0 76Q-10 56 -24 -6Z";
      if (sombra) el("path", { d, transform: "translate(10 9)", ...SOMBRA }, g);
      el("path", { d, fill: grad(g, [[0, "#FF8A3D"], [1, C.laranjaEsc]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, g);
      ["M-12 -30H-2", "M4 -8H14", "M-8 14H2", "M0 36H8"].forEach((p) => el("path", { d: p, stroke: C.laranjaEsc, "stroke-width": 3, "stroke-linecap": "round" }, g));
      [[-12, -68, -20], [0, -74, 0], [12, -68, 20]].forEach(([cx, cy, r]) => el("ellipse", { cx, cy, rx: 6, ry: 18, fill: C.verde, transform: `rotate(${r} ${cx} ${cy + 12})` }, g)); return g; });
  const brocolis = objeto("brocolis", "Brócolis", "ingrediente", "ingrediente: verde, saudável, 'come bem'", "o assunto é doce", { w: 110, h: 110 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      const flor = [[-26, -14, 24], [4, -30, 28], [30, -8, 24], [-6, -2, 26], [-30, 10, 18], [32, 14, 18]];
      if (sombra) flor.forEach(([cx, cy, r]) => el("circle", { cx, cy, r, transform: "translate(10 9)", ...SOMBRA }, g));
      el("path", { d: "M-12 14H12L16 56Q0 64 -16 56Z", fill: "#A8D86B" }, g);
      flor.forEach(([cx, cy, r], i) => { el("circle", { cx, cy, r, fill: i % 2 ? C.verde : C.verdeEsc }, g); el("circle", { cx: cx - r * .3, cy: cy - r * .3, r: r * .32, fill: C.menta }, g); }); return g; });
  const banana = objeto("banana", "Banana", "ingrediente", "ingrediente: fruta, energia, café da manhã", "fundo amarelo sem forma contrastante", { w: 140, h: 90 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      const d = "M-62 -26C-40 40 20 56 64 14L72 22C30 76 -44 70 -70 -16Z";
      if (sombra) el("path", { d, transform: "translate(10 9)", ...SOMBRA }, g);
      el("path", { d, fill: C.amarelo }, g); el("path", { d: "M-52 -6C-30 44 20 54 58 22", fill: "none", stroke: "#C9B800", "stroke-width": 5, "stroke-linecap": "round" }, g);
      el("circle", { cx: -66, cy: -22, r: 6, fill: "#7A4A1E" }, g); el("circle", { cx: 70, cy: 18, r: 5, fill: "#7A4A1E" }, g); return g; });
  const ovo = objeto("ovo", "Ovo", "ingrediente", "ingrediente: proteína, café da manhã", "fundo creme sem forma contrastante", { w: 70, h: 90 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("ellipse", { rx: 34, ry: 44, transform: "translate(10 9)", ...SOMBRA }, g);
      el("ellipse", { rx: 34, ry: 44, fill: grad(g, [[0, "#FFFDF5"], [.6, C.creme], [1, C.areia]], { radial: true }) }, g);
      el("ellipse", { cx: -12, cy: -16, rx: 7, ry: 12, fill: "#fff", "fill-opacity": .8, transform: "rotate(18 -12 -16)" }, g); return g; });
  const limao = objeto("limao", "Limão", "ingrediente", "ingrediente: azedo, tempero, refresco", "fundo amarelo sem forma contrastante", { w: 120, h: 90 },
    (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}) => { const g = nova(pai, x, y, s, rot);
      if (sombra) el("ellipse", { rx: 50, ry: 38, transform: "translate(10 9)", ...SOMBRA }, g);
      el("circle", { cx: -52, cy: 0, r: 8, fill: "#B8D436" }, g); el("circle", { cx: 52, cy: 0, r: 8, fill: "#B8D436" }, g);
      el("ellipse", { rx: 50, ry: 38, fill: grad(g, [[0, "#FFF08A"], [.5, "#E5D900"], [1, "#B8A800"]], { radial: true }) }, g);
      el("ellipse", { cx: -16, cy: -14, rx: 12, ry: 6, fill: "#fff", "fill-opacity": .65, transform: "rotate(-20 -16 -14)" }, g); return g; });

  // ============ AÇÕES ============
  // SERVE: a concha inclina, o fio de sopa cai no prato e o disco de sopa cresce
  const servir = acao("servir", "Serve a sopa", "mostrar o prato sendo servido: sopa, caldo, comida quente", "o assunto é comida fria ou seca", { w: 300, h: 300 }, 2.4,
    "a concha desce e inclina, um fio de sopa cai e o disco de sopa se espalha pelo prato; no fim, sai vapor",
    (pai, { x = 0, y = 0, s = 1 } = {}) => {
      const g = nova(pai, x, y, s); prato(g, {});
      const disco = el("circle", { r: 0, fill: "#F7931E" }, g); const brilho = el("ellipse", { rx: 0, ry: 0, fill: "#fff", "fill-opacity": .3 }, g);
      const nata = el("path", { d: "M-24 0a24 24 0 1 1 24 24a13 13 0 1 1 -13 -13", fill: "none", stroke: C.creme, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }, g);
      const fio = el("path", { fill: "none", stroke: "#F7931E", "stroke-width": 0, "stroke-linecap": "round" }, g);
      const vapor = [0, 1, 2].map(() => el("path", { fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round", "stroke-opacity": 0 }, g));
      const cg = nova(g, 0, 0, 1); concha(cg, {}); const liq = el("path", { d: "M-44 0A44 44 0 0 0 44 0Z", fill: "#F7931E" }, cg);
      return { g, set(p, t = 0) {
        const tilt = ease(clamp(p / .28)) * (1 - ease(clamp((p - .9) / .1)));
        const ang = -54 * tilt, cx0 = lerp(130, 66, tilt), cy0 = lerp(-170, -84, tilt);
        cg.setAttribute("transform", `translate(${cx0} ${cy0}) rotate(${ang})`);
        const rad = ang * Math.PI / 180, tx = cx0 - 50 * Math.cos(rad), ty = cy0 - 50 * Math.sin(rad);
        const pf = clamp((p - .28) / .08) * (1 - clamp((p - .84) / .08));
        fio.setAttribute("d", `M${tx} ${ty}C${tx - 4} ${ty + 50} 6 -30 0 4`); fio.setAttribute("stroke-width", 14 * pf);
        liq.setAttribute("transform", `scale(1 ${Math.max(.05, 1 - .95 * ease(clamp((p - .28) / .55)))})`);
        const R = 90 * ease(clamp((p - .32) / .55)); disco.setAttribute("r", R);
        brilho.setAttribute("cx", -R * .3); brilho.setAttribute("cy", -R * .35); brilho.setAttribute("rx", R * .35); brilho.setAttribute("ry", R * .14);
        nata.setAttribute("opacity", ease(clamp((p - .8) / .15))); nata.setAttribute("transform", `scale(${R / 90})`);
        const vis = ease(clamp((p - .85) / .12));
        vapor.forEach((v, i) => { const f = ((t * .8 + i * .33) % 1), xx = -40 + i * 40;
          v.setAttribute("d", `M${xx} ${-20 - f * 70}c-10 -12 10 -22 0 -34s10 -22 0 -34`); v.setAttribute("stroke-opacity", vis * (1 - f) * .7); });
      } }; });

  // CORTA: a faca desce quatro vezes e o tomate vira cinco fatias que se afastam
  const cortar = acao("cortar", "Corta o tomate", "mostrar preparo: corte, 'fresquinho', ingredientes", "o assunto é comida pronta sem preparo", { w: 352, h: 190 }, 2.6,
    "a faca desce e sobe quatro vezes, da esquerda para a direita; a cada corte as fatias se afastam e giram um pouco",
    (pai, { x = 0, y = 0, s = 1 } = {}) => {
      const g = nova(pai, x, y, s); tabua(g, {});
      const bordas = [-62, -37, -12, 12, 37, 62], fatias = [];
      const defs = el("defs", {}, g);
      for (let i = 0; i < 5; i++) {
        const id = "fa" + (n++); el("rect", { x: bordas[i], y: -140, width: bordas[i + 1] - bordas[i], height: 140 }, el("clipPath", { id }, defs));
        const f = el("g", {}, g); const c = el("g", { "clip-path": `url(#${id})` }, f); tomate(c, { x: 0, y: -62, s: 1.35, sombra: i === 0 || i === 4 });
        el("rect", { x: bordas[i], y: -124, width: 3, height: 124, fill: C.rosa, "fill-opacity": .6 }, f); fatias.push(f);
      }
      const cx = [-37, -12, 12, 37], kg = nova(g, 0, 0, 1); faca(kg, {});
      return { g, set(p) {
        const feito = cx.map((_, k) => ease(clamp((p - (k * .22 + .1)) / .12)));
        const total = feito.reduce((a, b) => a + b, 0);
        let pos = 0;
        fatias.forEach((f, i) => { if (i > 0) pos += 7 * feito[i - 1]; const dx = pos - total * 7 / 2, cxl = (bordas[i] + bordas[i + 1]) / 2;
          f.setAttribute("transform", `translate(${dx} 0) rotate(${(i - 2) * 2.2 * (total / 4)} ${cxl} 0)`); });
        let k = -1; cx.forEach((_, j) => { if (p >= j * .22 + .02 && p < j * .22 + .2) k = j; });
        let kx = cx[Math.max(0, Math.min(3, Math.floor((p - .02) / .22)))], ky = -250;
        if (k >= 0) { const u = (p - (k * .22 + .02)) / .18, baixo = -124; kx = cx[k]; ky = u < .4 ? lerp(-250, baixo, ease(u / .4)) : lerp(baixo, -250, ease((u - .4) / .6)); }
        mover(kg, kx + 8, ky, .75, 180);
      } }; });

  // MEXE: a colher de pau gira na panela, a sopa borbulha e solta vapor (loop; p = calor)
  const mexer = acao("mexer", "Mexe a panela", "mostrar cozinha em andamento: 'feito na hora', sopa, molho", "o assunto é comida fria", { w: 360, h: 300 }, 3.0,
    "a colher gira dentro da sopa, a espiral gira junto e bolhas estouram; p controla o calor (vapor e bolhas); loop em t",
    (pai, { x = 0, y = 0, s = 1 } = {}) => {
      const g = nova(pai, x, y, s); panela(g, {});
      const esp = el("g", {}, g); [0, 1, 2].forEach((i) => el("path", { d: `M0 0a${20 + i * 22} ${20 + i * 22} 0 0 1 ${40 + i * 44} 0`, fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round", "stroke-opacity": .28, transform: `rotate(${i * 90})` }, esp));
      const bol = [...Array(7)].map(() => el("circle", { fill: "#FFB36B" }, g)); const vap = [0, 1, 2].map(() => el("path", { fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round", "stroke-opacity": 0 }, g));
      const cabo = el("path", { fill: "none", stroke: MAD.base, "stroke-width": 24, "stroke-linecap": "round" }, g);
      const concha_ = el("ellipse", { rx: 34, ry: 22, fill: MAD.base }, g); const fundo_ = el("ellipse", { rx: 22, ry: 13, fill: MAD.esc }, g);
      return { g, set(p, t = 0) {
        const a = t * 2.6, px = 54 * Math.cos(a), py = 54 * Math.sin(a), ex = 190, ey = -190;
        const dir = Math.atan2(ey - py, ex - px) * 180 / Math.PI;
        cabo.setAttribute("d", `M${px} ${py}L${ex} ${ey}`);
        [concha_, fundo_].forEach((e) => e.setAttribute("transform", `translate(${px} ${py}) rotate(${dir})`));
        esp.setAttribute("transform", `rotate(${t * 80})`);
        bol.forEach((b, i) => { const f = ((t * .9 + i * .29) % 1), ang = rnd(i + 5) * 6.28, r = 20 + rnd(i + 9) * 64;
          b.setAttribute("cx", r * Math.cos(ang)); b.setAttribute("cy", r * Math.sin(ang)); b.setAttribute("r", 9 * Math.sin(Math.PI * f) * (.3 + p)); b.setAttribute("fill-opacity", .9); });
        vap.forEach((v, i) => { const f = ((t * .7 + i * .33) % 1), xx = -50 + i * 50; v.setAttribute("d", `M${xx} ${-20 - f * 80}c-12 -14 12 -26 0 -40s12 -26 0 -40`); v.setAttribute("stroke-opacity", p * (1 - f) * .75); });
      } }; });

  // TEMPERA: a garrafa inclina, o fio de azeite cai nas fatias e as ervas chovem
  const temperar = acao("temperar", "Tempera com azeite", "mostrar tempero: azeite, ervas, finalização", "o assunto não é comida", { w: 320, h: 320 }, 2.6,
    "a garrafa inclina, um fio de azeite escorre e forma uma poça brilhante; ervas caem depois e ficam sobre o prato",
    (pai, { x = 0, y = 0, s = 1 } = {}) => {
      const g = nova(pai, x, y, s); prato(g, {});
      [[-52, -30], [40, -50], [60, 30], [-30, 52], [4, 0]].forEach(([cx, cy], i) => { const f = nova(g, cx, cy, 1, i * 30);
        el("circle", { r: 38, fill: C.cereja }, f); el("circle", { r: 31, fill: C.rosa, "fill-opacity": .55 }, f); [0, 90, 180, 270].forEach((a) => el("ellipse", { cx: 0, cy: -16, rx: 4, ry: 7, fill: C.creme, transform: `rotate(${a})` }, f)); });
      const poca = el("ellipse", { cx: 8, cy: 6, rx: 0, ry: 0, fill: "#EFC21A", "fill-opacity": .8 }, g); const pb = el("ellipse", { rx: 0, ry: 0, fill: "#fff", "fill-opacity": .55 }, g);
      const fio = el("path", { fill: "none", stroke: "#EFC21A", "stroke-width": 0, "stroke-linecap": "round" }, g);
      const ervas = [...Array(14)].map((_, i) => el("ellipse", { rx: 9, ry: 4, fill: i % 2 ? C.verde : C.menta }, g));
      const bg = nova(g, 0, 0, 1); azeite(bg, {});
      return { g, set(p) {
        const tilt = ease(clamp(p / .25)) * (1 - ease(clamp((p - .86) / .14)));
        const ang = -122 * tilt, bx = lerp(170, 150, tilt), by = lerp(-140, -150, tilt);
        bg.setAttribute("transform", `translate(${bx} ${by}) rotate(${ang})`);
        const rad = ang * Math.PI / 180, tx = bx + 66 * Math.sin(rad), ty = by - 66 * Math.cos(rad);
        const pf = clamp((p - .26) / .07) * (1 - clamp((p - .66) / .08));
        fio.setAttribute("d", `M${tx} ${ty}C${tx - 2} ${ty + 40} 10 -20 8 6`); fio.setAttribute("stroke-width", 7 * pf);
        const R = ease(clamp((p - .3) / .35)); poca.setAttribute("rx", 54 * R); poca.setAttribute("ry", 40 * R); pb.setAttribute("cx", -10 * R + 8); pb.setAttribute("cy", -14 * R + 6); pb.setAttribute("rx", 16 * R); pb.setAttribute("ry", 7 * R);
        ervas.forEach((e, i) => { const t0 = .45 + i * .03, u = clamp((p - t0) / .22), a = rnd(i + 3) * 6.28, r = 20 + rnd(i + 8) * 80;
          const fx = r * Math.cos(a), fy = r * Math.sin(a); e.setAttribute("transform", `translate(${fx} ${lerp(fy - 200, fy, u * u)}) rotate(${i * 40 + u * 240})`); e.setAttribute("opacity", u > 0 ? 1 : 0); });
      } }; });

  // MONTA: os ingredientes voam em arco para dentro da tigela, um de cada vez
  const montar = acao("montar", "Monta a tigela", "mostrar combinação: bowl, 'monte o seu', ingredientes juntos", "o assunto é um ingrediente só", { w: 300, h: 200 }, 2.8,
    "quatro ingredientes entram em arco, um após o outro, e a tigela dá uma achatadinha a cada pouso",
    (pai, { x = 0, y = 0, s = 1 } = {}) => {
      const g = nova(pai, x, y, s); const itens = [];
      const pose = [[-72, -54, 0], [-8, -74, 0], [50, -44, 70], [92, -58, 0]];
      const fábricas = [tomate, brocolis, cenoura, ovo], de = [[-420, -300], [420, -320], [-380, -380], [400, -260]];
      const tg = tigela(g, { dentro: (miolo) => fábricas.forEach((f, i) => { const o = nova(miolo, 0, 0, .9); f(o, { sombra: false }); itens.push({ o, pose: pose[i], de: de[i] }); }) });
      return { g, set(p) {
        let sq = 0;
        itens.forEach((it, i) => { const t0 = i * .2, u = clamp((p - t0) / .3), e = ease(u), ax = lerp(it.de[0], it.pose[0], e), ay = lerp(it.de[1], it.pose[1], e) - 190 * 4 * e * (1 - e) * (u < 1 ? 1 : 0);
          const quica = u >= 1 ? -8 * Math.max(0, Math.sin(Math.PI * clamp((p - t0 - .3) / .15))) : 0;
          mover(it.o, ax, ay + quica, .9, u < 1 ? u * 340 : it.pose[2]); if (u >= 1 && p - t0 - .3 < .1) sq = Math.max(sq, Math.sin(Math.PI * (p - t0 - .3) / .1)); });
        tg.setAttribute("transform", `translate(0 ${sq * 4}) scale(${1 + sq * .03} ${1 - sq * .05})`);
      } }; });

  Object.assign(EL, { garfo, faca, colher, colherPau, concha, tabua, prato, panela, tigela, azeite, tomate, cenoura, brocolis, banana, ovo, limao, servir, cortar, mexer, temperar, montar });
})();
