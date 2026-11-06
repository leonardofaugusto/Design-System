// Família NAVEGAÇÃO: seta, botão, abas, menu, interruptor, rolagem e pontos de página.
// As peças que o reel usa para dizer "clique aqui", "troque de aba", "role para baixo", "passe para o próximo".
// Mesmo estilo do resto: formas chapadas com luz e sombra dura (sem contorno preto, sem blur).
// Origem das coordenadas: o CENTRO de cada peça. Todas animam em p (0..1) e t (segundos).
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const nova = (pai, x, y, s, rot) => { const g = el("g", {}, pai); mover(g, x, y, s, rot); return g; };
  const mix = (a, b, u) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, "0")).join(""); };
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
  const acao = (id, nome, tipo, serve_para, nao_usar_quando, caixa, duracao_s, descricao, extras, build) => {
    reg({ id, nome, familia: "navegacao", tipo, serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };

  // ============ SETA: aponta para o que importa ============
  const seta = acao("seta", "Seta", "navegacao", "apontar para um número, uma peça ou o próximo passo; a seta se desenha e a ponta pulsa", "o ponto já está óbvio na tela, ou há mais de duas setas juntas", { w: 300, h: 170 }, 1.8,
    "o traço se desenha da base até a ponta, a ponta abre e pulsa duas vezes", [{ nome: "cor", padrao: C.amarelo }], (g, a, o) => {
      const cor = o.cor || C.amarelo;
      const d = "M-130 55C-70 -55 30 -65 100 -22";
      const tr = el("path", { d, pathLength: 1, ...a.s(cor, 26) }, g);
      const ponta = el("g", {}, g); el("path", { d: "M0 -34L58 0L0 34Z", ...a.f(cor), stroke: a.flat ? C.tinta : cor, "stroke-width": 12, "stroke-linejoin": "round" }, ponta);
      const ang = Math.atan2(43, 70) * 180 / Math.PI;
      return (p) => {
        const u = ease(clamp(p / .5));
        tr.setAttribute("stroke-dasharray", "1 1"); tr.setAttribute("stroke-dashoffset", 1 - u); tr.setAttribute("opacity", p > 0 ? 1 : 0);
        const k = Math.max(0, back(clamp((p - .45) / .2))), pulso = 1 + .12 * Math.max(0, Math.sin(Math.PI * clamp((p - .7) / .3) * 2));
        mover(ponta, 100, -22, k * pulso, ang);
      };
    });

  // ============ BOTÃO: o clique ============
  const botao = acao("botao", "Botão", "botao", "chamar para uma ação ('começar', 'baixar', 'enviar'); o botão afunda no clique e solta uma onda", "o reel não pede uma ação; o texto tem mais de 14 letras", { w: 320, h: 120 }, 1.8,
    "o botão afunda, uma onda abre a partir do toque e ele volta", [{ nome: "rotulo", padrao: "COMEÇAR" }, { nome: "cor", padrao: C.amarelo }], (g, a, o) => {
      const rot = String(o.rotulo || "COMEÇAR").toUpperCase(), cor = o.cor || C.amarelo;
      const w = clamp(rot.length * 30 + 90, 230, 520);
      el("rect", { x: -w / 2, y: -38 + 12, width: w, height: 92, rx: 46, ...a.f(mix(cor, C.tinta, .35)) }, g);
      const face = el("g", {}, g);
      el("rect", { x: -w / 2, y: -46, width: w, height: 92, rx: 46, ...a.f(cor) }, face);
      let onda = null;
      if (!a.flat) {
        el("path", { d: `M${-w / 2 + 34} -26H${w / 2 - 34}`, ...a.s("#fff", 6), "stroke-opacity": .45 }, face);
        txt(face, 0, 14, rot, 52, C.tinta, DISP);
        onda = el("rect", { x: 0, y: 0, width: 0, height: 0, rx: 0, fill: "none", stroke: C.creme, "stroke-width": 6, opacity: 0 }, g);
      }
      return (p) => {
        const d = Math.sin(Math.PI * clamp((p - .3) / .22));
        face.setAttribute("transform", `translate(0 ${10 * d})`);
        if (onda) { const q = clamp((p - .42) / .5), e = ease(q), ww = w + 70 * e, hh = 92 + 70 * e; onda.setAttribute("x", -ww / 2); onda.setAttribute("y", -46 + 6 - (hh - 92) / 2 + 40 - 40); onda.setAttribute("width", ww); onda.setAttribute("height", hh); onda.setAttribute("rx", hh / 2); onda.setAttribute("opacity", q > 0 && q < 1 ? .8 * (1 - q) : 0); }
      };
    });

  // ============ ABAS: troca de seção ============
  const abas = acao("abas", "Abas", "navegacao", "mostrar que o assunto muda de seção ('hoje', 'semana', 'mês'); o destaque desliza de uma aba à outra", "há só uma seção, ou mais de 4 abas", { w: 410, h: 90 }, 3,
    "o destaque desliza pelas abas em ordem e o texto da aba ativa acende", [{ nome: "itens", padrao: ["Hoje", "Semana", "Mês"] }], (g, a, o) => {
      const itens = o.itens || ["Hoje", "Semana", "Mês"], n = itens.length, tw = 132, W = tw * n + 14;
      el("rect", { x: -W / 2, y: -42, width: W, height: 84, rx: 42, ...a.f("#fff") }, g);
      const ind = el("rect", { x: 0, y: -35, width: tw, height: 70, rx: 35, ...a.f(C.cereja) }, g);
      const ts = a.flat ? [] : itens.map((it, i) => txt(g, -W / 2 + 7 + tw * i + tw / 2, 11, it, 32, C.tinta, UI));
      return (p) => {
        const f = clamp((p - .12) / .76) * (n - 1), i = Math.min(n - 2, Math.floor(f)), fr = f - i;
        const pos = n === 1 ? 0 : i + ease(clamp((fr - .45) / .55));
        ind.setAttribute("x", -W / 2 + 7 + tw * pos);
        ts.forEach((t, k) => t.setAttribute("fill", Math.abs(k - pos) < .5 ? C.creme : C.tinta));
      };
    });

  // ============ MENU: hambúrguer que vira X ============
  const menu = acao("menu", "Menu", "navegacao", "abrir e fechar o menu de um app ou site; as três barras viram um X", "o assunto não é uma tela com menu", { w: 150, h: 150 }, 2.4,
    "as três barras viram um X, ficam um instante e voltam", [], (g, a) => {
      el("circle", { r: 72, ...a.f(C.creme) }, g);
      const barras = [-1, 0, 1].map(() => { const b = el("g", {}, g); el("rect", { x: -34, y: -6, width: 68, height: 12, rx: 6, ...a.f(C.tinta) }, b); return b; });
      return (p) => {
        const u = ease(clamp((p - .12) / .28)) * (1 - ease(clamp((p - .58) / .28)));
        mover(barras[0], 0, -22 * (1 - u), 1, 45 * u);
        mover(barras[1], 0, 0, 1 - u, 0); barras[1].setAttribute("opacity", 1 - u);
        mover(barras[2], 0, 22 * (1 - u), 1, -45 * u);
      };
    });

  // ============ INTERRUPTOR: liga e desliga ============
  const toggle = acao("toggle", "Interruptor", "botao", "mostrar uma opção ligada ou desligada ('automático', 'notificações'); o botão desliza e a cor muda", "não há nada para ligar ou desligar", { w: 210, h: 110 }, 2.6,
    "o botão desliza para ligar, a trilha fica verde, e depois desliga", [], (g, a) => {
      const tr = el("rect", { x: -100, y: -50, width: 200, height: 100, rx: 50, ...a.f("#CFC6D6") }, g);
      const bt = el("g", {}, g);
      el("circle", { r: 40, ...a.f("#fff") }, bt);
      let mk = null;
      if (!a.flat) { el("path", { d: "M-12 2L-3 12L14 -10", ...a.s(C.verde, 8), opacity: 0 }, bt); mk = bt.lastChild; }
      return (p) => {
        const u = ease(clamp((p - .15) / .25)) * (1 - ease(clamp((p - .6) / .25)));
        const sq = Math.sin(Math.PI * clamp((p - .15) / .25)) + Math.sin(Math.PI * clamp((p - .6) / .25));
        mover(bt, lerp(-50, 50, u), 0, 1); bt.firstChild.setAttribute("rx", 40); bt.firstChild.setAttribute("transform", `scale(${1 + .18 * sq} ${1 - .06 * sq})`);
        if (!a.flat) tr.setAttribute("fill", mix("#CFC6D6", C.verde, u));
        if (mk) mk.setAttribute("opacity", u > .6 ? 1 : 0);
      };
    });

  // ============ ROLAGEM: 'role para baixo' ============
  const rolagem = acao("rolagem", "Rolagem", "navegacao", "convidar a rolar a tela ou continuar lendo; a bolinha desce e as setas piscam em onda", "o conteúdo cabe numa tela só", { w: 110, h: 280 }, 1.6,
    "a bolinha desce dentro da cápsula e três setas piscam uma depois da outra, em loop", [], (g, a) => {
      el("rect", { x: -45, y: -130, width: 90, height: 150, rx: 45, ...a.s(C.creme, 10) }, g);
      const bola = el("circle", { cx: 0, cy: -90, r: 11, ...a.f(C.creme) }, g);
      const ch = [0, 1, 2].map((i) => el("path", { d: "M-28 0L0 24L28 0", ...a.s(C.creme, 10), transform: `translate(0 ${64 + i * 32})` }, g));
      return (p) => {
        const u = ease((p * 1.25) % 1);
        bola.setAttribute("cy", lerp(-92, -18, u)); bola.setAttribute("opacity", Math.sin(Math.PI * clamp(u * 1.05)));
        ch.forEach((c, i) => c.setAttribute("opacity", .25 + .75 * Math.max(0, Math.sin(Math.PI * (((p * 1.25 + (2 - i) * .22) % 1))))));
      };
    });

  // ============ PONTOS: página 1 de 5 ============
  const pontos = acao("pontos", "Pontos de página", "navegacao", "mostrar a posição numa sequência (passo 2 de 5, slide, carrossel); o ponto ativo estica e anda", "são mais de 7 passos, ou o passo atual não importa", { w: 280, h: 40 }, 3,
    "o ponto ativo estica e desliza pelos pontos até o último", [{ nome: "n", padrao: 5 }], (g, a, o) => {
      const n = clamp(Math.round(o.n || 5), 2, 7), gap = 48, x0 = -gap * (n - 1) / 2;
      for (let i = 0; i < n; i++) el("circle", { cx: x0 + gap * i, cy: 0, r: 12, ...a.f(C.creme), "fill-opacity": a.flat ? 1 : .55 }, g);
      const at = el("rect", { x: 0, y: -12, width: 56, height: 24, rx: 12, ...a.f(C.amarelo) }, g);
      return (p) => {
        const f = clamp((p - .1) / .8) * (n - 1), i = Math.min(n - 2, Math.floor(f)), fr = f - i;
        const pos = i + ease(clamp((fr - .35) / .65)), esticar = Math.sin(Math.PI * clamp((fr - .35) / .65));
        at.setAttribute("x", x0 + gap * pos - 12 - 14 * esticar * 0); at.setAttribute("width", 24 + 32 * esticar);
      };
    });

  Object.assign(EL, { seta, botao, abas, menu, toggle, rolagem, pontos });
})();
