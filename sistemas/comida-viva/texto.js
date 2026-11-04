// Família TEXTO: o texto que se move. Letra a letra, palavras que sobem, contorno que enche, carimbo, faixa que rola,
// roleta de palavras, riscado→novo e marca-texto. Mesmo estilo: letra chapada, sombra dura (cópia deslocada), sem contorno preto, sem blur.
// Origem = CENTRO do texto (linha de base ajustada). Todas devolvem { g, set(p, t) }; p = progresso 0..1 (a faixa usa t, em segundos).
// A largura das letras é medida com a fonte já carregada; antes disso a peça usa uma estimativa e se corrige sozinha.
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lim = (x) => clamp(x, 0, 1);
  const DISP = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const sb = (fs) => Math.max(4, Math.round(fs * .05));            // deslocamento da sombra dura
  const nova = (pai, x = 0, y = 0, s = 1, rot = 0) => { const g = el("g", {}, pai); g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`); return g; };
  const fontesOk = () => { try { return document.fonts.check('900 40px "Barlow Condensed"'); } catch (e) { return false; } };   // só vale com a fonte já carregada
  let med = null, nid = 0;
  const larg = (str, fs) => {
    if (!med) { const sv = el("svg", { width: 10, height: 10, style: "position:absolute;left:-99px;top:-99px;visibility:hidden" }, document.body); med = el("text", { style: DISP }, sv); }
    med.setAttribute("font-size", fs); med.textContent = str.replace(/ /g, " ");
    const w = med.getComputedTextLength(); return w > 0 ? w : str.length * fs * .46;
  };
  const guarda = (fn) => { let f = null; return () => { const ok = fontesOk(); if (ok !== f) { f = ok; fn(); } }; };   // refaz a medida quando a fonte chega
  const tx = (pai, x, y, str, fs, fill, anchor = "middle") => { const e = el("text", { x, y, "font-size": fs, "text-anchor": anchor, fill, style: DISP }, pai); e.textContent = str; return e; };
  const comSombra = (pai, x, y, str, fs, fill, anchor = "middle") => { const d = sb(fs); const a = tx(pai, x + d, y + d, str, fs, C.tinta, anchor); a.setAttribute("fill-opacity", .24); return tx(pai, x, y, str, fs, fill, anchor); };
  const BASE = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];
  const ficha = (id, nome, serve, nao, caixa, params, mov) => reg({ id, nome, familia: "texto", tipo: "texto", serve_para: serve, nao_usar_quando: nao, camada: "frente", caixa, parametros: [...BASE, ...params], movimento: mov });
  const mov = (duracao_s, descricao) => ({ param: "p", duracao_s, descricao, usa_t: false });

  // ---------- LETRAS: cada letra salta de baixo, uma depois da outra
  const letras = (pai, { x, y, s, rot, txt = "COMIDA", fs = 160, cor = C.creme } = {}) => {
    const g = nova(pai, x, y, s, rot), d = sb(fs);
    const cs = [...txt].map((ch) => { const c = el("g", {}, g); if (ch !== " ") { const a = tx(c, d, d, ch, fs, C.tinta); a.setAttribute("fill-opacity", .24); tx(c, 0, 0, ch, fs, cor); } return { g: c, ch, x: 0 }; });
    const lay = guarda(() => { const ws = cs.map((c) => larg(c.ch, fs)), tot = ws.reduce((a, b) => a + b, 0); let xx = -tot / 2; cs.forEach((c, i) => { c.x = xx + ws[i] / 2; xx += ws[i]; }); });
    return { g, set(p) { lay(); cs.forEach((c, i) => { const u = back(lim((p - i * .55 / Math.max(cs.length, 1)) / .4));
      c.g.setAttribute("opacity", lim(u * 5)); c.g.setAttribute("transform", `translate(${c.x} ${fs * .35 + (1 - u) * fs * .5}) rotate(${(1 - u) * -14}) scale(${Math.max(u, .001)})`); }); } };
  };
  ficha("letras", "Letra a letra", "título curto de impacto: cada letra salta de baixo, em sequência", "o texto passa de ~14 letras (use palavras)", { w: 460, h: 220 },
    [{ nome: "txt", padrao: "COMIDA" }, { nome: "fs", padrao: 160 }, { nome: "cor", padrao: "creme" }], mov(1.2, "as letras saltam de baixo, com leve giro, da esquerda para a direita"));

  // ---------- PALAVRAS: cada linha sobe de trás de uma máscara
  const palavras = (pai, { x, y, s, rot, linhas = ["do campo", "pra mesa"], fs = 130, cores = [C.creme, C.amarelo] } = {}) => {
    const g = nova(pai, x, y, s, rot), n = linhas.length;
    const it = linhas.map((t, i) => { const yy = (i - (n - 1) / 2) * fs * 1.05, id = "pl" + (nid++);
      el("clipPath", { id }, el("defs", {}, g)).appendChild(el("rect", { x: -1400, y: yy - fs * .75, width: 2800, height: fs * 1.12 }, null));
      const mv = el("g", {}, el("g", { "clip-path": `url(#${id})` }, g)); comSombra(mv, 0, yy + fs * .3, t, fs, cores[i % cores.length]); return { mv }; });
    return { g, set(p) { it.forEach((o, i) => o.mv.setAttribute("transform", `translate(0 ${(1 - ease(lim((p - i * .25) / .45))) * fs * 1.2})`)); } };
  };
  ficha("palavras", "Palavras que sobem", "frase de 1 a 3 linhas: cada linha sobe de trás de uma máscara, uma depois da outra", "é uma palavra só (use letras ou carimbo)", { w: 700, h: 300 },
    [{ nome: "linhas", padrao: "[\"do campo\",\"pra mesa\"]" }, { nome: "fs", padrao: 130 }, { nome: "cores", padrao: "[creme, amarelo]" }], mov(1.2, "cada linha sobe de trás da máscara, com 0,25 de atraso entre elas"));

  // ---------- VAZADO: só o contorno, e o preenchimento sobe como líquido
  const vazado = (pai, { x, y, s, rot, txt = "FRESCO", fs = 300, cor = C.verde } = {}) => {
    const g = nova(pai, x, y, s, rot), id = "vz" + (nid++), b = fs * .35;
    const sh = tx(g, sb(fs), b + sb(fs), txt, fs, C.tinta); sh.setAttribute("fill-opacity", .24);
    const o = tx(g, 0, b, txt, fs, "none"); o.setAttribute("stroke", cor); o.setAttribute("stroke-width", fs * .035); o.setAttribute("stroke-linejoin", "round");
    const cr = el("rect", { x: -1400, width: 2800, height: fs * .9 }, el("clipPath", { id }, el("defs", {}, g)));
    tx(el("g", { "clip-path": `url(#${id})` }, g), 0, b, txt, fs, cor);
    return { g, set(p) { cr.setAttribute("y", b + fs * .05 - fs * .85 * ease(lim(p))); } };
  };
  ficha("vazado", "Contorno que enche", "palavra-chave grande que 'se completa': o contorno aparece vazio e a cor sobe", "o fundo é da mesma cor do contorno (some)", { w: 700, h: 340 },
    [{ nome: "txt", padrao: "FRESCO" }, { nome: "fs", padrao: 300 }, { nome: "cor", padrao: "verde" }], mov(1.4, "o preenchimento sobe de baixo para cima dentro do contorno da palavra"));

  // ---------- CARIMBO: o selo bate na tela, treme e fica
  const carimbo = (pai, { x, y, s, rot = -8, txt = "APROVADO", fs = 150, cor = C.cereja } = {}) => {
    const g = nova(pai, x, y, s, rot), a = el("g", {}, g), d = sb(fs), sw = fs * .07;
    const sm = el("rect", { fill: "none", stroke: C.tinta, "stroke-opacity": .24, "stroke-width": sw, rx: fs * .12 }, a), r1 = el("rect", { fill: "none", stroke: cor, "stroke-width": sw, rx: fs * .12 }, a), r2 = el("rect", { fill: "none", stroke: cor, "stroke-width": fs * .025, rx: fs * .06 }, a);
    comSombra(a, 0, fs * .35, txt, fs, cor);
    const lay = guarda(() => { const w = larg(txt, fs) + fs * .7, h = fs * 1.2;
      [[sm, d, d, 0], [r1, 0, 0, 0], [r2, 0, 0, fs * .12]].forEach(([r, ox, oy, ins]) => { r.setAttribute("x", -w / 2 + ox + ins); r.setAttribute("y", -h / 2 + oy + ins); r.setAttribute("width", w - ins * 2); r.setAttribute("height", h - ins * 2); }); });
    return { g, set(p) { lay(); const u = lim(p / .4), bate = p < .4, sc = bate ? 2.6 - 1.6 * u * u : 1, tr = bate ? 0 : (1 - lim((p - .4) / .35)) * Math.sin((p - .4) * 70) * 12;
      a.setAttribute("opacity", lim(u * 4)); a.setAttribute("transform", `translate(${tr} 0) scale(${sc})`); } };
  };
  ficha("carimbo", "Carimbo", "selo de confirmação ou resultado: APROVADO, NOVO, GRÁTIS; bate na tela e treme", "o texto é uma frase (cabe uma palavra ou duas)", { w: 560, h: 200 },
    [{ nome: "txt", padrao: "APROVADO" }, { nome: "fs", padrao: 150 }, { nome: "cor", padrao: "cereja" }], mov(.9, "desce de grande, bate em 0,4 do tempo e treme até parar"));

  // ---------- FAIXA QUE ROLA (marquee): uma tira inclinada com o texto andando sem parar
  const faixa = (pai, { x, y, s, rot = -4, txt = "COMIDA DE VERDADE", fs = 110, cor = C.creme, tc = C.cereja, vel = 220 } = {}) => {
    const g = nova(pai, x, y, s, rot), h = fs * 1.5, d = sb(fs);
    el("rect", { x: -900 + d, y: -h / 2 + d, width: 1800, height: h, fill: C.tinta, "fill-opacity": .24 }, g); el("rect", { x: -900, y: -h / 2, width: 1800, height: h, fill: cor }, g);
    const it = el("g", {}, g); let un = 1;
    const lay = guarda(() => { it.replaceChildren(); un = larg(txt, fs) + fs * 1.4; const k = Math.ceil(1900 / un) + 2;
      for (let i = 0; i < k; i++) { tx(it, i * un, fs * .3, txt, fs, tc, "start"); el("circle", { cx: i * un + larg(txt, fs) + fs * .7, cy: 0, r: fs * .12, fill: tc }, it); } });
    return { g, set(p, t = 0) { lay(); const o = (((t * vel) % un) + un) % un; it.setAttribute("transform", `translate(${-950 - o} 0)`); } };
  };
  ficha("faixa", "Faixa que rola", "tira de palavras-chave andando (marquee): ritmo, energia, fundo de apresentação", "o texto precisa ser lido com calma", { w: 1080, h: 170 },
    [{ nome: "txt", padrao: "COMIDA DE VERDADE" }, { nome: "fs", padrao: 110 }, { nome: "cor", padrao: "creme" }, { nome: "tc", padrao: "cereja" }, { nome: "vel", padrao: "220 (negativo anda para o outro lado)" }],
    { param: "t", duracao_s: null, descricao: "o texto anda sem parar, em volta; vel é px por segundo", usa_t: true });

  // ---------- ROLETA: um visor que gira e para na última palavra
  const roleta = (pai, { x, y, s, rot, palavras: ps = ["lento", "caro", "chato", "gostoso"], fs = 190, cor = C.creme, tc = C.cereja } = {}) => {
    const g = nova(pai, x, y, s, rot), h = fs * 1.3, d = sb(fs), id = "rl" + (nid++);
    const sm = el("rect", { y: -h / 2 + d, height: h, rx: fs * .16, fill: C.tinta, "fill-opacity": .24 }, g), cd = el("rect", { y: -h / 2, height: h, rx: fs * .16, fill: cor }, g);
    const cr = el("rect", { y: -h / 2, height: h, rx: fs * .16 }, el("clipPath", { id }, el("defs", {}, g))), lista = el("g", {}, el("g", { "clip-path": `url(#${id})` }, g));
    const ws = ps.map((w, i) => tx(lista, 0, i * h + fs * .3, w, fs, tc));
    const lay = guarda(() => { const w = Math.max(...ps.map((q) => larg(q, fs))) + fs * .7; [sm, cd, cr].forEach((r, i) => { r.setAttribute("x", -w / 2 + (i === 0 ? d : 0)); r.setAttribute("width", w); }); });
    return { g, set(p) { lay(); const n = ps.length - 1, v = lim(p) * n, fl = Math.min(Math.floor(v), n), fr = v - fl, pos = fl + (fl < n ? back(lim(fr * 1.4)) : 0); lista.setAttribute("transform", `translate(0 ${-pos * h})`); } };
  };
  ficha("roleta", "Roleta de palavras", "trocar uma palavra por outra: lento→gostoso, antes→depois; para na última", "são mais de 6 palavras", { w: 520, h: 250 },
    [{ nome: "palavras", padrao: "[\"lento\",\"caro\",\"chato\",\"gostoso\"]" }, { nome: "fs", padrao: 190 }, { nome: "cor", padrao: "creme" }, { nome: "tc", padrao: "cereja" }], mov(1.6, "o visor roda de palavra em palavra, cada uma com um tranco, e para na última"));

  // ---------- RISCADO: a palavra velha é riscada e a nova entra embaixo
  const riscado = (pai, { x, y, s, rot, velho = "complicado", novo = "simples", fs = 130, cor = C.creme, risco = C.amarelo, cnovo = C.amarelo } = {}) => {
    const g = nova(pai, x, y, s, rot), v = el("g", {}, g), n = el("g", {}, g), yv = -fs * .5, yn = fs * .62;
    comSombra(v, 0, yv + fs * .3, velho, fs, cor); const rk = el("rect", { x: 0, y: yv - fs * .06, width: 10, height: fs * .12, rx: fs * .06, fill: risco }, g);
    comSombra(n, 0, yn + fs * .3, novo, fs * 1.25, cnovo);
    const lay = guarda(() => { const w = larg(velho, fs) + fs * .3; rk.dataset.w = w; rk.setAttribute("x", -w / 2); });
    return { g, set(p) { lay(); const w = +rk.dataset.w || 300, a = back(lim(p / .3)), r = ease(lim((p - .3) / .25)), b = back(lim((p - .6) / .35));
      v.setAttribute("opacity", lim(p / .1)); v.setAttribute("transform", `translate(0 ${yv}) scale(${.6 + .4 * a}) translate(0 ${-yv}) translate(0 ${r * 8})`); v.setAttribute("fill-opacity", 1 - .4 * r);
      rk.setAttribute("width", Math.max(w * r, .1)); rk.setAttribute("opacity", r > 0 ? 1 : 0);
      n.setAttribute("opacity", lim((p - .6) / .1)); n.setAttribute("transform", `translate(0 ${yn}) scale(${Math.max(.5 + .5 * b, .001)}) translate(0 ${-yn})`); } };
  };
  ficha("riscado", "Riscado e novo", "mudança de ideia: 'complicado' riscado e 'simples' entra embaixo; antes→depois, mito→verdade", "as duas palavras são longas (passam de 12 letras)", { w: 720, h: 360 },
    [{ nome: "velho", padrao: "complicado" }, { nome: "novo", padrao: "simples" }, { nome: "fs", padrao: 130 }, { nome: "risco", padrao: "amarelo" }], mov(1.5, "a palavra velha aparece, ganha um risco e a nova salta embaixo, maior"));

  // ---------- MARCA-TEXTO: uma tarja de cor varre o texto, da esquerda para a direita
  const marcaTexto = (pai, { x, y, s, rot, txt = "sem conservante", fs = 110, tc = C.tinta, cor = C.amarelo } = {}) => {
    const g = nova(pai, x, y, s, rot), tarja = el("rect", { y: -fs * .5, height: fs * 1.0, fill: cor, transform: "skewX(-8)" }, g), t = tx(g, 0, fs * .3, txt, fs, tc);
    const lay = guarda(() => { const w = larg(txt, fs) + fs * .5; tarja.dataset.w = w; tarja.setAttribute("x", -w / 2); });
    return { g, set(p) { lay(); const w = +tarja.dataset.w || 400, e = ease(lim((p - .1) / .5)); tarja.setAttribute("width", Math.max(w * e, .1)); const u = back(lim(p / .3)); t.setAttribute("opacity", lim(p / .1)); t.setAttribute("transform", `translate(0 ${(1 - u) * fs * .3})`); } };
  };
  ficha("marca_texto", "Marca-texto", "destacar uma frase dentro do vídeo: a tarja de cor varre o texto como um marca-texto", "a frase é longa (cabe ~20 letras por linha)", { w: 700, h: 130 },
    [{ nome: "txt", padrao: "sem conservante" }, { nome: "fs", padrao: 110 }, { nome: "tc", padrao: "tinta" }, { nome: "cor", padrao: "amarelo" }], mov(1.0, "a tarja varre da esquerda para a direita e o texto sobe junto"));

  Object.assign(EL, { letras, palavras, vazado, carimbo, faixa, roleta, riscado, marca_texto: marcaTexto });
})();
