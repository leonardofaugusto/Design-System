// Família MÃOS E PESSOAS: mão que aponta, joinha, aceno, avatar (6 penteados), grupo e chef.
// Formas chapadas e sem rosto, no mesmo estilo do resto: luz e sombra dura, sem contorno preto, sem blur.
// As cores de pele são PARÂMETRO e vêm da paleta (areia, rosa, laranja, lilás, menta...), nunca de um tom 'realista':
// o reel escolhe a cor, e a mesma peça serve a qualquer pessoa. Origem das coordenadas: o CENTRO de cada peça.
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const nova = (pai, x, y, s, rot) => { const g = el("g", {}, pai); mover(g, x, y, s, rot); return g; };
  const mix = (a, b, u) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, "0")).join(""); };
  const P3 = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];
  const A = (flat) => ({
    flat,
    f: (c) => ({ fill: flat ? C.tinta : c }),
    s: (c, w) => ({ fill: "none", stroke: flat ? C.tinta : c, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }),
  });
  const montar = (pai, o = {}, build) => {
    const { x = 0, y = 0, s = 1, rot = 0, sombra = true } = o;
    const g = nova(pai, x, y, s, rot);
    const sh = sombra ? el("g", { transform: "translate(14 12)", opacity: .24 }, g) : null;
    const ss = sh ? build(sh, A(true), o) : null, ms = build(g, A(false), o);
    return { g, set: (p = 0, t = 0) => { if (ss) ss(p, t); ms(p, t); } };
  };
  const PELE = { nome: "pele", padrao: C.areia }, MANGA = { nome: "manga", padrao: C.roxo };
  const objeto = (id, nome, tipo, serve_para, nao_usar_quando, caixa, extras, build) => {
    reg({ id, nome, familia: "maos", tipo, serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: null });
    return (pai, o = {}) => { const m = montar(pai, o, build); m.set(0, 0); return m.g; };
  };
  const acao = (id, nome, serve_para, nao_usar_quando, caixa, duracao_s, descricao, extras, build) => {
    reg({ id, nome, familia: "maos", tipo: "acao", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };
  const pop = (p, u0, u1) => Math.max(0, back(clamp((p - u0) / (u1 - u0))));

  // ---------- partes de mão ----------
  const manga = (g, a, o) => { el("rect", { x: -58, y: 112, width: 116, height: 58, rx: 14, ...a.f(o.manga || C.roxo) }, g); if (!a.flat) el("path", { d: "M-44 124V158", ...a.s("#fff", 6), "stroke-opacity": .3 }, g); };
  const vinco = (g, a, pele, d) => { if (!a.flat) g.appendChild(Object.assign(el("path", { d, ...a.s(mix(pele, C.tinta, .22), 5), "stroke-opacity": .8 }), {})); };

  // ============ ACENO: a palma aberta ============
  const aceno = acao("aceno", "Aceno", "cumprimentar, abrir o reel ('oi'), despedir; a palma aberta balança de um lado ao outro", "o assunto é sério ou há mais de uma pessoa na cena (use grupo)", { w: 190, h: 330 }, 1.8,
    "a mão aparece e balança três vezes, pivotando no pulso", [PELE, MANGA], (g, a, o) => {
      const pele = o.pele || C.areia, todo = el("g", {}, g), mao = el("g", {}, todo);
      [[-42, -112], [-14, -144], [14, -134], [42, -100]].forEach(([x, y]) => el("rect", { x: x - 14, y, width: 28, height: 150, rx: 14, ...a.f(pele) }, mao));
      el("rect", { x: -56, y: -14, width: 112, height: 134, rx: 46, ...a.f(pele) }, mao);
      const po = el("g", {}, mao); mover(po, -50, 66, 1, -52); el("rect", { x: -16, y: -96, width: 32, height: 118, rx: 16, ...a.f(pele) }, po);
      if (!a.flat) { vinco(mao, a, pele, "M-30 70C-8 84 22 84 44 66"); vinco(mao, a, pele, "M-14 -80V-26M14 -72V-26M-40 -56V-26"); el("path", { d: "M-50 -2C-52 20 -50 40 -46 56", ...a.s("#fff", 7), "stroke-opacity": .45 }, mao); }
      manga(todo, a, o);
      return (p) => {
        const ba = Math.sin(p * Math.PI * 6) * 16 * clamp((p - .15) / .1) * (1 - clamp((p - .7) / .3));
        mao.setAttribute("transform", `rotate(${ba} 0 112)`);
        mover(todo, 0, 0, Math.max(.001, pop(p, 0, .2)));
      };
    });

  // ============ MÃO QUE APONTA: o toque ============
  const aponta = acao("mao_aponta", "Mão que aponta", "mostrar onde clicar ou tocar ('aqui'); o dedo desce, toca e solta uma onda", "o ponto já está óbvio, ou o assunto não é uma tela", { w: 190, h: 330 }, 1.8,
    "o dedo desce até a tela, toca, uma onda abre na ponta e a mão volta", [PELE, MANGA], (g, a, o) => {
      const pele = o.pele || C.areia, onda = a.flat ? null : el("circle", { cx: -28, cy: -128, r: 20, ...a.s(C.creme, 6), opacity: 0 }, g);
      const mao = el("g", {}, g);
      el("path", { d: "M-28 -10V-112", ...a.s(pele, 34) }, mao);
      el("rect", { x: -62, y: -28, width: 124, height: 140, rx: 44, ...a.f(pele) }, mao);
      el("path", { d: "M-60 56L-12 26", ...a.s(pele, 32) }, mao);
      if (!a.flat) { vinco(mao, a, pele, "M-4 8H48M-4 38H48M-4 68H44"); vinco(mao, a, pele, "M-62 52L-30 34"); el("path", { d: "M-42 -100V-40", ...a.s("#fff", 6), "stroke-opacity": .5 }, mao); }
      manga(g, a, o);
      return (p) => {
        const d = Math.sin(Math.PI * clamp((p - .3) / .3)), tap = Math.sin(Math.PI * clamp((p - .3) / .3)) > .85;
        mover(mao, 0, -26 * d + lerp(40, 0, ease(clamp(p / .2))), 1);
        if (onda) { const q = clamp((p - .5) / .45); onda.setAttribute("r", lerp(20, 64, ease(q))); onda.setAttribute("opacity", q > 0 && q < 1 ? .85 * (1 - q) : 0); }
      };
    });

  // ============ JOINHA ============
  const joinha = acao("joinha", "Joinha", "aprovar, 'deu certo', 'recomendo'; o polegar sobe com um quique e três riscos de brilho", "o assunto é negativo ou delicado", { w: 190, h: 330 }, 1.6,
    "a mão quica para dentro da tela e três riscos de brilho abrem perto do polegar", [PELE, MANGA], (g, a, o) => {
      const pele = o.pele || C.areia, mao = el("g", {}, g);
      // polegar para cima e quatro dedos dobrados à direita (a leitura de 'joinha' vem dessa pilha de dedos)
      el("rect", { x: -76, y: -6, width: 152, height: 126, rx: 44, ...a.f(pele) }, mao);
      [0, 1, 2, 3].forEach((i) => el("rect", { x: -20, y: -2 + i * 30, width: 100, height: 32, rx: 16, ...a.f(pele) }, mao));
      el("path", { d: "M-46 8V-98", ...a.s(pele, 44) }, mao);
      if (!a.flat) { vinco(mao, a, pele, "M-4 28H70M-4 58H70M-4 88H66"); el("path", { d: "M-58 -86V-40", ...a.s("#fff", 7), "stroke-opacity": .5 }, mao); }
      manga(g, a, o);
      const ri = a.flat ? [] : [-40, 0, 40].map((an) => { const r = el("rect", { x: -4, y: -20, width: 8, height: 28, rx: 4, ...a.f(C.amarelo) }, g); return { r, an }; });
      return (p) => {
        mover(mao, 0, 0, pop(p, 0, .3), (1 - clamp(p / .3)) * -12);
        ri.forEach(({ r, an }) => { const q = clamp((p - .35) / .45), d = lerp(40, 74, ease(q)), t0 = (an - 20) * Math.PI / 180; mover(r, -46 + Math.sin(an * Math.PI / 180) * d, -128 - Math.cos(an * Math.PI / 180) * d, 1, an); r.setAttribute("opacity", q > 0 && q < 1 ? 1 - q : 0); });
      };
    });

  // ============ AVATAR: pessoa sem rosto, 6 penteados ============
  const HAIR = ["curto", "longo", "coque", "cacheado", "careca", "lenco"];
  const bust = (g, a, o) => {
    const pele = o.pele || C.areia, roupa = o.roupa || C.roxo, cab = o.cor_cabelo || C.tinta, h = o.cabelo || "curto";
    const topo = "M-60 -50C-64 -116 64 -116 60 -50C40 -76 -40 -76 -60 -50Z";
    if (h === "longo") el("path", { d: "M-68 -46C-74 -122 74 -122 68 -46L76 54H-76Z", ...a.f(cab) }, g);
    if (h === "cacheado") [[-60, -44], [-52, -84], [-24, -108], [24, -108], [52, -84], [60, -44], [0, -116]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 30, ...a.f(cab) }, g));
    el("path", { d: "M-112 150C-112 74 -62 44 0 44C62 44 112 74 112 150Z", ...a.f(roupa) }, g);
    el("rect", { x: -20, y: 6, width: 40, height: 46, rx: 14, ...a.f(a.flat ? C.tinta : mix(pele, C.tinta, .18)) }, g);
    el("circle", { cx: 0, cy: -44, r: 58, ...a.f(pele) }, g);
    if (!a.flat) { el("path", { d: "M-34 56C-20 82 20 82 34 56", ...a.s(mix(roupa, C.tinta, .25), 8) }, g); el("path", { d: "M-44 -62C-50 -50 -50 -34 -44 -22", ...a.s("#fff", 6), "stroke-opacity": .4 }, g); }
    if (h === "curto" || h === "coque" || h === "longo") el("path", { d: topo, ...a.f(cab) }, g);
    if (h === "coque") el("circle", { cx: 0, cy: -128, r: 28, ...a.f(cab) }, g);
    if (h === "cacheado") el("path", { d: "M-52 -66C-30 -84 30 -84 52 -66C34 -72 -34 -72 -52 -66Z", ...a.f(cab) }, g);
    if (h === "lenco") { el("path", { d: topo, ...a.f(C.amarelo) }, g); el("circle", { cx: 52, cy: -88, r: 22, ...a.f(C.amarelo) }, g); if (!a.flat) { el("path", { d: "M-56 -66C-20 -82 30 -80 56 -62", ...a.s(C.laranja, 8) }, g); } }
  };
  const avatar = objeto("avatar", "Avatar", "objeto", "representar uma pessoa sem rosto ('o cliente', 'você', 'o time'); 6 penteados (curto, longo, coque, cacheado, careca, lenço) e cores de pele e roupa à escolha", "a cena exige uma pessoa específica; sem rosto, não identifica ninguém", { w: 230, h: 290 },
    [{ nome: "cabelo", padrao: "curto | longo | coque | cacheado | careca | lenco" }, PELE, { nome: "roupa", padrao: C.roxo }, { nome: "cor_cabelo", padrao: C.tinta }], (g, a, o) => { bust(g, a, o); return () => {}; });

  // ============ GRUPO: o time ============
  const grupo = objeto("grupo", "Grupo", "objeto", "representar um time, uma comunidade ou 'todo mundo'; três avatares lado a lado, o do meio à frente", "o assunto é uma pessoa só (use avatar)", { w: 470, h: 290 },
    [{ nome: "peles", padrao: [C.areia, C.rosa, C.laranja] }, { nome: "roupas", padrao: [C.verde, C.cereja, C.roxo] }], (g, a, o) => {
      const pe = o.peles || [C.areia, C.rosa, C.laranja], ro = o.roupas || [C.verde, C.cereja, C.roxo];
      [[-150, 22, .84, "longo", 1], [150, 22, .84, "coque", 2], [0, 0, 1, "cacheado", 0]].forEach(([x, y, s, cabelo, i]) => bust(nova(g, x, y, s, 0), a, { cabelo, pele: pe[i % pe.length], roupa: ro[i % ro.length], cor_cabelo: i === 2 ? C.tinta : C.cerejaEsc }));
      return () => {};
    });

  // ============ CHEF: o toque de cozinheiro ============
  const chef = objeto("chef", "Chef", "objeto", "representar quem cozinha ou prepara ('o chef', 'a nutri', 'feito por gente'); avatar com toque branco e jaleco", "o assunto não é preparo de comida", { w: 230, h: 390 },
    [PELE], (g, a, o) => {
      const pele = o.pele || C.areia;
      el("path", { d: "M-112 190C-112 114 -62 84 0 84C62 84 112 114 112 190Z", ...a.f("#fff") }, g);
      el("rect", { x: -20, y: 46, width: 40, height: 46, rx: 14, ...a.f(a.flat ? C.tinta : mix(pele, C.tinta, .18)) }, g);
      el("circle", { cx: 0, cy: -4, r: 58, ...a.f(pele) }, g);
      el("path", { d: "M-60 -10C-64 -76 64 -76 60 -10C40 -36 -40 -36 -60 -10Z", ...a.f(C.tinta) }, g);
      [[-36, -108, 34], [0, -126, 40], [36, -108, 34]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, ...a.f("#fff") }, g));
      el("rect", { x: -54, y: -88, width: 108, height: 40, rx: 8, ...a.f("#fff") }, g);
      if (!a.flat) {
        el("path", { d: "M-46 -66H46", ...a.s("#EEE8F3", 6) }, g); el("path", { d: "M-18 -128C-12 -140 4 -142 14 -134", ...a.s("#EEE8F3", 6) }, g);
        el("circle", { cx: -18, cy: 130, r: 7, ...a.f(C.cereja) }, g); el("circle", { cx: -18, cy: 160, r: 7, ...a.f(C.cereja) }, g);
        el("path", { d: "M0 92V190", ...a.s("#EEE8F3", 5) }, g); el("path", { d: "M-34 100L0 132L34 100", ...a.s(C.amarelo, 10) }, g);
      }
      return () => {};
    });

  Object.assign(EL, { aceno, mao_aponta: aponta, joinha, avatar, grupo, chef });
})();
