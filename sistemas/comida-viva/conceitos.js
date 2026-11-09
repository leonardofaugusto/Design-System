// Família CONCEITOS (ideias): ciclo, bloco_peca, grafo, teia, ferramentas, bifurcacao, plano_furado, voto_contra, cadeado e plataforma.
// O que o reel usa para explicar ideias abstratas de IA e trabalho: o agente que repete passos, as peças que acendem, a rede de notas,
// o projeto que envelhece, os caminhos com custo, o plano com furos, a discordância, a confiança e a plataforma.
// Mesmo estilo do resto: formas chapadas com luz e sombra dura (sem contorno preto, sem blur).
// Origem das coordenadas: o CENTRO de cada peça. Todas animam em p (0..1) e t (segundos).
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lerp = (a, b, u) => a + (b - a) * u;
  const mover = (g, x, y, s = 1, rot = 0) => g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  const pv = (g, cx, cy, s = 1, rot = 0) => g.setAttribute("transform", `translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`);
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
    reg({ id, nome, familia: "conceitos", tipo: "acao", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };
  const pop = (p, u0, u1) => Math.max(0, back(clamp((p - u0) / (u1 - u0))));
  const bump = (p, u0, u1) => Math.sin(Math.PI * clamp((p - u0) / (u1 - u0)));
  const mix = (a, b, u) => { const q = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const X = q(a), Y = q(b); return "#" + X.map((v, i) => Math.round(v + (Y[i] - v) * u).toString(16).padStart(2, "0")).join(""); };
  const traco = (e, u) => { e.setAttribute("stroke-dasharray", "1 1"); e.setAttribute("stroke-dashoffset", 1 - u); e.setAttribute("opacity", u > 0 ? 1 : 0); };

  // ============ CICLO ============
  const ciclo = acao("ciclo", "Ciclo", "explicar que o agente repete agir, olhar e decidir até terminar; o passo ativo acende e um ponto percorre as setas", "o processo é linear e termina num passo só (use fluxo)", { w: 420, h: 420 }, 3,
    "três passos em círculo: o ativo acende em amarelo e cresce, e um ponto percorre as setas sem parar", [{ nome: "rotulos", padrao: ["AGIR", "OLHAR", "DECIDIR"] }], (g, a, o) => {
      const rot = o.rotulos || ["AGIR", "OLHAR", "DECIDIR"], R = 140, cores = [C.cereja, C.roxo, C.laranja];
      const ang = (i) => (-90 + i * 120) * Math.PI / 180;
      for (let i = 0; i < 3; i++) {
        const a0 = ang(i) + .62, a1 = ang(i + 1) - .62, x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R;
        el("path", { d: `M${Math.cos(a0) * R} ${Math.sin(a0) * R}A${R} ${R} 0 0 1 ${x1} ${y1}`, ...a.s(C.creme, 12) }, g);
        el("polygon", { points: "-14,-17 20,0 -14,17", ...a.f(C.creme), transform: `translate(${x1} ${y1}) rotate(${Math.atan2(Math.cos(a1), -Math.sin(a1)) * 180 / Math.PI})` }, g);
      }
      const ponto = a.flat ? null : el("circle", { r: 14, ...a.f(C.amarelo), stroke: C.creme, "stroke-width": 5 }, g);
      const nos = [0, 1, 2].map((i) => {
        const n = el("g", {}, g), c = el("circle", { r: 62, ...a.f(cores[i]) }, n);
        const t = a.flat ? null : txt(n, 0, 12, rot[i], 36, C.creme, DISP);
        return { n, c, t, x: Math.cos(ang(i)) * R, y: Math.sin(ang(i)) * R };
      });
      return (p) => {
        const u = p * 3;
        nos.forEach(({ n, c, t, x, y }, i) => {
          const d = ((u - i) % 3 + 3) % 3, on = d < 1;
          mover(n, x, y, 1 + (on ? .16 * Math.sin(Math.PI * d) : 0));
          if (!a.flat) { c.setAttribute("fill", on ? C.amarelo : cores[i]); t.setAttribute("fill", on ? C.tinta : C.creme); }
        });
        if (ponto) { const an = -Math.PI / 2 + u * 2 * Math.PI / 3; ponto.setAttribute("cx", Math.cos(an) * R); ponto.setAttribute("cy", Math.sin(an) * R); }
      };
    });

  // ============ BLOCO DE PEÇA ============
  const ICONES = {
    modelo: (g, a) => { el("rect", { x: -26, y: -26, width: 52, height: 52, rx: 12, ...a.f(C.creme) }, g); if (!a.flat) { el("rect", { x: -12, y: -12, width: 24, height: 24, rx: 6, fill: C.roxo }, g); for (const d of [-16, 0, 16]) el("path", { d: `M${d} -40V-26M${d} 26V40M-40 ${d}H-26M26 ${d}H40`, ...a.s(C.creme, 6) }, g); } },
    ferramentas: (g, a) => { el("path", { d: "M-32 34L8 -6", ...a.s(C.creme, 16) }, g); el("path", { d: "M10 -40A30 30 0 1 0 40 -10", ...a.s(C.creme, 14) }, g); },
    contexto: (g, a) => { [[-14, 16], [0, 4], [14, -8]].forEach(([x, y], i) => { el("rect", { x: x - 28, y: y - 32, width: 56, height: 64, rx: 8, ...a.f(i === 2 ? C.creme : C.areia) }, g); if (!a.flat && i === 2) [-14, 0, 14].forEach((l) => el("rect", { x: x - 18, y: l - 8, width: 36, height: 7, rx: 3, fill: C.tinta, opacity: .3 }, g)); }); },
    ciclo: (g, a) => { el("path", { d: "M-32 -6A34 34 0 0 1 22 -26", ...a.s(C.creme, 12) }, g); el("path", { d: "M32 6A34 34 0 0 1 -22 26", ...a.s(C.creme, 12) }, g); el("polygon", { points: "10,-42 38,-24 8,-10", ...a.f(C.creme) }, g); el("polygon", { points: "-10,42 -38,24 -8,10", ...a.f(C.creme) }, g); },
  };
  const bloco_peca = acao("bloco_peca", "Bloco de peça", "mostrar uma das peças de uma ideia (modelo, ferramentas, contexto, ciclo) que acende na hora em que é citada", "são mais de seis blocos juntos (vira parede de cartões)", { w: 290, h: 290 }, 2,
    "o bloco começa apagado, tracejado, e acende numa cor com um pulo; com estado apagado ele fica sem luz", [{ nome: "rotulo", padrao: "CONTEXTO" }, { nome: "icone", padrao: "contexto" }, { nome: "cor", padrao: C.cereja }, { nome: "estado", padrao: "anima" }], (g, a, o) => {
      const cor = o.cor || C.cereja, ic = ICONES[o.icone || "contexto"] || ICONES.contexto;
      const bl = el("g", {}, g);
      const ap = a.flat ? null : el("rect", { x: -130, y: -130, width: 260, height: 260, rx: 44, fill: "none", stroke: C.creme, "stroke-width": 8, "stroke-dasharray": "22 16", "stroke-linecap": "round" }, bl);
      const ac = el("rect", { x: -130, y: -130, width: 260, height: 260, rx: 44, ...a.f(cor) }, bl);
      const ig = el("g", {}, bl); mover(ig, 0, -22, 1.5); ic(ig, a);
      const tx = a.flat ? null : txt(bl, 0, 100, o.rotulo || "CONTEXTO", 44, C.creme, DISP);
      if (!a.flat) el("path", { d: "M-100 -78C-108 -100 -96 -112 -76 -112", ...a.s("#fff", 8), "stroke-opacity": .4 }, bl);
      return (p) => {
        const on = o.estado === "aceso" ? 1 : o.estado === "apagado" ? 0 : ease(clamp((p - .25) / .18));
        ac.setAttribute("opacity", on); if (ap) ap.setAttribute("opacity", 1 - on);
        ig.setAttribute("opacity", a.flat ? on : .35 + .65 * on); if (tx) tx.setAttribute("opacity", .45 + .55 * on);
        mover(bl, 0, 0, o.estado ? 1 : 1 + .1 * bump(p, .25, .5));
      };
    });

  // ============ GRAFO ============
  const GN = [[0, 0, 30, C.cereja], [-140, -90, 20, C.laranja], [-10, -135, 18, C.roxo], [135, -95, 22, C.verde], [-190, 20, 18, C.amarelo], [175, 25, 18, C.rosa], [-110, 100, 22, C.roxo], [20, 115, 20, C.laranja], [140, 120, 16, C.verde]];
  const GA = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 2], [2, 3], [3, 5], [4, 6], [6, 7], [7, 8], [5, 8]];
  const grafo = acao("grafo", "Grafo de notas", "mostrar notas ligadas entre si (a memória do agente, o Obsidian); os fios se desenham e as notas aparecem", "são poucos itens sem relação entre si (use pictograma)", { w: 460, h: 340 }, 3,
    "os fios se desenham um a um, cada nota aparece no fim do fio e a central pulsa", [], (g, a) => {
      const fios = GA.map(([i, j]) => el("line", { x1: GN[i][0], y1: GN[i][1], x2: GN[j][0], y2: GN[j][1], pathLength: 1, ...a.s(C.creme, 6) }, g));
      const nos = GN.map(([x, y, r, cor]) => { const n = el("g", {}, g); el("circle", { r, ...a.f(cor), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 6 }, n); return { n, x, y }; });
      return (p) => {
        fios.forEach((f, k) => traco(f, ease(clamp((p - .04 - k * .035) / .18))));
        nos.forEach(({ n, x, y }, i) => mover(n, x, y, pop(p, .06 + i * .07, .26 + i * .07) * (i === 0 ? 1 + .12 * bump(p, .75, .95) : 1)));
      };
    });

  // ============ TEIA ============
  const teia = acao("teia", "Teia de aranha", "dizer que algo parado envelhece e fica esquecido (arquivo que ninguém atualiza); o papel amarela e a teia cresce", "o conteúdo está só desatualizado, não esquecido (use riscado)", { w: 340, h: 300 }, 2.6,
    "o papel amarela, a teia se desenha no canto e uma aranha desce no fio", [], (g, a) => {
      const doc = el("rect", { x: -110, y: -100, width: 220, height: 200, rx: 18, ...a.f(C.creme) }, g);
      if (!a.flat) [-62, -32, -2, 28].forEach((y, i) => el("rect", { x: -80, y, width: [160, 120, 150, 90][i], height: 13, rx: 6, fill: C.tinta, opacity: .2 }, g));
      let radiais = [], arcos = [], fio = null, ar = null;
      if (!a.flat) {
        const O = [-110, -100], pt = (r, gr) => [O[0] + Math.cos(gr * Math.PI / 180) * r, O[1] + Math.sin(gr * Math.PI / 180) * r];
        radiais = [0, 30, 60, 90].map((gr) => el("path", { d: `M${O[0]} ${O[1]}L${pt(135, gr).join(" ")}`, pathLength: 1, ...a.s(C.tinta, 4), "stroke-opacity": .55 }, g));
        arcos = [45, 85, 125].map((r) => el("path", { d: "M" + [0, 30, 60, 90].map((gr) => pt(r, gr).join(" ")).join("L"), pathLength: 1, ...a.s(C.tinta, 4), "stroke-opacity": .55 }, g));
        fio = el("line", { x1: -50, y1: -100, x2: -50, y2: -100, ...a.s(C.tinta, 3) }, g);
        ar = el("g", {}, g); el("circle", { r: 13, fill: C.tinta }, ar);
        for (const l of [-1, 1]) for (const k of [-8, 8]) el("path", { d: `M${l * 10} ${k * .4}L${l * 26} ${k * 1.6}`, ...a.s(C.tinta, 4) }, ar);
      }
      return (p) => {
        if (!a.flat) {
          doc.setAttribute("fill", mix(C.creme, C.areia, ease(clamp(p / .55))));
          radiais.forEach((r) => traco(r, ease(clamp((p - .15) / .3)))); arcos.forEach((r) => traco(r, ease(clamp((p - .4) / .3))));
          const q = ease(clamp((p - .65) / .3)), y = -100 + q * 150;
          fio.setAttribute("y2", y); fio.setAttribute("opacity", q > 0 ? 1 : 0); mover(ar, -50, y, q > 0 ? 1 : 0);
        }
      };
    });

  // ============ FERRAMENTAS ============
  const ferramentas = acao("ferramentas", "Caixa de ferramentas", "dizer que o agente tem ferramentas para agir (ler arquivo, consultar agenda, buscar ata); as ferramentas saltam da caixa", "o assunto é um programa específico (use a peça dele)", { w: 340, h: 290 }, 2,
    "a caixa aparece e a chave inglesa e o martelo saltam para fora, balançando", [], (g, a) => {
      const chave = el("g", {}, g), mart = el("g", {}, g);
      el("rect", { x: -9, y: -20, width: 18, height: 110, rx: 9, ...a.f(C.creme) }, chave);
      el("path", { d: "M-18 -54A26 26 0 1 1 18 -54", ...a.s(a.flat ? C.tinta : C.creme, 17) }, chave);
      el("rect", { x: -9, y: -30, width: 18, height: 120, rx: 9, ...a.f(C.areia) }, mart);
      el("rect", { x: -40, y: -62, width: 80, height: 38, rx: 10, ...a.f(C.cerejaEsc) }, mart);
      const cx = el("g", {}, g);
      el("path", { d: "M-70 -22A70 56 0 0 1 70 -22", ...a.s(C.laranjaEsc, 14) }, cx);
      el("rect", { x: -130, y: -6, width: 260, height: 104, rx: 20, ...a.f(C.laranja) }, cx);
      if (!a.flat) { el("rect", { x: -130, y: -6, width: 260, height: 30, rx: 14, fill: C.laranjaEsc }, cx); el("rect", { x: -22, y: 10, width: 44, height: 24, rx: 8, fill: C.amarelo }, cx); el("path", { d: "M-108 40V84", ...a.s("#fff", 8), "stroke-opacity": .4 }, cx); }
      return (p) => {
        const s1 = pop(p, .15, .5), s2 = pop(p, .3, .65), b = Math.sin(p * Math.PI * 6) * 5 * clamp((p - .5) / .1) * (1 - clamp((p - .6) / .4));
        pv(chave, -58, -6, 1, -22 + b); chave.setAttribute("transform", `translate(-58 ${20 - 92 * s1}) rotate(${-22 + b})`); chave.setAttribute("opacity", s1 > 0 ? 1 : 0);
        mart.setAttribute("transform", `translate(54 ${20 - 74 * s2}) rotate(${20 - b})`); mart.setAttribute("opacity", s2 > 0 ? 1 : 0);
        mover(cx, 0, 0, pop(p, 0, .22));
      };
    });

  // ============ BIFURCAÇÃO ============
  const bifurcacao = acao("bifurcacao", "Bifurcação", "mostrar caminhos possíveis com o custo de cada um (crescer a área, escolher uma rota); o tronco se abre em três", "só existe um caminho (use seta)", { w: 540, h: 340 }, 2.6,
    "o tronco sobe, se abre em três ramos e cada ramo termina numa bolinha com o custo", [{ nome: "custos", padrao: ["R$ 40 mil", "R$ 120 mil", "R$ 300 mil"] }], (g, a, o) => {
      const cs = o.custos || ["R$ 40 mil", "R$ 120 mil", "R$ 300 mil"], cores = [C.verde, C.laranja, C.roxo], xs = [-180, 0, 180], ys = [-30, -50, -30];
      const ramos = xs.map((x, i) => el("path", { d: `M0 150C0 70 ${x} 90 ${x} ${ys[i]}`, pathLength: 1, ...a.s(C.creme, 14) }, g));
      const folhas = xs.map((x, i) => {
        const f = el("g", {}, g); el("circle", { r: 32, ...a.f(cores[i]), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 8 }, f);
        if (!a.flat) { const w = 36 + cs[i].length * 13; el("rect", { x: -w / 2, y: -100, width: w, height: 46, rx: 23, fill: C.creme }, f); txt(f, 0, -68, cs[i], 30, C.tinta, DISP); }
        return { f, x, y: ys[i] };
      });
      return (p) => {
        ramos.forEach((r, i) => traco(r, ease(clamp((p - .1 - i * .12) / .35))));
        folhas.forEach(({ f, x, y }, i) => mover(f, x, y, pop(p, .42 + i * .12, .62 + i * .12)));
      };
    });

  // ============ PLANO FURADO ============
  const plano_furado = acao("plano_furado", "Plano furado", "mostrar um plano que não fecha: onde há risco, dependência sem dono, número que não bate; a rachadura corta e abre furos", "o plano está saudável (use certo)", { w: 300, h: 240 }, 2.4,
    "o papel aparece, a rachadura corta de cima a baixo, o papel treme e abrem dois furos", [], (g, a) => {
      const cd = el("g", {}, g);
      el("rect", { x: -130, y: -100, width: 260, height: 200, rx: 20, ...a.f(C.creme) }, cd);
      let rach = null, f1 = null, f2 = null;
      if (!a.flat) {
        [[-60, 200], [-30, 150], [0, 180]].forEach(([y, w]) => el("rect", { x: -100, y, width: w, height: 14, rx: 7, fill: C.tinta, opacity: .2 }, cd));
        rach = el("path", { d: "M-20 -100L-4 -62L-30 -36L2 -6L-18 28L10 60L-2 100", pathLength: 1, ...a.s(C.cerejaEsc, 9) }, cd);
        f1 = el("g", {}, cd); el("circle", { r: 26, fill: C.tinta, stroke: C.cereja, "stroke-width": 7 }, f1);
        f2 = el("g", {}, cd); el("circle", { r: 20, fill: C.tinta, stroke: C.cereja, "stroke-width": 7 }, f2);
      }
      return (p) => {
        const tr = Math.sin(p * Math.PI * 14) * 5 * bump(p, .4, .65);
        mover(cd, tr, 0, pop(p, 0, .2), tr * .3);
        if (rach) { traco(rach, ease(clamp((p - .25) / .3))); mover(f1, -70, 50, pop(p, .55, .75)); mover(f2, 80, -50, pop(p, .65, .85)); }
      };
    });

  // ============ VOTO CONTRA ============
  const voto_contra = acao("voto_contra", "Voto contra", "mostrar a discordância ou o 'não fecha' de quem vota contra um plano; o polegar desce e balança", "é uma reprovação pessoal (a peça é só sobre ideias)", { w: 240, h: 260 }, 1.8,
    "o polegar para baixo aparece com um pulo e balança uma vez", [{ nome: "pele", padrao: C.areia }, { nome: "manga", padrao: C.cerejaEsc }], (g, a, o) => {
      const pele = o.pele || C.areia, manga = o.manga || C.cerejaEsc, w = el("g", {}, g), h = el("g", { transform: "scale(1 -1)" }, w);
      el("rect", { x: -104, y: -20, width: 54, height: 112, rx: 14, ...a.f(manga) }, h);
      for (let i = 0; i < 4; i++) el("rect", { x: -52, y: -12 + i * 28, width: 120, height: 28, rx: 14, ...a.f(pele) }, h);
      el("path", { d: "M-26 -10V-84", ...a.s(a.flat ? C.tinta : pele, 44) }, h);
      if (!a.flat) { for (let i = 1; i < 4; i++) el("path", { d: `M-30 ${-12 + i * 28}H62`, ...a.s(C.laranjaEsc, 3), "stroke-opacity": .35 }, h); el("path", { d: "M-100 8V76", ...a.s("#fff", 8), "stroke-opacity": .3 }, h); }
      return (p) => mover(w, 0, 14 * Math.sin(p * Math.PI * 4) * (1 - p), pop(p, 0, .25), 8 * Math.sin(p * Math.PI * 4) * (1 - p));
    });

  // ============ CADEADO ============
  const cadeado = acao("cadeado", "Cadeado", "dizer 'seguro', 'só você acessa', 'nada sai do seu computador'; a haste fecha com um tranco e uma onda confirma", "o assunto é bloqueio ou erro (use erro)", { w: 200, h: 250 }, 1.8,
    "a haste começa aberta, fecha com um tranco, o corpo dá um pulo e uma onda verde se abre", [], (g, a) => {
      const onda = a.flat ? null : el("circle", { cy: 20, r: 80, ...a.s(C.verde, 6), opacity: 0 }, g);
      const ha = el("g", {}, g), co = el("g", {}, g);
      el("path", { d: "M-46 -10V-52A46 46 0 0 1 46 -52V-10", ...a.s(C.verdeEsc, 26) }, ha);
      el("rect", { x: -76, y: -14, width: 152, height: 116, rx: 26, ...a.f(C.verde) }, co);
      if (!a.flat) { el("circle", { cy: 34, r: 16, fill: C.creme }, co); el("rect", { x: -6, y: 40, width: 12, height: 34, rx: 6, fill: C.creme }, co); el("path", { d: "M-56 10C-60 30 -58 50 -58 64", ...a.s("#fff", 8), "stroke-opacity": .45 }, co); }
      return (p) => {
        const ab = 1 - ease(clamp((p - .15) / .25));
        ha.setAttribute("transform", `translate(0 ${-24 * ab}) rotate(${-24 * ab} 46 -10)`);
        pv(co, 0, 44, 1 + .1 * bump(p, .38, .55));
        if (onda) { const q = clamp((p - .4) / .5); onda.setAttribute("r", lerp(80, 140, ease(q))); onda.setAttribute("opacity", q > 0 && q < 1 ? .7 * (1 - q) : 0); }
      };
    });

  // ============ PLATAFORMA ============
  const plataforma = acao("plataforma", "Plataforma", "dizer 'vai para a plataforma da empresa, com acesso controlado'; o prédio sobe, acende as janelas e ganha um cadeado", "a coisa fica só no computador da pessoa (use cadeado)", { w: 340, h: 340 }, 2.6,
    "o prédio sobe, as janelas acendem uma a uma, a bandeira abre e o cadeado trava na porta", [], (g, a) => {
      const pr = el("g", {}, g);
      el("rect", { x: -100, y: -60, width: 200, height: 170, rx: 14, ...a.f(C.roxo) }, pr);
      el("rect", { x: -112, y: -84, width: 224, height: 34, rx: 10, ...a.f(C.roxoEsc) }, pr);
      el("path", { d: "M0 -84V-140", ...a.s(C.tinta, 6) }, pr);
      const bd = el("polygon", { points: "0,-140 46,-124 0,-108", ...a.f(C.cereja) }, pr);
      const jan = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) jan.push(el("rect", { x: -78 + c * 56, y: -34 + r * 44, width: 36, height: 28, rx: 6, ...a.f(C.roxoEsc) }, pr));
      el("rect", { x: -28, y: 58, width: 56, height: 52, rx: 8, ...a.f(C.laranja) }, pr);
      const ck = el("g", {}, g);
      el("path", { d: "M80 74V62A16 16 0 0 1 112 62V74", ...a.s(C.verdeEsc, 9) }, ck); el("rect", { x: 70, y: 72, width: 52, height: 40, rx: 10, ...a.f(C.verde) }, ck);
      if (!a.flat) el("circle", { cx: 96, cy: 90, r: 6, fill: C.creme }, ck);
      return (p) => {
        const s = ease(clamp(p / .3)); pv(pr, 0, 110, 1, 0); pr.setAttribute("transform", `translate(0 110) scale(1 ${Math.max(.001, s)}) translate(0 -110)`);
        jan.forEach((j, i) => { if (!a.flat) j.setAttribute("fill", p > .35 + i * .07 ? C.amarelo : C.roxoEsc); });
        mover(ck, 0, 0, pop(p, .72, .92));
        bd.setAttribute("opacity", p > .5 ? 1 : 0);
      };
    });

  Object.assign(EL, { ciclo, bloco_peca, grafo, teia, ferramentas, bifurcacao, plano_furado, voto_contra, cadeado, plataforma });
})();
