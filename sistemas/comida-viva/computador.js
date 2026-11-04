// Família COMPUTADOR: pasta, documento, janela, terminal, tabela, imagem, cursor, balão de chat, fluxo de informação,
// nuvem, banco de dados, engrenagem, lupa, checklist, calendário e e-mail. Mesmo estilo do resto: formas chapadas, luz e sombra dura,
// sem contorno preto, sem blur. Origem = CENTRO da peça. Peças animadas devolvem { g, set(p, t) }.
(() => {
  const { C, el, clamp, ease, back, SOMBRA, rnd, reg } = EL;
  const lim = (x) => clamp(x, 0, 1), lerp = (a, b, u) => a + (b - a) * u;
  const nova = (pai, x = 0, y = 0, s = 1, rot = 0) => { const g = el("g", {}, pai); g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`); return g; };
  const UI = 'font-family:Outfit,"Segoe UI",sans-serif;font-weight:700;text-transform:none';
  const DISP = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const MONO = 'font-family:Consolas,"Courier New",monospace;font-weight:700;text-transform:none';
  const txt = (pai, x, y, t, fs, fill, estilo = UI, anchor = "start") => { const e = el("text", { x, y, "font-size": fs, fill, "text-anchor": anchor, style: estilo }, pai); e.textContent = t; return e; };
  const sombra = (pai, x, y, w, h, rx) => el("rect", { x: x + 14, y: y + 12, width: w, height: h, rx, ...SOMBRA }, pai);
  const BASE = [{ nome: "x", padrao: 0 }, { nome: "y", padrao: 0 }, { nome: "s", padrao: 1 }, { nome: "rot", padrao: 0 }];
  const ficha = (id, nome, tipo, serve, nao, caixa, params, mov) => reg({ id, nome, familia: "computador", tipo, serve_para: serve, nao_usar_quando: nao, camada: "meio", caixa, parametros: [...BASE, ...params], movimento: mov });
  const mov = (duracao_s, descricao, usa_t = false) => ({ param: "p", duracao_s, descricao, usa_t });
  const LINHA = "#DDD3E4";

  // ---------- PASTA: a aba, o fundo, três folhas que sobem e a frente que se abre
  const pasta = (pai, { x, y, s, rot, cor = C.amarelo, corEsc = "#D6B900", rotulo = "" } = {}) => {
    const g = nova(pai, x, y, s, rot); sombra(g, -150, -82, 300, 200, 26);
    el("path", { d: "M-150 -56V-92Q-150 -108 -134 -108H-62Q-48 -108 -40 -96L-30 -82H126Q150 -82 150 -58V94Q150 118 126 118H-126Q-150 118 -150 94Z", fill: corEsc }, g);
    const folhas = [0, 1, 2].map((i) => { const f = el("g", {}, g); el("rect", { x: -118, y: -36, width: 236, height: 150, rx: 12, fill: i === 1 ? C.creme : "#fff" }, f);
      [0, 1, 2].forEach((k) => el("rect", { x: -92, y: -8 + k * 24, width: 150 - k * 22 + (i === 2 ? 40 : 0), height: 10, rx: 5, fill: i === 1 ? C.rosa : LINHA }, f)); return f; });
    const frente = el("g", {}, g);
    el("path", { d: "M-150 -34Q-150 -52 -132 -52H132Q150 -52 150 -34V94Q150 118 126 118H-126Q-150 118 -150 94Z", fill: cor }, frente);
    el("path", { d: "M-130 -41H130", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", "stroke-opacity": .5 }, frente);
    if (rotulo) txt(frente, 0, 66, rotulo, 42, C.tinta, DISP, "middle").setAttribute("fill-opacity", .75);
    return { g, set(p) { const e = ease(lim(p)); folhas.forEach((f, i) => f.setAttribute("transform", `translate(${(i - 1) * 16 * e} ${-(70 + i * 44) * e}) rotate(${(i - 1) * 8 * e} 0 90)`));
      frente.setAttribute("transform", `translate(0 118) scale(1 ${1 - .24 * e}) translate(0 -118)`); } };
  };
  ficha("pasta", "Pasta", "acao", "guardar e abrir informação: arquivos, contexto, 'second brain', projetos", "o assunto é comida ou não envolve guardar informação", { w: 300, h: 230 },
    [{ nome: "cor", padrao: "amarelo" }, { nome: "rotulo", padrao: "" }], mov(1.6, "a frente da pasta se abre e três folhas sobem em leque"));

  // ---------- DOCUMENTO: a folha com a dobra e linhas que se escrevem
  const documento = (pai, { x, y, s, rot, acento = C.cereja, tipo = "texto" } = {}) => {
    const g = nova(pai, x, y, s, rot), d = "M-90 -97Q-90 -115 -72 -115H42L90 -67V97Q90 115 72 115H-72Q-90 115 -90 97Z";
    el("path", { d, transform: "translate(14 12)", ...SOMBRA }, g); el("path", { d, fill: "#fff" }, g); el("path", { d: "M42 -115V-85Q42 -67 60 -67H90Z", fill: C.areia }, g);
    el("rect", { x: -66, y: -86, width: 92, height: 16, rx: 8, fill: acento }, g);
    const larg = [136, 120, 136, 100, 128, 72], linhas = larg.map((w, i) => { const l = el("g", {}, g);
      if (tipo === "lista") { el("circle", { cx: -62, cy: -42 + i * 28 + 6, r: 6, fill: acento }, l); el("rect", { x: -44, y: -42 + i * 28, width: w - 22, height: 12, rx: 6, fill: LINHA }, l); }
      else el("rect", { x: -66, y: -42 + i * 28, width: w, height: 12, rx: 6, fill: LINHA }, l); return l; });
    return { g, set(p) { linhas.forEach((l, i) => { const f = lim((p - i * .12) / .3); l.setAttribute("transform", `translate(-66 0) scale(${Math.max(f, .001)} 1) translate(66 0)`); l.setAttribute("opacity", f > 0 ? 1 : 0); }); } };
  };
  ficha("documento", "Documento", "acao", "um texto, nota, ata, relatório ou lista; as linhas se escrevem uma a uma", "o assunto é imagem ou número (use imagem ou tabela)", { w: 180, h: 230 },
    [{ nome: "acento", padrao: "cereja" }, { nome: "tipo", padrao: "texto|lista" }], mov(1.4, "as seis linhas aparecem da esquerda para a direita, em sequência"));

  // ---------- JANELA: barra de título com três bolinhas e um corpo onde cabe outra peça
  const janela = (pai, { x, y, s, rot, w = 520, h = 380, titulo = "", barra = C.roxo, corpo = C.creme } = {}) => {
    const g = nova(pai, x, y, s, rot);
    sombra(g, -w / 2, -h / 2, w, h, 22); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 22, fill: corpo }, g);
    el("path", { d: `M${-w / 2} ${-h / 2 + 56}V${-h / 2 + 22}Q${-w / 2} ${-h / 2} ${-w / 2 + 22} ${-h / 2}H${w / 2 - 22}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 22}V${-h / 2 + 56}Z`, fill: barra }, g);
    [C.cereja, C.amarelo, C.menta].forEach((c, i) => el("circle", { cx: -w / 2 + 28 + i * 26, cy: -h / 2 + 28, r: 8, fill: c }, g));
    if (titulo) txt(g, 0, -h / 2 + 37, titulo, 24, C.creme, UI, "middle");
    const conteudo = nova(g, -w / 2, -h / 2 + 56, 1, 0); conteudo.w = w; conteudo.h = h - 56;
    return { g, conteudo, set() {} };
  };
  ficha("janela", "Janela de aplicativo", "objeto", "um aplicativo ou site; recebe outra peça dentro (tabela, gráfico, texto)", "o assunto é físico, sem tela", { w: 520, h: 380 },
    [{ nome: "w", padrao: 520 }, { nome: "h", padrao: 380 }, { nome: "titulo", padrao: "" }, { nome: "barra", padrao: "roxo" }], null);

  // ---------- TERMINAL: janela escura com linhas digitadas e cursor piscando
  const terminal = (pai, { x, y, s, rot, w = 540, h = 340, linhas = ["$ ler pasta", "> 12 notas lidas", "$ atualizar", "> 3 notas novas"] } = {}) => {
    const g = nova(pai, x, y, s, rot);
    sombra(g, -w / 2, -h / 2, w, h, 22); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 22, fill: C.tinta }, g);
    el("path", { d: `M${-w / 2} ${-h / 2 + 52}V${-h / 2 + 22}Q${-w / 2} ${-h / 2} ${-w / 2 + 22} ${-h / 2}H${w / 2 - 22}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 22}V${-h / 2 + 52}Z`, fill: C.roxoEsc || "#6F2275" }, g);
    [C.cereja, C.amarelo, C.menta].forEach((c, i) => el("circle", { cx: -w / 2 + 28 + i * 26, cy: -h / 2 + 26, r: 8, fill: c }, g));
    const total = linhas.reduce((a, l) => a + l.length, 0), els = linhas.map((l, i) => txt(g, -w / 2 + 28, -h / 2 + 100 + i * 52, "", 30, l.startsWith("$") ? C.menta : C.creme, MONO));
    const cur = el("rect", { width: 16, height: 32, fill: C.amarelo }, g);
    return { g, set(p, t = 0) { let n = Math.floor(lim(p) * total), ult = 0;
      linhas.forEach((l, i) => { const k = Math.max(0, Math.min(l.length, n)); els[i].textContent = l.slice(0, k); n -= l.length; if (k > 0) ult = i; });
      const k = els[ult].textContent.length; cur.setAttribute("x", -w / 2 + 28 + k * 18); cur.setAttribute("y", -h / 2 + 100 + ult * 52 - 26); cur.setAttribute("opacity", Math.floor(t * 2.5) % 2 === 0 || p < 1 ? 1 : 0); } };
  };
  ficha("terminal", "Terminal", "acao", "código, comando, 'o agente executa'; as linhas são digitadas", "o público não é técnico e o assunto não tem código", { w: 540, h: 340 },
    [{ nome: "linhas", padrao: "lista de textos; '$' vira verde" }], mov(2.6, "as linhas são digitadas letra a letra e o cursor pisca", true));

  // ---------- TABELA: cabeçalho colorido e linhas que entram em sequência, com uma linha em destaque
  const tabela = (pai, { x, y, s, rot, w = 560, colunas = ["Pessoa", "Projeto", "Status"], linhas = [["Ana", "Site", "Feito"], ["Bruno", "App", "Em curso"], ["Carla", "Loja", "Novo"], ["Davi", "Blog", "Feito"]], destaque = 1, cor = C.cereja } = {}) => {
    const g = nova(pai, x, y, s, rot), hH = 62, rH = 56, h = hH + rH * linhas.length, cw = w / colunas.length;
    const sh = sombra(g, -w / 2, -h / 2, w, h, 20);
    const cab = el("g", {}, g); el("path", { d: `M${-w / 2} ${-h / 2 + hH}V${-h / 2 + 20}Q${-w / 2} ${-h / 2} ${-w / 2 + 20} ${-h / 2}H${w / 2 - 20}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 20}V${-h / 2 + hH}Z`, fill: cor }, cab);
    colunas.forEach((c, i) => txt(cab, -w / 2 + i * cw + 20, -h / 2 + 41, c, 26, C.creme, UI));
    const rs = linhas.map((l, r) => { const gr = el("g", {}, g), yy = -h / 2 + hH + r * rH, ult = r === linhas.length - 1;
      el("rect", { x: -w / 2, y: yy, width: w, height: rH + (ult ? 0 : .5), fill: r === destaque ? C.amarelo : (r % 2 ? C.lilas : C.creme) }, gr);
      if (ult) el("path", { d: `M${-w / 2} ${yy}H${w / 2}V${yy + rH - 20}Q${w / 2} ${yy + rH} ${w / 2 - 20} ${yy + rH}H${-w / 2 + 20}Q${-w / 2} ${yy + rH} ${-w / 2} ${yy + rH - 20}Z`, fill: r === destaque ? C.amarelo : (r % 2 ? C.lilas : C.creme) }, gr);
      l.forEach((c, i) => txt(gr, -w / 2 + i * cw + 20, yy + 37, c, 25, C.tinta, UI)); return gr; });
    return { g, set(p) { sh.setAttribute("opacity", lim(p / .12) * .24); cab.setAttribute("opacity", lim(p / .12)); rs.forEach((r, i) => { const u = lim((p - .12 - i * .16) / .2); r.setAttribute("opacity", u); r.setAttribute("transform", `translate(${(1 - ease(u)) * -40} 0)`); }); } };
  };
  ficha("tabela", "Tabela", "acao", "dados organizados em linhas e colunas; uma linha pode ficar em destaque", "são mais de 6 linhas ou 4 colunas (não cabe legível)", { w: 560, h: 286 },
    [{ nome: "colunas", padrao: "lista de títulos" }, { nome: "linhas", padrao: "matriz de textos" }, { nome: "destaque", padrao: 1 }], mov(1.8, "o cabeçalho aparece e as linhas entram da esquerda, uma a uma"));

  // ---------- IMAGEM: um cartão de foto com céu, sol que nasce e colinas
  const imagem = (pai, { x, y, s, rot, w = 300, h = 220, ceu = C.areia } = {}) => {
    const g = nova(pai, x, y, s, rot), id = "im" + Math.floor(rnd(x + y + w) * 1e6);
    sombra(g, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 20); el("rect", { x: -w / 2 - 12, y: -h / 2 - 12, width: w + 24, height: h + 24, rx: 20, fill: C.creme }, g);
    el("clipPath", { id }, el("defs", {}, g)).appendChild(el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12 }, null));
    const c = el("g", { "clip-path": `url(#${id})` }, g); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, fill: ceu }, c);
    const sol = el("circle", { r: 34, fill: C.amarelo }, c), nuv = el("g", {}, c); el("ellipse", { rx: 40, ry: 14, fill: "#fff", "fill-opacity": .9 }, nuv); el("ellipse", { cx: 22, cy: -8, rx: 22, ry: 12, fill: "#fff", "fill-opacity": .9 }, nuv);
    el("path", { d: `M${-w / 2} ${h / 2}V${h * .12}Q${-w * .2} ${-h * .12} 0 ${h * .12}T${w / 2} ${h * .04}V${h / 2}Z`, fill: C.menta }, c); el("path", { d: `M${-w / 2} ${h / 2}V${h * .3}Q${-w * .1} ${h * .12} ${w * .15} ${h * .3}T${w / 2} ${h * .22}V${h / 2}Z`, fill: C.verde }, c);
    return { g, set(p, t = 0) { const e = ease(lim(p)); sol.setAttribute("cx", w * .18); sol.setAttribute("cy", lerp(h * .3, -h * .18, e)); nuv.setAttribute("transform", `translate(${-w * .22 + ((t * 14) % (w * .9))} ${-h * .22})`); } };
  };
  ficha("imagem", "Imagem (cartão de foto)", "acao", "representar uma foto, ilustração ou captura; marca o lugar de uma imagem real", "você tem a imagem real: use ela no lugar", { w: 324, h: 244 },
    [{ nome: "w", padrao: 300 }, { nome: "h", padrao: 220 }, { nome: "ceu", padrao: "areia" }], mov(1.6, "o sol nasce atrás das colinas e uma nuvem atravessa o céu (loop em t)", true));

  // ---------- CURSOR: seta do mouse que anda por uma rota e clica
  const cursor = (pai, { x, y, s, rot, rota = [[-150, 90], [0, 0], [110, -50]] } = {}) => {
    const g = nova(pai, x, y, s, rot), ring = el("circle", { r: 0, fill: "none", stroke: C.cereja, "stroke-width": 6 }, g), c = el("g", {}, g);
    el("path", { d: "M0 0V54L14 41L26 66L38 60L26 36H46Z", transform: "translate(8 7)", ...SOMBRA }, c); el("path", { d: "M0 0V54L14 41L26 66L38 60L26 36H46Z", fill: C.tinta }, c); el("path", { d: "M6 14V38L14 30", fill: "none", stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round", "stroke-opacity": .7 }, c);
    const n = rota.length - 1;
    return { g, set(p) { const u = lim(p) * n, i = Math.min(n - 1, Math.floor(u)), f = ease(u - i), a = rota[i], b = rota[i + 1], px = lerp(a[0], b[0], f), py = lerp(a[1], b[1], f);
      c.setAttribute("transform", `translate(${px} ${py}) scale(${1 - .12 * Math.max(0, Math.sin(Math.PI * lim((u - i - .85) / .15)))})`);
      const k = (u % 1); const clique = (k > .86 || (u >= n - 1e-6)) ? lim((k > .86 ? k - .86 : 0) / .14) : 0; ring.setAttribute("cx", b[0]); ring.setAttribute("cy", b[1]); ring.setAttribute("r", 8 + 40 * clique); ring.setAttribute("stroke-opacity", clique > 0 && clique < 1 ? 1 - clique : 0); } };
  };
  ficha("cursor", "Cursor do mouse", "acao", "mostrar uma ação do usuário: clicar, arrastar, escolher; anda por uma rota e clica no fim de cada trecho", "o assunto não é digital", { w: 300, h: 240 },
    [{ nome: "rota", padrao: "lista de pontos [x,y]" }], mov(2.0, "a seta anda de ponto em ponto e dá um clique com anel que se abre"));

  // ---------- BALÃO DE CHAT: três pontinhos e depois linhas de texto
  const balao = (pai, { x, y, s, rot, lado = "esq", cor = C.creme, tc = LINHA, linhas = 3 } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 300, h = 40 + linhas * 30, dir = lado === "dir" ? 1 : -1;
    const forma = `M${-w / 2 + 24} ${-h / 2}H${w / 2 - 24}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 24}V${h / 2 - 24}Q${w / 2} ${h / 2} ${w / 2 - 24} ${h / 2}H${dir * w / 2 + (dir > 0 ? -50 : 70)}L${dir * (w / 2 - 6)} ${h / 2 + 30}L${dir * (w / 2 - 34)} ${h / 2}H${-w / 2 + 24}Q${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 24}V${-h / 2 + 24}Q${-w / 2} ${-h / 2} ${-w / 2 + 24} ${-h / 2}Z`;
    el("path", { d: forma, transform: "translate(12 10)", ...SOMBRA }, g); el("path", { d: forma, fill: cor }, g);
    const pts = [0, 1, 2].map((i) => el("circle", { cx: -30 + i * 30, cy: 0, r: 9, fill: tc }, g));
    const ls = [...Array(linhas)].map((_, i) => el("rect", { x: -w / 2 + 28, y: -h / 2 + 24 + i * 30, width: i === linhas - 1 ? 130 : w - 56, height: 14, rx: 7, fill: lado === "dir" ? "#fff" : tc }, g));
    return { g, set(p, t = 0) { const dig = p < .4;
      pts.forEach((c, i) => { c.setAttribute("cy", dig ? -8 * Math.abs(Math.sin(t * 6 + i * .8)) : 0); c.setAttribute("opacity", dig ? 1 : 0); });
      ls.forEach((l, i) => { const f = lim((p - .4 - i * .16) / .2); l.setAttribute("transform", `translate(${-w / 2 + 28} 0) scale(${Math.max(f, .001)} 1) translate(${w / 2 - 28} 0)`); l.setAttribute("opacity", f > 0 ? 1 : 0); }); } };
  };
  ficha("balao", "Balão de chat", "acao", "conversa com uma IA ou pessoa: pontinhos de 'digitando' e depois o texto; lado esq (cinza claro) ou dir (colorido)", "o assunto não é conversa", { w: 340, h: 190 },
    [{ nome: "lado", padrao: "esq|dir" }, { nome: "cor", padrao: "creme" }, { nome: "linhas", padrao: 3 }], mov(2.2, "três pontos pulam (digitando) e depois as linhas do texto aparecem", true));

  // ---------- NUVEM, BANCO, ENGRENAGEM, LUPA
  const nuvem = (pai, { x, y, s, rot, cor = C.creme } = {}) => {
    const g = nova(pai, x, y, s, rot), c = [[-52, 8, 44], [0, -18, 58], [54, 6, 46]], base = "M-90 52H90Q114 52 114 28Q114 4 90 4H-92Q-114 4 -114 28Q-114 52 -90 52Z";
    c.forEach(([cx, cy, r]) => el("circle", { cx, cy, r, transform: "translate(12 10)", ...SOMBRA }, g)); el("path", { d: base, transform: "translate(12 10)", ...SOMBRA }, g);
    c.forEach(([cx, cy, r]) => el("circle", { cx, cy, r, fill: cor }, g)); el("path", { d: base, fill: cor }, g); el("path", { d: "M-70 -6A36 36 0 0 1 -30 -32", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round" }, g);
    return { g, set(p, t = 0) { g.setAttribute("transform", `translate(${x || 0} ${(y || 0) + 8 * Math.sin(t * 2)}) rotate(${rot || 0}) scale(${s || 1})`); } };
  };
  ficha("nuvem", "Nuvem", "acao", "nuvem de internet, armazenamento online, 'na nuvem'", "o assunto é local (tudo no computador): use pasta ou banco", { w: 230, h: 140 }, [{ nome: "cor", padrao: "creme" }], mov(3, "flutua para cima e para baixo (loop em t)", true));
  const banco = (pai, { x, y, s, rot, cor = C.roxo, corEsc = C.roxoEsc } = {}) => {
    const g = nova(pai, x, y, s, rot); el("path", { d: "M-80 -70V70A80 28 0 0 0 80 70V-70Z", transform: "translate(14 12)", ...SOMBRA }, g); el("ellipse", { cx: 14, cy: 82, rx: 80, ry: 28, ...SOMBRA }, g);
    el("path", { d: "M-80 -70V70A80 28 0 0 0 80 70V-70Z", fill: cor }, g); el("ellipse", { cy: -70, rx: 80, ry: 28, fill: corEsc }, g);
    const luzes = [-24, 22].map((yy) => { el("path", { d: `M-80 ${yy}A80 28 0 0 0 80 ${yy}`, fill: "none", stroke: corEsc, "stroke-width": 6 }, g); return el("circle", { cx: 52, cy: yy + 30, r: 6, fill: C.menta }, g); });
    el("path", { d: "M-62 -20V56", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", "stroke-opacity": .35 }, g);
    return { g, set(p, t = 0) { luzes.forEach((l, i) => l.setAttribute("fill", Math.floor(t * 3 + i) % 2 ? C.menta : C.amarelo)); } };
  };
  ficha("banco", "Banco de dados", "acao", "onde a informação fica guardada: banco, base, histórico", "o assunto é uma pasta de arquivos simples (use pasta)", { w: 180, h: 200 }, [{ nome: "cor", padrao: "roxo" }], mov(2, "duas luzinhas piscam (loop em t)", true));
  const engrenagem = (pai, { x, y, s, rot, cor = C.laranja, dentes = 9 } = {}) => {
    const g = nova(pai, x, y, s, rot), R = 64, r = 48, pts = []; for (let i = 0; i < dentes; i++) { const a0 = i * 2 * Math.PI / dentes, d1 = Math.PI / dentes * .55, d2 = Math.PI / dentes * .3;
      [[r, a0 - d1], [R, a0 - d2], [R, a0 + d2], [r, a0 + d1]].forEach(([rr, a]) => pts.push([rr * Math.cos(a), rr * Math.sin(a)])); }
    const d = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z M18 0A18 18 0 1 0 -18 0A18 18 0 1 0 18 0Z";
    el("path", { d, transform: "translate(11 9)", "fill-rule": "evenodd", ...SOMBRA }, g); const r_ = el("g", {}, g); el("path", { d, fill: cor, "fill-rule": "evenodd" }, r_); el("path", { d: "M-30 -34A46 46 0 0 1 8 -48", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", "stroke-opacity": .6 }, r_);
    return { g, set(p, t = 0) { r_.setAttribute("transform", `rotate(${t * 40 * (.3 + lim(p))})`); } };
  };
  ficha("engrenagem", "Engrenagem", "acao", "processo, automação, 'trabalhando'; gira em loop e fica mais rápida com p", "o assunto é parado ou manual", { w: 140, h: 140 }, [{ nome: "cor", padrao: "laranja" }, { nome: "dentes", padrao: 9 }], mov(3, "gira em loop; p (0 a 1) controla a velocidade", true));
  const lupa = (pai, { x, y, s, rot } = {}) => {
    const g = nova(pai, x, y, s, rot); el("circle", { r: 46, cx: 10, cy: 8, ...SOMBRA }, g); el("path", { d: "M34 44L84 94", stroke: C.tinta, "stroke-opacity": .24, "stroke-width": 22, "stroke-linecap": "round", transform: "translate(8 8)" }, g);
    el("path", { d: "M34 44L84 94", stroke: C.roxo, "stroke-width": 20, "stroke-linecap": "round" }, g); el("circle", { r: 46, fill: C.lilas }, g); el("circle", { r: 46, fill: "none", stroke: C.cereja, "stroke-width": 12 }, g); el("path", { d: "M-24 -22A30 30 0 0 1 -4 -34", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round" }, g);
    return { g, set(p, t = 0) { g.setAttribute("transform", `translate(${(x || 0) + 10 * Math.sin(t * 2)} ${(y || 0) + 6 * Math.cos(t * 2.4)}) rotate(${(rot || 0) + 6 * Math.sin(t * 2)}) scale(${s || 1})`); } };
  };
  ficha("lupa", "Lupa", "acao", "buscar, procurar, investigar, 'ler a pasta'", "o assunto não é busca", { w: 150, h: 150 }, [], mov(2.5, "balança procurando (loop em t)", true));

  // ---------- CHECKLIST: caixas que se marcam e itens riscados
  const checklista = (pai, { x, y, s, rot, itens = ["Ler a pasta", "Montar a agenda", "Avisar o time", "Revisar notas"] } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 420, h = 40 + itens.length * 66;
    sombra(g, -w / 2, -h / 2, w, h, 26); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 26, fill: C.creme }, g);
    const li = itens.map((t, i) => { const yy = -h / 2 + 52 + i * 66, gi = el("g", {}, g);
      el("rect", { x: -w / 2 + 28, y: yy - 22, width: 44, height: 44, rx: 12, fill: C.lilas }, gi);
      const ck = el("path", { d: `M${-w / 2 + 38} ${yy}L${-w / 2 + 48} ${yy + 11}L${-w / 2 + 64} ${yy - 11}`, fill: "none", stroke: C.verde, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": 40, "stroke-dashoffset": 40 }, gi);
      const tt = txt(gi, -w / 2 + 92, yy + 10, t, 30, C.tinta, UI), rs = el("rect", { x: -w / 2 + 92, y: yy - 2, width: 0, height: 5, rx: 2.5, fill: C.cereja }, gi); return { ck, tt, rs, len: t.length * 15.5 }; });
    return { g, set(p) { li.forEach((it, i) => { const u = lim((p - i * .2) / .2); it.ck.setAttribute("stroke-dashoffset", 40 * (1 - u)); it.rs.setAttribute("width", it.len * lim((p - i * .2 - .12) / .15)); it.tt.setAttribute("opacity", 1 - .4 * lim((p - i * .2 - .12) / .15)); }); } };
  };
  ficha("checklista", "Checklist", "acao", "tarefas, passos, lista de afazeres; cada item é marcado e riscado em sequência", "são mais de 5 itens", { w: 420, h: 304 }, [{ nome: "itens", padrao: "lista de textos" }], mov(2.4, "cada caixa ganha um check desenhado e o item é riscado, um após o outro"));

  // ---------- CALENDÁRIO: mês com dias que se acendem
  const calendario = (pai, { x, y, s, rot, marcados = [3, 9, 10, 17, 22, 24], hoje = 12 } = {}) => {
    const g = nova(pai, x, y, s, rot), w = 360, h = 330; sombra(g, -w / 2, -h / 2, w, h, 24); el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 24, fill: C.creme }, g);
    el("path", { d: `M${-w / 2} ${-h / 2 + 64}V${-h / 2 + 24}Q${-w / 2} ${-h / 2} ${-w / 2 + 24} ${-h / 2}H${w / 2 - 24}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 24}V${-h / 2 + 64}Z`, fill: C.cereja }, g);
    [-80, 80].forEach((dx) => el("rect", { x: dx - 7, y: -h / 2 - 12, width: 14, height: 36, rx: 7, fill: C.tinta }, g));
    const dias = []; for (let i = 0; i < 35; i++) { const col = i % 7, lin = Math.floor(i / 7), cx2 = -w / 2 + 30 + col * 50, cy2 = -h / 2 + 100 + lin * 44, n = i + 1, m = marcados.includes(n), ho = n === hoje;
      const d = el("g", {}, g); el("rect", { x: cx2 - 18, y: cy2 - 16, width: 36, height: 32, rx: 9, fill: LINHA }, d); const on = el("rect", { x: cx2 - 18, y: cy2 - 16, width: 36, height: 32, rx: 9, fill: ho ? C.cereja : (m ? C.amarelo : "none") }, d); dias.push({ d, on, m, ho, n, cx: cx2, cy: cy2 }); }
    return { g, set(p) { dias.forEach((o, i) => { const u = lim((p - .1 - (o.ho ? .55 : (o.m ? .25 + o.n * .008 : 0))) / .15); o.on.setAttribute("opacity", o.m || o.ho ? u : 0); o.on.setAttribute("transform", `translate(${o.cx} ${o.cy}) scale(${.4 + .6 * back(u)}) translate(${-o.cx} ${-o.cy})`); }); } };
  };
  ficha("calendario", "Calendário", "acao", "datas, agenda, prazos, rotina; os dias marcados se acendem e o 'hoje' vem por último", "o assunto não é tempo ou agenda", { w: 360, h: 330 }, [{ nome: "marcados", padrao: "lista de dias" }, { nome: "hoje", padrao: 12 }], mov(1.8, "os dias marcados se acendem em amarelo e o dia de hoje pula em cereja"));

  // ---------- E-MAIL: o envelope abre e a carta sobe
  const email = (pai, { x, y, s, rot, cor = C.creme } = {}) => {
    const g = nova(pai, x, y, s, rot); sombra(g, -120, -80, 240, 160, 18); el("rect", { x: -120, y: -80, width: 240, height: 160, rx: 18, fill: C.areia }, g);
    const carta = el("g", {}, g); el("rect", { x: -96, y: -64, width: 192, height: 140, rx: 10, fill: "#fff" }, carta); [0, 1, 2].forEach((k) => el("rect", { x: -74, y: -42 + k * 26, width: 148 - k * 30, height: 12, rx: 6, fill: LINHA }, carta));
    el("path", { d: "M-120 -80L0 22L120 -80V62Q120 80 102 80H-102Q-120 80 -120 62Z", fill: cor }, g);
    const aba = el("path", { d: "M-120 -62Q-120 -80 -102 -80H102Q120 -80 120 -62L0 20Z", fill: C.rosa }, g);
    return { g, set(p) { const e = ease(lim(p / .5)), s2 = 1 - 2 * e; aba.setAttribute("transform", `translate(0 -80) scale(1 ${s2}) translate(0 80)`); aba.setAttribute("fill", e > .5 ? C.areia : C.rosa); carta.setAttribute("transform", `translate(0 ${-110 * ease(lim((p - .3) / .5))})`); } };
  };
  ficha("email", "E-mail", "acao", "mensagem, aviso, newsletter, 'chegou uma carta'", "o assunto é conversa instantânea (use balão)", { w: 240, h: 160 }, [{ nome: "cor", padrao: "creme" }], mov(1.5, "a aba do envelope abre e a carta sobe"));

  // ---------- FLUXO: nós ligados por linhas, com pacotes de informação viajando
  const fluxo = (pai, { x, y, s, rot, nos = ["pasta", "engrenagem", "documento"], cores = [C.amarelo, C.laranja, C.cereja] } = {}) => {
    const g = nova(pai, x, y, s, rot), xs = nos.map((_, i) => (i - (nos.length - 1) / 2) * 250), ligas = [], pac = [];
    for (let i = 0; i < nos.length - 1; i++) { const a = xs[i] + 62, b = xs[i + 1] - 62;
      el("path", { d: `M${a} 0H${b}`, stroke: C.tinta, "stroke-opacity": .2, "stroke-width": 8, "stroke-linecap": "round", "stroke-dasharray": "2 16" }, g);
      el("path", { d: `M${b - 18} -16L${b} 0L${b - 18} 16`, fill: "none", stroke: C.tinta, "stroke-opacity": .35, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); ligas.push([a, b]);
      for (let k = 0; k < 3; k++) { const q = el("rect", { width: 22, height: 22, rx: 6, fill: [C.cereja, C.roxo, C.verde][(i + k) % 3], x: -11, y: -11 }, g); pac.push({ q, a, b, k, i }); } }
    const icones = nos.map((n, i) => { const ng = nova(g, xs[i], 0, 1); el("circle", { r: 62, cx: 8, cy: 7, ...SOMBRA }, ng); el("circle", { r: 62, fill: cores[i % cores.length] }, ng);
      const ic = nova(ng, 0, 2, 1); const f = { pasta, engrenagem, documento, nuvem, banco, lupa, email, calendario }[n]; const o = f ? f(ic, { s: n === "pasta" ? .26 : n === "documento" ? .3 : n === "engrenagem" ? .56 : .3 }) : null; return o; });
    return { g, set(p, t = 0) { icones.forEach((o) => o && o.set && o.set(1, t)); pac.forEach((q) => { const u = ((t * .5 + q.k / 3 + q.i * .17) % 1), act = lim(p * 3 - q.i); q.q.setAttribute("transform", `translate(${lerp(q.a, q.b - 8, u)} 0) rotate(${u * 180}) scale(${Math.sin(Math.PI * u) * .9 + .1})`); q.q.setAttribute("opacity", act); }); } };
  };
  ficha("fluxo", "Fluxo de informação", "acao", "dados indo de um lugar a outro: origem, processo, destino; quadradinhos viajam pelas setas", "são mais de 4 etapas (não cabe) ou o processo é um ciclo (use ciclo)", { w: 640, h: 140 },
    [{ nome: "nos", padrao: "pasta|engrenagem|documento|nuvem|banco|lupa|email|calendario" }, { nome: "cores", padrao: "lista de cores" }], mov(3, "pacotes viajam do primeiro ao último nó em loop; p (0 a 1) liga os trechos um a um", true));

  Object.assign(EL, { pasta, documento, janela, terminal, tabela, imagem, cursor, balao, nuvem, banco, engrenagem, lupa, checklista, calendario, email, fluxo });
})();
