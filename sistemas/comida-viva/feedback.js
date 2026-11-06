// Família FEEDBACK: certo, erro, alerta, carregando, estrelas, coração, sino e confete.
// O que o reel mostra para dizer "deu certo", "deu errado", "atenção", "aguarde", "nota", "curti", "avisou" e "comemora".
// Mesmo estilo do resto: formas chapadas com luz e sombra dura (sem contorno preto, sem blur).
// Origem das coordenadas: o CENTRO de cada peça. Todas animam em p (0..1) e t (segundos).
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const nova = (pai, x, y, s, rot) => { const g = el("g", {}, pai); mover(g, x, y, s, rot); return g; };
  const UI = 'font-family:Outfit,"Segoe UI",sans-serif;font-weight:700;text-transform:none';
  const DISP = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const txt = (pai, x, y, t, fs, fill, estilo = UI, anchor = "middle") => { const e = el("text", { x, y, "font-size": fs, fill, "text-anchor": anchor, style: estilo }, pai); e.textContent = t; return e; };
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
  const acao = (id, nome, serve_para, nao_usar_quando, caixa, duracao_s, descricao, extras, build) => {
    reg({ id, nome, familia: "feedback", tipo: "feedback", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };
  const pop = (p, u0, u1) => Math.max(0, back(clamp((p - u0) / (u1 - u0))));
  const estrelaPts = (r, ri) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? ri : r; return `${(Math.cos(a) * q).toFixed(1)},${(Math.sin(a) * q).toFixed(1)}`; }).join(" ");

  // ============ CERTO ============
  const certo = acao("certo", "Certo", "dizer que deu certo, que a etapa passou ou que algo foi confirmado; o selo estoura e o visto se desenha", "o resultado é incerto ou parcial (use alerta)", { w: 200, h: 200 }, 1.6,
    "o selo verde estoura, o visto se desenha e uma onda abre", [], (g, a) => {
      const onda = a.flat ? null : el("circle", { r: 90, ...a.s(C.creme, 6), opacity: 0 }, g);
      const sel = el("g", {}, g);
      el("circle", { r: 90, ...a.f(C.verde) }, sel);
      let vi = null;
      if (!a.flat) { el("path", { d: "M-38 4L-10 32L42 -28", pathLength: 1, ...a.s(C.creme, 18) }, sel); vi = sel.lastChild; el("circle", { r: 90, ...a.s(C.creme, 8) }, sel); el("path", { d: "M-60 -46A74 74 0 0 1 -22 -72", ...a.s("#fff", 7), "stroke-opacity": .5 }, sel); }
      return (p) => {
        mover(sel, 0, 0, pop(p, 0, .3));
        if (vi) { const u = ease(clamp((p - .22) / .28)); vi.setAttribute("stroke-dasharray", "1 1"); vi.setAttribute("stroke-dashoffset", 1 - u); vi.setAttribute("opacity", u > 0 ? 1 : 0); }
        if (onda) { const q = clamp((p - .3) / .5); onda.setAttribute("r", lerp(90, 150, ease(q))); onda.setAttribute("opacity", q > 0 && q < 1 ? .7 * (1 - q) : 0); }
      };
    });

  // ============ ERRO ============
  const erro = acao("erro", "Erro", "dizer que algo falhou ou foi recusado; o selo treme de lado a lado", "o problema é pequeno ou já foi resolvido", { w: 200, h: 200 }, 1.6,
    "o selo aparece, treme de lado a lado e se acalma", [], (g, a) => {
      const sel = el("g", {}, g);
      el("circle", { r: 90, ...a.f(C.cerejaEsc) }, sel);
      if (!a.flat) { el("circle", { r: 90, ...a.s(C.creme, 8) }, sel); el("path", { d: "M-34 -34L34 34M34 -34L-34 34", ...a.s(C.creme, 18) }, sel); el("path", { d: "M-60 -46A74 74 0 0 1 -22 -72", ...a.s("#fff", 7), "stroke-opacity": .35 }, sel); }
      return (p) => { const tr = Math.sin(p * Math.PI * 12) * 16 * clamp((p - .25) / .1) * (1 - clamp((p - .35) / .45)); mover(sel, tr, 0, pop(p, 0, .25)); };
    });

  // ============ ALERTA ============
  const alerta = acao("alerta", "Alerta", "chamar atenção para um cuidado, um prazo ou uma exceção; o triângulo balança e pulsa", "o aviso é uma boa notícia (use certo)", { w: 200, h: 180 }, 1.8,
    "o triângulo entra, balança de um lado ao outro e pulsa duas vezes", [], (g, a) => {
      const sel = el("g", {}, g);
      el("path", { d: "M0 -76L88 74H-88Z", ...a.f(C.amarelo), stroke: a.flat ? C.tinta : C.amarelo, "stroke-width": 26, "stroke-linejoin": "round" }, sel);
      if (!a.flat) { el("path", { d: "M0 -26V24", ...a.s(C.tinta, 17) }, sel); el("circle", { cy: 50, r: 10, ...a.f(C.tinta) }, sel); el("path", { d: "M-34 -2L-8 -46", ...a.s("#fff", 7), "stroke-opacity": .55 }, sel); }
      return (p) => {
        const ba = Math.sin(p * Math.PI * 6) * 9 * clamp((p - .2) / .1) * (1 - clamp((p - .45) / .45));
        const pu = 1 + .08 * Math.max(0, Math.sin(Math.PI * clamp((p - .55) / .4) * 2));
        mover(sel, 0, 8, pop(p, 0, .22) * pu, ba);
      };
    });

  // ============ CARREGANDO ============
  const carregando = acao("carregando", "Carregando", "dizer 'aguarde': o agente está lendo, pensando ou processando; oito pontos giram em loop", "a espera é curta demais para merecer aviso (menos de 1 s)", { w: 200, h: 200 }, 1.2,
    "oito pontos giram, o da frente é amarelo e maior, e os de trás apagam", [], (g, a) => {
      const ps = Array.from({ length: 8 }, (_, i) => { const an = i * Math.PI / 4 - Math.PI / 2; return el("circle", { cx: Math.cos(an) * 74, cy: Math.sin(an) * 74, r: 18, ...a.f(C.creme) }, g); });
      return (p) => ps.forEach((c, i) => {
        const d = ((p * 8 - i) % 8 + 8) % 8, v = 1 - d / 8, forte = d < 1.2;
        c.setAttribute("opacity", a.flat ? 1 : .25 + .75 * v); c.setAttribute("r", 11 + 9 * v);
        if (!a.flat) c.setAttribute("fill", forte ? C.amarelo : C.creme);
      });
    });

  // ============ ESTRELAS ============
  const estrelas = acao("estrelas", "Estrelas", "mostrar nota ou avaliação (4 de 5); as estrelas acendem uma a uma", "o número exato importa mais que a sensação (use numero)", { w: 520, h: 110 }, 2,
    "as estrelas pulam em sequência até a nota", [{ nome: "nota", padrao: 4 }], (g, a, o) => {
      const nota = clamp(o.nota == null ? 4 : o.nota, 0, 5), gap = 104;
      const es = [0, 1, 2, 3, 4].map((i) => {
        const e = el("g", {}, g); mover(e, (i - 2) * gap, 0);
        el("polygon", { points: estrelaPts(52, 24), ...a.f(C.creme), "fill-opacity": a.flat ? 1 : .3, stroke: a.flat ? C.tinta : C.creme, "stroke-opacity": a.flat ? 1 : .3, "stroke-width": 10, "stroke-linejoin": "round" }, e);
        const c = el("g", {}, e);
        el("polygon", { points: estrelaPts(52, 24), ...a.f(C.amarelo), stroke: a.flat ? C.tinta : C.amarelo, "stroke-width": 10, "stroke-linejoin": "round" }, c);
        if (!a.flat) el("path", { d: "M-18 -24L-6 -42", ...a.s("#fff", 6), "stroke-opacity": .7 }, c);
        return { e, c, x: (i - 2) * gap };
      });
      return (p) => es.forEach(({ e, c, x }, i) => {
        const cheia = i < Math.floor(nota), u = pop(p, .1 + i * .13, .1 + i * .13 + .22);
        mover(e, x, -10 * Math.sin(Math.PI * clamp((p - .1 - i * .13) / .22)) * (cheia ? 1 : 0));
        mover(c, 0, 0, cheia ? u : 0);
      });
    });

  // ============ CORAÇÃO ============
  const coracao = acao("coracao", "Coração", "curtir, gostar, 'feito com carinho'; o coração pula e solta faíscas", "o assunto é saúde ou ritmo cardíaco", { w: 240, h: 240 }, 1.6,
    "o coração pula duas vezes e solta seis faíscas", [], (g, a) => {
      const fa = a.flat ? [] : Array.from({ length: 6 }, (_, i) => { const r = el("rect", { x: -4, y: -22, width: 8, height: 24, rx: 4, ...a.f(i % 2 ? C.amarelo : C.creme) }, g); return { r, an: i * 60 - 90 }; });
      const co = el("g", {}, g);
      el("path", { d: "M0 70C-96 4 -84 -80 -38 -78C-16 -76 0 -58 0 -44C0 -58 16 -76 38 -78C84 -80 96 4 0 70Z", ...a.f(C.cereja), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 9, "stroke-linejoin": "round" }, co);
      if (!a.flat) el("path", { d: "M-62 -34C-70 -52 -54 -66 -38 -62", ...a.s("#fff", 8), "stroke-opacity": .55 }, co);
      return (p) => {
        const b = Math.max(0, Math.sin(Math.PI * clamp((p - .15) / .2))) + .7 * Math.max(0, Math.sin(Math.PI * clamp((p - .4) / .2)));
        mover(co, 0, 4, pop(p, 0, .16) * (1 + .14 * b));
        fa.forEach(({ r, an }) => { const q = clamp((p - .16) / .55), d = lerp(70, 118, ease(q)); mover(r, Math.cos(an * Math.PI / 180) * d, Math.sin(an * Math.PI / 180) * d, 1, an + 90); r.setAttribute("opacity", q > 0 && q < 1 ? 1 - q : 0); });
      };
    });

  // ============ SINO ============
  const sino = acao("sino", "Sino", "avisar, notificar, 'chegou algo novo'; o sino balança e o número do aviso aparece", "não há aviso para dar", { w: 210, h: 230 }, 1.8,
    "o sino balança de um lado ao outro, diminuindo, e a bolinha com o número aparece", [{ nome: "n", padrao: 3 }], (g, a, o) => {
      const sw = el("g", {}, g);
      el("circle", { cy: -102, r: 13, ...a.f(C.amarelo) }, sw);
      el("path", { d: "M0 -92C-52 -92 -66 -42 -66 0C-66 40 -92 56 -92 72H92C92 56 66 40 66 0C66 -42 52 -92 0 -92Z", ...a.f(C.amarelo) }, sw);
      el("circle", { cy: 90, r: 20, ...a.f(C.laranja) }, sw);
      if (!a.flat) { el("path", { d: "M-44 -34C-50 -14 -48 8 -48 20", ...a.s("#fff", 8), "stroke-opacity": .6 }, sw); el("path", { d: "M-90 72H90", ...a.s(C.laranja, 10) }, sw); }
      const bd = el("g", {}, g); let nt = null;
      el("circle", { cx: 62, cy: -66, r: 34, ...a.f(C.cereja), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 8 }, bd);
      if (!a.flat) nt = txt(bd, 62, -52, String(o.n == null ? 3 : o.n), 40, C.creme, DISP);
      return (p) => {
        const an = Math.sin(p * Math.PI * 7) * 20 * Math.exp(-3 * clamp((p - .05) / .8)) * clamp(p / .05);
        sw.setAttribute("transform", `rotate(${an} 0 -102)`);
        mover(bd, 0, 0, pop(p, .25, .5));
      };
    });

  // ============ CONFETE ============
  const CF = [C.amarelo, C.creme, C.laranja, C.menta, C.lilas, C.rosa];
  const confete = acao("confete", "Confete", "comemorar uma entrega, uma meta batida ou uma estreia; o confete estoura do centro e cai", "o assunto é sério ou o resultado não é bom", { w: 440, h: 440 }, 2.2,
    "o confete estoura do centro, abre em leque, gira e cai com a gravidade", [], (g, a) => {
      if (a.flat) return () => {};
      const ps = Array.from({ length: 22 }, (_, i) => {
        const an = (i * 360 / 22 + (i % 3) * 7) * Math.PI / 180, v = 130 + (i * 37 % 90), tipo = i % 3, cor = CF[i % CF.length];
        const e = tipo === 0 ? el("rect", { x: -9, y: -5, width: 18, height: 10, rx: 3, fill: cor }, g) : tipo === 1 ? el("circle", { r: 7, fill: cor }, g) : el("path", { d: "M-9 6L0 -8L9 6Z", fill: cor, "stroke-linejoin": "round" }, g);
        return { e, an, v, r0: i * 53 };
      });
      return (p) => ps.forEach(({ e, an, v, r0 }) => {
        const q = clamp((p - .06) / .88), ex = ease(clamp(q / .5));
        mover(e, Math.cos(an) * v * ex, Math.sin(an) * v * ex + 240 * q * q, 1, r0 + q * 500);
        e.setAttribute("opacity", q > 0 && q < 1 ? Math.min(1, (1 - q) * 3) : 0);
      });
    });

  Object.assign(EL, { certo, erro, alerta, carregando, estrelas, coracao, sino, confete });
})();
