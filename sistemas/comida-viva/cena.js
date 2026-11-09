// Família CENA (molduras de composição do reel 9:16): janela_rosto, moldura_captura e overlay_gancho.
// São as três peças que montam a tela de um reel com apresentador e demonstração: o rosto em janela, a captura de tela com destaque
// e o texto de gancho dos primeiros segundos. O vídeo real entra DENTRO das molduras; as peças só desenham o contorno e o destaque.
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
    reg({ id, nome, familia: "cena", tipo: "layout", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };
  const pop = (p, u0, u1) => Math.max(0, back(clamp((p - u0) / (u1 - u0))));
  const traco = (e, u) => { e.setAttribute("stroke-dasharray", "1 1"); e.setAttribute("stroke-dashoffset", 1 - u); e.setAttribute("opacity", u > 0 ? 1 : 0); };
  let uid = 0;

  // ============ JANELA DO ROSTO ============
  const janela_rosto = acao("janela_rosto", "Janela do rosto", "moldurar o vídeo do apresentador em cima ou no canto do reel; o vídeo real entra no recorte e a peça só desenha a moldura", "o apresentador ocupa a tela inteira (não use moldura)", { w: 400, h: 520 }, 1.6,
    "a moldura cresce com um pulo e se assenta; com forma circulo, retrato ou quadrado", [{ nome: "forma", padrao: "retrato" }, { nome: "cor", padrao: C.cereja }], (g, a, o) => {
      const f = o.forma || "retrato", cor = o.cor || C.cereja, W = f === "retrato" ? 300 : 340, H = f === "retrato" ? 400 : 340, R = f === "circulo" ? 170 : 34, w = el("g", {}, g);
      el("rect", { x: -W / 2 - 14, y: -H / 2 - 14, width: W + 28, height: H + 28, rx: R + 14, ...a.f(cor) }, w);
      if (!a.flat) {
        const id = "jr" + (++uid), cp = el("clipPath", { id }, w); el("rect", { x: -W / 2, y: -H / 2, width: W, height: H, rx: R }, cp);
        const c = el("g", { "clip-path": `url(#${id})` }, w);
        el("rect", { x: -W / 2, y: -H / 2, width: W, height: H, fill: C.creme }, c);
        el("path", { d: `M${-W * .42} ${H / 2}C${-W * .42} ${H * .14} ${-W * .2} ${H * .06} 0 ${H * .06}C${W * .2} ${H * .06} ${W * .42} ${H * .14} ${W * .42} ${H / 2}Z`, fill: C.lilas }, c);
        el("circle", { cy: -H * .1, r: Math.min(W, H) * .2, fill: C.areia }, c);
        el("rect", { x: -W / 2, y: H / 2 - 52, width: W, height: 52, fill: C.roxo, opacity: .9 }, c); txt(c, 0, H / 2 - 16, "SEU ROSTO AQUI", 32, C.creme, DISP);
        el("circle", { cx: W / 2 - 4 - (f === "circulo" ? 38 : 0), cy: -H / 2 + (f === "circulo" ? 46 : 4), r: 0 }, w);
      }
      return (p) => { mover(w, 0, 0, pop(p, 0, .35), lerp(-4, 0, ease(clamp(p / .4)))); w.setAttribute("opacity", p > 0 ? 1 : 0); };
    });

  // ============ MOLDURA DE CAPTURA ============
  const moldura_captura = acao("moldura_captura", "Moldura de captura", "enquadrar a gravação de tela (Obsidian, Claude Code) e destacar a área que importa com zoom; o resto escurece", "a tela inteira é o assunto (não use destaque)", { w: 700, h: 460 }, 2.8,
    "a janela aparece, o resto escurece e um retângulo cereja se desenha em volta da área que importa e pulsa", [{ nome: "destaque", padrao: [10, -10, 270, 110] }], (g, a, o) => {
      const d = o.destaque || [10, -10, 270, 110], [hx, hy, hw, hh] = d, w = el("g", {}, g);
      el("rect", { x: -340, y: -210, width: 680, height: 420, rx: 28, ...a.f(C.creme) }, w);
      el("rect", { x: -340, y: -210, width: 680, height: 62, rx: 28, ...a.f(C.lilas) }, w); el("rect", { x: -340, y: -176, width: 680, height: 28, ...a.f(C.lilas) }, w);
      let dim = null, bx = null;
      if (!a.flat) {
        [C.cereja, C.amarelo, C.verde].forEach((c, i) => el("circle", { cx: -304 + i * 32, cy: -179, r: 10, fill: c }, w));
        [[-310, -120, 300], [-310, -88, 220], [-310, -56, 340], [-310, -24, 180], [-310, 8, 280], [-310, 40, 220], [-310, 72, 320], [-310, 104, 160], [-310, 136, 260]].forEach(([x, y, ww]) => el("rect", { x, y, width: ww, height: 14, rx: 7, fill: C.tinta, opacity: .2 }, w));
        [[40, -120, 230], [40, -88, 180], [40, -56, 250], [40, -24, 150], [40, 8, 220], [40, 40, 170]].forEach(([x, y, ww]) => el("rect", { x, y, width: ww, height: 14, rx: 7, fill: C.roxo, opacity: .3 }, w));
        dim = el("path", { d: `M-340 -148H340V210H-340ZM${hx} ${hy}V${hy + hh}H${hx + hw}V${hy}Z`, "fill-rule": "evenodd", fill: C.tinta, opacity: 0 }, w);
        bx = el("rect", { x: hx, y: hy, width: hw, height: hh, rx: 12, pathLength: 1, ...a.s(C.cereja, 8) }, w);
      }
      return (p) => {
        mover(w, 0, 0, pop(p, 0, .22));
        if (dim) {
          dim.setAttribute("opacity", .55 * ease(clamp((p - .3) / .2))); traco(bx, ease(clamp((p - .4) / .3)));
          const pu = 1 + .04 * Math.max(0, Math.sin(Math.PI * clamp((p - .75) / .25) * 2)), cx = hx + hw / 2, cy = hy + hh / 2;
          bx.setAttribute("transform", `translate(${cx} ${cy}) scale(${pu}) translate(${-cx} ${-cy})`);
        }
      };
    });

  // ============ OVERLAY DE GANCHO ============
  const quebra = (t) => { const ps = t.trim().split(/\s+/); if (ps.length < 3 || t.length <= 14) return [t]; let melhor = 1, dif = 1e9; for (let i = 1; i < ps.length; i++) { const d = Math.abs(ps.slice(0, i).join(" ").length - ps.slice(i).join(" ").length); if (d < dif) { dif = d; melhor = i; } } return [ps.slice(0, melhor).join(" "), ps.slice(melhor).join(" ")]; };
  const overlay_gancho = acao("overlay_gancho", "Overlay de gancho", "abrir o reel com a frase que prende nos 5 primeiros segundos (a tela inicial do vídeo); a faixa abre e as linhas sobem", "a frase passa de 8 palavras (corte antes)", { w: 960, h: 340 }, 2.2,
    "a faixa cereja abre de baixo para cima, as linhas sobem uma a uma e o sublinhado amarelo se desenha na última", [{ nome: "texto", padrao: "ESPALHADO EM 40 LUGARES" }, { nome: "cor", padrao: C.cereja }, { nome: "tc", padrao: C.creme }, { nome: "fs", padrao: 112 }], (g, a, o) => {
      const t = String(o.texto || "ESPALHADO EM 40 LUGARES").toUpperCase(), fs = o.fs || 112, ls = quebra(t), mx = Math.max(...ls.map((l) => l.length));
      const W = Math.min(940, mx * .44 * fs + 100), H = ls.length * fs * .95 + 64, band = el("g", {}, g);
      el("rect", { x: -W / 2, y: -H / 2, width: W, height: H, rx: 30, ...a.f(o.cor || C.cereja) }, band);
      const linhas = [];
      let mk = null;
      if (!a.flat) {
        ls.forEach((l, i) => { const y = -H / 2 + 32 + fs * .82 + i * fs * .95, e = txt(band, 0, y, l, fs, o.tc || C.creme, DISP); linhas.push({ e, y }); });
        const ult = ls[ls.length - 1], uw = ult.length * .44 * fs, yb = linhas[linhas.length - 1].y + 12;
        mk = el("path", { d: `M${-uw / 2} ${yb}H${uw / 2}`, pathLength: 1, ...a.s(C.amarelo, 14) }, band);
      }
      return (p) => {
        const q = ease(clamp(p / .22)); band.setAttribute("transform", `scale(1 ${Math.max(.001, q)})`);
        linhas.forEach(({ e, y }, i) => { const u = ease(clamp((p - .15 - i * .14) / .25)); e.setAttribute("transform", `translate(0 ${(1 - u) * 40})`); e.setAttribute("opacity", u); });
        if (mk) traco(mk, ease(clamp((p - .55) / .3)));
      };
    });

  Object.assign(EL, { janela_rosto, moldura_captura, overlay_gancho });
})();
