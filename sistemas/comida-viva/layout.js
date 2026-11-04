// Família LAYOUT: as peças que montam a tela de um reel com apresentador: chip (rótulo), painel (janela de movimento),
// polaroid (moldura do apresentador) e legenda (palavra por palavra). Nasceram do reel "agentes de IA" e foram aprovadas pelo Leonardo.
// A geometria padrão do layout "apresentador pequeno e baixo" está em layouts/apresentador-baixo.json.
(() => {
  const { C, el, clamp, ease, back, reg } = EL;
  const lim = (x) => clamp(x, 0, 1);
  const UI = 'font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase';
  const ficha = (id, nome, serve_para, nao_usar_quando, camada, caixa, parametros, movimento) =>
    reg({ id, nome, familia: "layout", tipo: "layout", serve_para, nao_usar_quando, camada, caixa, parametros, movimento });

  // CHIP: rótulo com borda duplicada deslocada (a "borda dupla" da marca). Pode ser botão, título de painel ou palavra-chave.
  const chip = (pai, txt, { fs = 54, cor = C.creme, tc = C.cereja, x = 0, y = 0, cx = null } = {}) => {
    const w = Math.round(txt.length * fs * .5 + 44), h = fs + 26, g = el("g", {}, pai), xx = cx != null ? cx - w / 2 : x;
    el("rect", { x: xx + 6, y: y + 6, width: w, height: h, rx: 12, fill: "none", stroke: cor, "stroke-width": 3 }, g);
    el("rect", { x: xx, y, width: w, height: h, rx: 12, fill: cor }, g);
    el("text", { x: xx + w / 2, y: y + h - fs * .3, "text-anchor": "middle", "font-size": fs, fill: tc, style: UI }, g).textContent = txt;
    g.w = w; g.h = h; g.cx = xx + w / 2; g.cy = y + h / 2; return g;
  };
  ficha("chip", "Chip (rótulo)", "rótulo, título de painel, botão, palavra-chave que aparece na hora em que é dita", "o texto passa de ~40 letras: não cabe, encurte ou quebre em dois chips", "frente",
    { w: 520, h: 80 }, [{ nome: "txt", padrao: "" }, { nome: "fs", padrao: 54 }, { nome: "cor", padrao: "creme" }, { nome: "tc", padrao: "cereja" }, { nome: "x|cx", padrao: 0 }, { nome: "y", padrao: 0 }],
    { param: "t - t0", duracao_s: .45, descricao: "entra com pop (escala de .5 a 1 com leve passada), opacidade em .15 s", usa_t: false });

  // PAINEL: a janela grande de movimento, com sombra dura. Devolve o grupo de conteúdo (recortado pelo canto arredondado).
  let np = 0;
  const painel = (pai, { x = 40, y = 110, w = 1000, h = 1180, raio = 44, cor = C.lilas } = {}) => {
    const g = el("g", { transform: `translate(${x} ${y})` }, pai), id = "pn" + (np++);
    el("rect", { x: 16, y: 14, width: w, height: h, rx: raio, fill: C.tinta, "fill-opacity": .28 }, g);
    const fundo = el("rect", { width: w, height: h, rx: raio, fill: cor }, g);
    el("clipPath", { id }, el("defs", {}, g)).appendChild(el("rect", { width: w, height: h, rx: raio }, null));
    const conteudo = el("g", { "clip-path": `url(#${id})` }, g);
    return { g, conteudo, cor: (c) => fundo.setAttribute("fill", c) };
  };
  ficha("painel", "Painel de movimento", "a janela grande onde acontece a animação; fica acima do apresentador", "o reel não tem apresentador (use a tela inteira)", "fundo",
    { w: 1000, h: 1180 }, [{ nome: "x", padrao: 40 }, { nome: "y", padrao: 110 }, { nome: "w", padrao: 1000 }, { nome: "h", padrao: 1180 }, { nome: "cor", padrao: "lilas" }], null);

  // POLAROID: moldura do apresentador (janela vazada) e a sombra dura dela. O vídeo entra por baixo, empilhado pelo ffmpeg.
  const polaroid = (frente, fundo, { janela, borda, inclinacao }) => {
    const x0 = janela.x - borda.lados, y0 = janela.y - borda.topo, x1 = janela.x + janela.w + borda.lados, y1 = janela.y + janela.h + borda.base;
    const cy = janela.y + janela.h / 2, gira = `rotate(${inclinacao} ${janela.x + janela.w / 2} ${cy})`;
    if (fundo) el("rect", { x: x0 + 14, y: y0 + 13, width: x1 - x0, height: y1 - y0, fill: C.tinta, "fill-opacity": .9, transform: gira }, fundo);
    el("path", { d: `M${x0} ${y0}H${x1}V${y1}H${x0}Z M${janela.x} ${janela.y}H${janela.x + janela.w}V${janela.y + janela.h}H${janela.x}Z`, fill: C.creme, stroke: C.tinta, "stroke-width": 5, "fill-rule": "evenodd", "stroke-linejoin": "round", transform: gira }, frente);
  };
  ficha("polaroid", "Polaroid do apresentador", "moldura do vídeo da pessoa, inclinada, com sombra dura; a janela é vazada", "o apresentador é um avatar ou não há vídeo da pessoa", "frente",
    { w: 400, h: 530 }, [{ nome: "janela", padrao: "{x:360,y:1360,w:360,h:450}" }, { nome: "borda", padrao: "{lados:20,topo:20,base:60}" }, { nome: "inclinacao", padrao: -2.5 }], null);

  // LEGENDA: palavra por palavra, em grupos de até 3 palavras; a palavra falada ganha destaque amarelo. DOM, não SVG.
  const legenda = (frenteDiv, palavras, { top = 1690, height = 200, left = 90, width = 900, fs = 96 } = {}) => {
    if (!document.getElementById("legenda-estilo")) { const s = document.createElement("style"); s.id = "legenda-estilo";
      s.textContent = `.leg{position:absolute;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:2px 12px;transform-origin:50% 50%}
.leg .w{font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase;color:#FFF9E9;-webkit-text-stroke:12px #5C0A24;paint-order:stroke fill;padding:0 12px;border-radius:12px}
.leg .w.ativa{background:#EFD600;color:#5C0A24;-webkit-text-stroke:0;transform:rotate(-2deg) scale(1.05)}`; document.head.appendChild(s); }
    const d = document.createElement("div"); d.className = "leg"; Object.assign(d.style, { top: top + "px", left: left + "px", width: width + "px", height: height + "px" });
    d.querySelectorAll; frenteDiv.appendChild(d); const grupos = []; let at = [];
    palavras.forEach((w, i) => { at.push(i); const ch = at.reduce((s, j) => s + palavras[j].texto.length, 0); if (at.length >= 3 || ch >= 20 || /[,.?!]$/.test(w.texto)) { grupos.push(at); at = []; } });
    if (at.length) grupos.push(at);
    let chave = "";
    return { div: d, set(t) {
      let gi = -1; grupos.forEach((g, k) => { if (palavras[g[0]].ini <= t) gi = k; });
      const g = grupos[gi];
      if (!g || t > palavras[g[g.length - 1]].fim + .35) { d.style.opacity = 0; chave = ""; return; }
      let ativa = g[0]; g.forEach((j) => { if (palavras[j].ini <= t) ativa = j; });
      const nv = gi + ":" + ativa;
      if (nv !== chave) { chave = nv; d.innerHTML = g.map((j) => `<span class="w${j === ativa ? " ativa" : ""}" style="font-size:${fs}px">${palavras[j].texto.replace(/[,.?!]/g, "")}</span>`).join(""); }
      d.style.opacity = 1; d.style.transform = `scale(${.86 + .14 * back(lim((t - palavras[g[0]].ini) / .14))})`;
    } };
  };
  ficha("legenda", "Legenda por palavra", "legenda falada: grupos de até 3 palavras, a palavra do momento em destaque amarelo", "o vídeo não tem fala", "frente",
    { w: 900, h: 200 }, [{ nome: "palavras", padrao: "[{texto,ini,fim}]" }, { nome: "top", padrao: 1690 }, { nome: "fs", padrao: 96 }],
    { param: "t", duracao_s: null, descricao: "troca de grupo a cada 3 palavras; o grupo entra com pop; a palavra ativa muda no tempo da fala", usa_t: true });

  Object.assign(EL, { chip, painel, polaroid, legenda });
})();
