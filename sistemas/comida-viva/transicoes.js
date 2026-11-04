// Família TRANSIÇÕES: o que cobre a tela para trocar de cena. Todas seguem o MESMO contrato:
//   set(p): p = 0 tela limpa · p = 0,5 tela totalmente coberta (é aqui que se troca a cena) · p = 1 tela limpa de novo.
// Tela cheia (1080x1920, origem no canto superior esquerdo), camada "frente". cor = cobertura principal; cor2 = acento (opcional).
// Dica: use cor = a cor de fundo da cena que vem a seguir; o corte some dentro da cobertura.
(() => {
  const { C, el, clamp, ease, reg, forma } = EL;
  const lim = (x) => clamp(x, 0, 1), L = 1080, A = 1920;
  const S = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);      // entra e sai suave, contínuo
  const ficha = (id, nome, serve, nao, params) => reg({ id, nome, familia: "transicoes", tipo: "transicao", serve_para: serve, nao_usar_quando: nao, camada: "frente", caixa: { w: L, h: A },
    parametros: [{ nome: "cor", padrao: "cor da cena seguinte" }, { nome: "cor2", padrao: "acento (opcional)" }, ...params],
    movimento: { param: "p", duracao_s: .7, descricao: "p=0 limpa; p=0,5 tela coberta (troque a cena); p=1 limpa", usa_t: false } });
  const vis = (g, p) => g.setAttribute("opacity", p > 0 && p < 1 ? 1 : 0);

  // ---------- CORTINA DE FORMA: a Forma gigante atravessa a tela
  const cortinaForma = (pai, { cor = C.cereja } = {}) => {
    const g = el("g", {}, pai); forma(g, cor, { x: 0, y: 0, s: 14 });
    return { g, set(p) { vis(g, p); g.setAttribute("transform", `translate(${-1500 + 4080 * S(p) - 120 * 14} ${960 - 144 * 14})`); } };
  };
  ficha("cortina_forma", "Cortina de Forma", "a transição da marca: a Forma gigante atravessa a tela da esquerda para a direita", "a cena seguinte tem o mesmo fundo (não dá para ver a troca)", []);

  // ---------- FAIXAS (fatias horizontais e cascata vertical)
  const faixas = (pai, { cor = C.cereja, cor2 = null, n = 6, vertical = false } = {}) => {
    const g = el("g", {}, pai), tam = (vertical ? L : A) / n, D = vertical ? A + 200 : L + 200, step = .2 / (n - 1), w = .3;
    const rs = Array.from({ length: n }, (_, i) => el("rect", vertical ? { x: i * tam - 2, y: 0, width: tam + 4, height: A, rx: 0, fill: i % 2 && cor2 ? cor2 : cor } : { x: 0, y: i * tam - 2, width: L, height: tam + 4, fill: i % 2 && cor2 ? cor2 : cor }, g));
    return { g, set(p) { vis(g, p); rs.forEach((r, i) => { const k = vertical ? (i * 4) % n : i, dir = i % 2 ? -1 : 1;
      const o = p < .5 ? -dir * D * (1 - ease(lim((p - k * step) / w))) : dir * D * ease(lim((p - .5 - k * step) / w));
      r.setAttribute("transform", vertical ? `translate(0 ${o})` : `translate(${o} 0)`); }); } };
  };
  const fatias = (pai, o = {}) => faixas(pai, { ...o, n: 6, vertical: false });
  const cascata = (pai, o = {}) => faixas(pai, { ...o, n: 9, vertical: true });
  ficha("fatias", "Fatias", "troca rápida e firme: seis faixas entram por lados alternados e saem do outro lado", "o ritmo da cena é lento e calmo", []);
  ficha("cascata", "Cascata", "nove colunas caem em ondas e continuam caindo; boa para mudar de assunto", "a cena tem texto lido nos últimos 0,3 s", []);

  // ---------- ÍRIS: um círculo cresce do centro, cobre e depois abre um buraco para a cena nova
  const iris = (pai, { cor = C.cereja, cx = 540, cy = 960 } = {}) => {
    const g = el("g", {}, pai), c = el("circle", { cx, cy, fill: cor }, g), h = el("path", { fill: cor, "fill-rule": "evenodd" }, g), R = 1500;
    return { g, set(p) { vis(g, p); const a = p < .5, r = a ? R * ease(p / .5) : R * ease((p - .5) / .5);
      c.setAttribute("opacity", a ? 1 : 0); c.setAttribute("r", a ? r : 0); h.setAttribute("opacity", a ? 0 : 1);
      h.setAttribute("d", `M-50 -50H${L + 50}V${A + 50}H-50ZM${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`); } };
  };
  ficha("iris", "Íris", "o assunto vira foco: um círculo fecha e depois abre na cena nova, partindo do centro", "o centro da cena seguinte está vazio (o círculo mostra o vazio)", [{ nome: "cx|cy", padrao: "540|960" }]);

  // ---------- ONDA: uma maré sobe de baixo e leva a cena
  const onda = (pai, { cor = C.cereja, cor2 = C.rosa } = {}) => {
    const g = el("g", {}, pai), H = 2600, lag = el("path", { fill: cor2 }, g), pr = el("path", { fill: cor }, g);
    const faixa = (p, ph) => { const top = A - p * (A + H), a = [], b = [];
      for (let x = -40; x <= L + 40; x += 40) { a.push((x === -40 ? "M" : "L") + x + " " + (top + 60 * Math.sin(x * .012 + p * 14 + ph))); b.unshift("L" + x + " " + (top + H + 60 * Math.sin(x * .012 + p * 14 + ph + 2))); }
      return a.join("") + b.join("") + "Z"; };
    return { g, set(p) { vis(g, p); lag.setAttribute("d", faixa(p - .05, 1)); pr.setAttribute("d", faixa(p, 0)); } };
  };
  ficha("onda", "Onda (maré)", "troca suave e líquida: uma maré sobe, cobre e continua subindo; combina com suco, sopa e fluxo", "o clima é seco, técnico ou sério", []);

  Object.assign(EL, { cortina_forma: cortinaForma, fatias, cascata, iris, onda });
})();
