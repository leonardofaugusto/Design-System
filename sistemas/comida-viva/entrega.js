// Família ENTREGA: da plantação até a porta — bag térmica, broto, celular, pin de mapa, moto, floco e geladeira.
// Mesmo estilo do resto: formas chapadas com luz e sombra dura (sem contorno preto, sem blur).
// Origem das coordenadas: o CENTRO de cada peça. Objetos são fixos; ações recebem p (0..1) e t (segundos).
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const MET = { base: "#DDE2EC", som: "#B3BBCB" };
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const nova = (pai, x, y, s, rot) => { const g = el("g", {}, pai); mover(g, x, y, s, rot); return g; };
  const P3 = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];

  // A(flat): flat = true desenha a silhueta da sombra (tudo tinta), false desenha as cores de verdade.
  const A = (flat) => ({
    flat,
    f: (c) => ({ fill: flat ? C.tinta : c }),
    s: (c, w) => ({ fill: "none", stroke: flat ? C.tinta : c, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }),
  });
  // monta a peça duas vezes (sombra deslocada com opacidade no grupo, para não escurecer onde as formas se sobrepõem)
  const montar = (pai, { x = 0, y = 0, s = 1, rot = 0, sombra = true } = {}, build) => {
    const g = nova(pai, x, y, s, rot);
    const sh = sombra ? el("g", { transform: "translate(14 12)", opacity: .24 }, g) : null;
    const ss = sh ? build(sh, A(true)) : null, ms = build(g, A(false));
    return { g, set: (p = 0, t = 0) => { if (ss) ss(p, t); ms(p, t); } };
  };
  const objeto = (id, nome, serve_para, nao_usar_quando, caixa, build) => {
    reg({ id, nome, familia: "entrega", tipo: "objeto", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: P3, movimento: null });
    return (pai, o = {}) => { const m = montar(pai, o, build); m.set(0, 0); return m.g; };
  };
  const acao = (id, nome, serve_para, nao_usar_quando, caixa, duracao_s, descricao, build) => {
    reg({ id, nome, familia: "entrega", tipo: "acao", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: P3, movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };

  // ============ BAG TÉRMICA: a mochila da entrega ============
  const bag = objeto("bag", "Bag térmica", "entrega, delivery, 'chega fresquinho'; a mochila do entregador, de pé", "o assunto não envolve entrega ou transporte de comida", { w: 260, h: 262 },
    (g, a) => {
      el("path", { d: "M-56 -88C-56 -140 56 -140 56 -88", ...a.s(C.cerejaEsc, 14) }, g);
      el("rect", { x: -130, y: -40, width: 260, height: 170, rx: 28, ...a.f(C.cereja) }, g);
      el("rect", { x: -130, y: -92, width: 260, height: 64, rx: 26, ...a.f(C.cerejaEsc) }, g);
      if (!a.flat) {
        el("rect", { x: -130, y: 38, width: 260, height: 26, ...a.f(C.creme) }, g);
        el("path", { d: "M-108 -4V22M-108 80V108", ...a.s("#fff", 8), "stroke-opacity": .3 }, g);
        el("path", { d: "M-100 -60H100", ...a.s(C.cereja, 4), "stroke-opacity": .6 }, g);
        el("rect", { x: -20, y: -52, width: 40, height: 32, rx: 9, ...a.f(C.amarelo) }, g);
        el("rect", { x: -9, y: -43, width: 18, height: 14, rx: 5, ...a.f(C.cerejaEsc) }, g);
      }
      return () => {};
    });

  // ============ BROTO: planta que nasce do vaso ============
  const broto = acao("broto", "Broto", "crescimento, origem do ingrediente, 'plantado com cuidado'; a planta nasce do vaso e balança", "o assunto não tem relação com comida, origem ou crescimento", { w: 180, h: 290 }, 2.4,
    "o caule sobe, as folhas abrem em sequência e a planta fica balançando de leve", (g, a) => {
      const pl = el("g", {}, g);
      const caule = el("path", { d: "M0 12V-88", ...a.s(C.verde, 10) }, pl);
      const fL = el("g", {}, pl), fR = el("g", {}, pl), fT = el("g", {}, pl);
      const folha = "M0 0C62 -18 92 -78 82 -112C30 -104 0 -62 0 0Z";
      el("path", { d: folha, ...a.f(C.verde) }, fR); el("path", { d: folha, ...a.f(C.menta), transform: "scale(-1 1)" }, fL);
      el("path", { d: "M0 -8C34 -26 56 -56 66 -88M0 -8C-34 -26 -56 -56 -66 -88", ...a.s(a.flat ? C.tinta : C.verdeEsc, 4), "stroke-opacity": .55 }, fR);
      el("path", { d: "M0 0C-24 -30 -20 -64 0 -92C20 -64 24 -30 0 0Z", ...a.f(C.menta) }, fT);
      // vaso (por cima da base do caule)
      el("path", { d: "M-62 22H62L50 128Q48 140 36 140H-36Q-48 140 -50 128Z", ...a.f(C.laranja) }, g);
      el("rect", { x: -72, y: 4, width: 144, height: 30, rx: 11, ...a.f(C.laranjaEsc) }, g);
      if (!a.flat) { el("path", { d: "M-34 56V112", ...a.s("#fff", 7), "stroke-opacity": .3 }, g); el("rect", { x: -62, y: 20, width: 124, height: 8, ...a.f(C.laranja), "fill-opacity": .0 }, g); }
      return (p, t) => {
        const u = ease(clamp(p / .45));
        caule.setAttribute("d", `M0 12V${12 - 100 * u}`);
        const k = (u0, u1) => back(clamp((p - u0) / (u1 - u0)));
        const fl = Math.max(0, k(.3, .62)), ft = Math.max(0, k(.55, .85));
        const bal = Math.sin(t * 2.2) * 3 * clamp((p - .6) / .3);
        fR.setAttribute("transform", `translate(0 -34) rotate(${bal}) scale(${fl})`);
        fL.setAttribute("transform", `translate(0 -34) rotate(${bal}) scale(${fl})`);
        fT.setAttribute("transform", `translate(0 -88) rotate(${bal * .6}) scale(${ft})`);
        pl.setAttribute("opacity", p > 0 ? 1 : 0);
      };
    });

  // ============ CELULAR: o pedido na mão ============
  const celular = objeto("celular", "Celular", "app, pedido, notificação de entrega; aparelho em pé com a tela de confirmação", "o assunto é computador ou terminal (use janela ou terminal)", { w: 150, h: 290 },
    (g, a) => {
      el("rect", { x: -75, y: -145, width: 150, height: 290, rx: 30, ...a.f(C.tinta) }, g);
      if (!a.flat) {
        el("rect", { x: -63, y: -133, width: 126, height: 266, rx: 20, ...a.f(C.creme) }, g);
        el("rect", { x: -63, y: -133, width: 126, height: 58, rx: 20, ...a.f(C.cereja) }, g);
        el("rect", { x: -63, y: -100, width: 126, height: 25, ...a.f(C.cereja) }, g);
        el("rect", { x: -26, y: -125, width: 52, height: 12, rx: 6, ...a.f(C.tinta) }, g);
        el("circle", { cx: 0, cy: -8, r: 32, ...a.f(C.verde) }, g);
        el("path", { d: "M-15 -6L-4 6L16 -20", ...a.s(C.creme, 9) }, g);
        el("rect", { x: -42, y: 40, width: 84, height: 11, rx: 5.5, ...a.f(C.areia) }, g);
        el("rect", { x: -28, y: 60, width: 56, height: 11, rx: 5.5, ...a.f(C.areia) }, g);
        el("rect", { x: -44, y: 92, width: 88, height: 28, rx: 14, ...a.f(C.cereja) }, g);
        el("path", { d: "M-69 -100V-30", ...a.s("#fff", 5), "stroke-opacity": .25 }, g);
      }
      return () => {};
    });

  // ============ PIN: o ponto no mapa ============
  const pin = acao("pin", "Pin de mapa", "local, endereço, 'chegou aqui'; o pin cai no ponto, quica e solta uma onda", "o assunto não é um lugar", { w: 140, h: 210 }, 1.8,
    "o pin cai de cima, quica uma vez e uma onda abre no chão", (g, a) => {
      let onda = null;
      if (!a.flat) onda = el("ellipse", { cx: 0, cy: 104, rx: 0, ry: 0, fill: "none", stroke: C.cereja, "stroke-width": 6, opacity: 0 }, g);
      const corpo = el("g", {}, g);
      el("path", { d: "M0 105C-20 65 -70 25 -70 -35A70 70 0 0 1 70 -35C70 25 20 65 0 105Z", ...a.f(C.cereja) }, corpo);
      if (!a.flat) {
        el("path", { d: "M-52 -48A54 54 0 0 1 -18 -84", ...a.s("#fff", 7), "stroke-opacity": .55 }, corpo);
        el("circle", { cx: 0, cy: -35, r: 28, ...a.f(C.creme) }, corpo);
      }
      return (p) => {
        const u = clamp(p / .5), cai = -300 * (1 - u * u);
        const q = clamp((p - .5) / .22), quica = -46 * Math.sin(Math.PI * q);
        corpo.setAttribute("transform", `translate(0 ${cai + quica})`);
        if (onda) { const w = clamp((p - .52) / .45); onda.setAttribute("rx", lerp(10, 68, ease(w))); onda.setAttribute("ry", lerp(3, 17, ease(w))); onda.setAttribute("opacity", w > 0 && w < 1 ? .8 * (1 - w) : 0); }
      };
    });

  // ============ MOTO: a caminho ============
  const moto = acao("moto", "Moto de entrega", "entrega rápida, rota, 'a caminho'; moto amarela com baú cereja, as rodas giram", "o assunto não é transporte", { w: 320, h: 240 }, 2,
    "a moto balança na pista, as rodas giram e riscos de velocidade passam para trás", (g, a) => {
      const corpo = el("g", {}, g);
      el("rect", { x: -178, y: -96, width: 92, height: 84, rx: 14, ...a.f(C.cereja) }, corpo);
      el("path", { d: "M-92 -6H22Q56 -6 68 24L78 58H-98Q-112 58 -112 42Z", ...a.f(C.amarelo) }, corpo);
      el("rect", { x: -96, y: -32, width: 108, height: 28, rx: 14, ...a.f(C.tinta) }, corpo);
      el("path", { d: "M64 28L94 -72", ...a.s(C.tinta, 12) }, corpo);
      el("rect", { x: 76, y: -88, width: 42, height: 13, rx: 6.5, ...a.f(C.tinta) }, corpo);
      if (!a.flat) {
        el("rect", { x: -178, y: -62, width: 92, height: 12, ...a.f(C.cerejaEsc) }, corpo);
        el("rect", { x: -170, y: -90, width: 30, height: 8, rx: 4, ...a.f("#fff"), "fill-opacity": .35 }, corpo);
        el("circle", { cx: 108, cy: -52, r: 15, ...a.f(C.creme) }, corpo);
        el("path", { d: "M-70 18H30", ...a.s("#fff", 6), "stroke-opacity": .45 }, corpo);
      }
      const rodas = [-100, 100].map((cx) => {
        const r = el("g", {}, g); mover(r, cx, 62);
        el("circle", { r: 46, ...a.f(C.tinta) }, r);
        if (!a.flat) {
          el("circle", { r: 26, ...a.f(C.creme) }, r);
          [0, 60, 120].forEach((ang) => el("path", { d: "M-26 0H26", ...a.s(C.tinta, 6), transform: `rotate(${ang})` }, r));
          el("circle", { r: 8, ...a.f(C.tinta) }, r);
        }
        return { r, cx };
      });
      const riscos = a.flat ? [] : [0, 1, 2].map((i) => el("rect", { x: 0, y: -40 + i * 46, width: 46, height: 8, rx: 4, ...a.f(C.creme) }, g));
      return (p) => {
        const ang = p * 720;
        rodas.forEach(({ r, cx }) => r.setAttribute("transform", `translate(${cx} 62) rotate(${ang})`));
        corpo.setAttribute("transform", `translate(0 ${Math.sin(p * Math.PI * 8) * 2.5}) rotate(${Math.sin(p * Math.PI * 8) * .6} 0 60)`);
        riscos.forEach((rk, i) => { const f = (p * 2 + i / 3) % 1; rk.setAttribute("x", -200 - f * 44); rk.setAttribute("width", 46 * Math.sin(Math.PI * f)); rk.setAttribute("opacity", .85 * Math.sin(Math.PI * f)); });
      };
    });

  // ============ FLOCO: o frio ============
  const floco = acao("floco", "Floco", "frio, congelado, conservação, 'gelado'; o floco gira devagar", "o assunto é quente ou não tem relação com temperatura", { w: 230, h: 230 }, 4,
    "o floco gira devagar e pulsa de leve; o ciclo fecha a cada 60 graus", (g, a) => {
      const arma = "M0 0V-108M0 -58L-26 -84M0 -58L26 -84M0 -86L-17 -104M0 -86L17 -104";
      const giro = el("g", {}, g);
      for (let i = 0; i < 6; i++) el("path", { d: arma, ...a.s("#fff", 12), transform: `rotate(${i * 60})` }, giro);
      el("circle", { r: 24, ...a.f(C.lilas) }, giro);
      if (!a.flat) el("circle", { r: 11, ...a.f("#fff") }, giro);
      return (p, t) => { giro.setAttribute("transform", `rotate(${p * 60}) scale(${1 + .04 * Math.sin(p * Math.PI * 2)})`); };
    });

  // ============ GELADEIRA: guardado gelado ============
  const geladeira = objeto("geladeira", "Geladeira", "armazenamento, frescor, 'guardado gelado'; geladeira de duas portas, vista de frente", "o assunto não é guardar ou conservar", { w: 190, h: 330 },
    (g, a) => {
      el("rect", { x: -78, y: 150, width: 24, height: 16, rx: 5, ...a.f(C.tinta) }, g); el("rect", { x: 54, y: 150, width: 24, height: 16, rx: 5, ...a.f(C.tinta) }, g);
      el("rect", { x: -95, y: -165, width: 190, height: 320, rx: 26, ...a.f("#fff") }, g);
      if (!a.flat) {
        el("rect", { x: 55, y: -165, width: 40, height: 320, rx: 20, ...a.f("#EEE8F3") }, g);
        el("rect", { x: -95, y: -165, width: 190, height: 320, rx: 26, ...a.f("#fff"), "fill-opacity": 0 }, g);
        el("path", { d: "M-95 -42H95", ...a.s("#EEE8F3", 8) }, g);
        el("rect", { x: -74, y: -142, width: 12, height: 80, rx: 6, ...a.f(MET.base) }, g);
        el("rect", { x: -74, y: -18, width: 12, height: 110, rx: 6, ...a.f(MET.base) }, g);
        el("path", { d: "M-68 -134V-90M-68 -10V40", ...a.s("#fff", 4) }, g);
        el("rect", { x: -26, y: -124, width: 30, height: 30, rx: 8, ...a.f(C.cereja) }, g);
        el("rect", { x: 10, y: -100, width: 26, height: 26, rx: 13, ...a.f(C.amarelo) }, g);
        el("rect", { x: -34, y: 22, width: 56, height: 14, rx: 7, ...a.f(C.lilas) }, g);
      }
      return () => {};
    });

  Object.assign(EL, { bag, broto, celular, pin, moto, floco, geladeira });
})();
