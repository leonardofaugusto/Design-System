// Família FUNDOS: os padrões que ficam atrás de tudo (camada "fundo"). Cada um preenche a tela inteira (1080x1920, origem no canto
// superior esquerdo) com uma cor base e um desenho que anda devagar. Movimento contínuo: set(t), t em segundos. Sem blur.
// Regra de cor: o fundo base segue as regras_de_cor do manifesto (cereja em metade dos fundos); cor2 é só o desenho, nunca outra cor forte.
(() => {
  const { C, el, reg } = EL;
  let nf = 0;
  const L = 1080, A = 1920;
  const ficha = (id, nome, serve, nao, params, descricao) => reg({ id, nome, familia: "fundos", tipo: "padrao", serve_para: serve, nao_usar_quando: nao, camada: "fundo", caixa: { w: L, h: A },
    parametros: [{ nome: "cor", padrao: "cor base" }, { nome: "cor2", padrao: "cor do desenho" }, ...params], movimento: { param: "t", duracao_s: null, descricao, usa_t: true } });
  const base = (g, cor) => el("rect", { width: L, height: A, fill: cor }, g);
  const cobre = (g, id) => el("rect", { x: -500, y: -500, width: L + 1000, height: A + 1000, fill: `url(#${id})` }, g);
  const padrao = (g, w, h) => { const id = "fd" + (nf++); return [id, el("pattern", { id, width: w, height: h, patternUnits: "userSpaceOnUse" }, el("defs", {}, g))]; };

  // ---------- XADREZ: toalha de piquenique que desliza na diagonal
  const xadrez = (pai, { cor = C.rosa, cor2 = C.creme, tam = 120, vel = [30, 18] } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const [id, pt] = padrao(g, tam * 2, tam * 2);
    el("rect", { width: tam, height: tam, fill: cor2, "fill-opacity": .55 }, pt); el("rect", { x: tam, y: tam, width: tam, height: tam, fill: cor2, "fill-opacity": .55 }, pt); cobre(g, id);
    return { g, set(t) { pt.setAttribute("patternTransform", `translate(${t * vel[0]} ${t * vel[1]})`); } };
  };
  ficha("xadrez", "Xadrez (toalha)", "fundo de cozinha e mesa posta: calmo, afetivo, bom para texto grande por cima", "a cena já tem muitos objetos pequenos (poluição)", [{ nome: "tam", padrao: 120 }, { nome: "vel", padrao: "[30,18]" }], "a toalha desliza na diagonal, devagar");

  // ---------- LISTRAS: faixas inclinadas que andam de lado
  const listras = (pai, { cor = C.cereja, cor2 = C.cerejaEsc, larg = 90, ang = -24, vel = 40 } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const [id, pt] = padrao(g, larg * 2, 100);
    el("rect", { width: larg, height: 100, fill: cor2 }, pt); cobre(g, id);
    return { g, set(t) { pt.setAttribute("patternTransform", `rotate(${ang}) translate(${t * vel} 0)`); } };
  };
  ficha("listras", "Listras inclinadas", "fundo de energia e ritmo; o cereja com a versão escura dele aparece como uma textura só", "o texto por cima é pequeno e fino", [{ nome: "larg", padrao: 90 }, { nome: "ang", padrao: -24 }, { nome: "vel", padrao: 40 }], "as faixas andam de lado, na direção da inclinação");

  // ---------- FORMAS: a Forma Liv Up em mosaico (o padrão do brandbook)
  const formas = (pai, { cor = C.lilas, cor2 = C.roxo, op = .16 } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const [id, pt] = padrao(g, 200, 190);
    el("rect", { x: 20, y: 36, width: 150, height: 110, rx: 34, fill: cor2, "fill-opacity": op, transform: "translate(0 8) skewY(-10)" }, pt); cobre(g, id);
    return { g, set(t) { pt.setAttribute("patternTransform", `translate(${t * 14} ${t * 9})`); } };
  };
  ficha("formas", "Mosaico de Formas", "fundo da marca: a Forma inclinada repetida; sempre combina", "nunca (é o fundo padrão quando em dúvida)", [{ nome: "op", padrao: .16 }], "o mosaico desliza devagar na diagonal");

  // ---------- HORTA: brotinhos em fileiras
  const horta = (pai, { cor = C.creme, cor2 = C.verde, op = .55 } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const [id, pt] = padrao(g, 220, 210);
    const broto = (x, y, k) => { const b = el("g", { transform: `translate(${x} ${y}) scale(${k})`, "fill-opacity": op }, pt);
      el("rect", { x: -3, y: -58, width: 6, height: 58, rx: 3, fill: cor2 }, b);
      el("path", { d: "M0 -34Q32 -40 54 -74Q18 -82 0 -34Z", fill: cor2 }, b); el("path", { d: "M0 -50Q-30 -56 -50 -88Q-16 -96 0 -50Z", fill: cor2 }, b); };
    broto(54, 150, 1); broto(168, 66, .8); cobre(g, id);
    return { g, set(t) { pt.setAttribute("patternTransform", `translate(${t * 10} ${t * 16})`); } };
  };
  ficha("horta", "Horta", "fundo de ingrediente, frescor, 'do campo': brotinhos em fileiras", "o assunto não tem nada a ver com comida ou plantação", [{ nome: "op", padrao: .55 }], "as fileiras de brotos descem devagar");

  // ---------- RAIOS: leque girando atrás do assunto
  const raios = (pai, { cor = C.cereja, cor2 = C.cerejaEsc, n = 20, vel = 5, cx = 540, cy = 960 } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const r = el("g", { transform: `translate(${cx} ${cy})` }, g), a = Math.PI * 2 / n, R = 2400;
    for (let i = 0; i < n; i += 2) el("path", { d: `M0 0L${R * Math.cos(i * a)} ${R * Math.sin(i * a)}L${R * Math.cos((i + 1) * a)} ${R * Math.sin((i + 1) * a)}Z`, fill: cor2 }, r);
    return { g, set(t) { r.setAttribute("transform", `translate(${cx} ${cy}) rotate(${t * vel})`); } };
  };
  ficha("raios", "Raios", "abertura e destaque: o leque gira atrás de um título ou de um objeto central", "há uma peça grande que já ocupa o centro e confunde com os raios", [{ nome: "n", padrao: 20 }, { nome: "vel", padrao: 5 }, { nome: "cx|cy", padrao: "540|960" }], "o leque gira em graus por segundo (vel)");

  // ---------- ONDAS: faixas onduladas que correm
  const ondas = (pai, { cor = C.cereja, cor2 = C.rosa, n = 14, amp = 26, vel = 60 } = {}) => {
    const g = el("g", {}, pai); base(g, cor); const bs = [];
    for (let k = 0; k < n; k++) bs.push(el("path", { fill: cor2, "fill-opacity": .32 }, g));
    return { g, set(t) { bs.forEach((p, k) => { const y0 = 20 + k * 140, f = (x, yy, o) => yy + amp * Math.sin((x + t * vel * (k % 2 ? 1 : -1)) * .0242 + k + o); let d = "", d2 = "";
      for (let x = -40; x <= L + 40; x += 40) d += (x === -40 ? "M" : "L") + x + " " + f(x, y0, 0);
      for (let x = L + 40; x >= -40; x -= 40) d2 += "L" + x + " " + f(x, y0 + 70, 1.2);
      p.setAttribute("d", d + d2 + "Z"); }); } };
  };
  ficha("ondas", "Ondas", "fundo de líquido, suco, sopa, fluxo; ritmo suave", "o texto por cima tem linhas finas (as ondas atrapalham)", [{ nome: "n", padrao: 14 }, { nome: "amp", padrao: 26 }, { nome: "vel", padrao: 60 }], "as faixas ondulam e correm em sentidos alternados");

  Object.assign(EL, { xadrez, listras, formas, horta, raios, ondas });
})();
