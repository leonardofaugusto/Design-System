// Família ROTINA (trabalho do dia a dia): chip_fonte, etiqueta, citacao, cronometro, dias, queda, versoes, fontes, juntar, gaveteiro,
// triagem, xicara, dupla, linha_tempo, receita e livro.
// O que o reel usa para mostrar o dia de trabalho com um agente: de onde veio a informação, o status de cada item, o tempo que passa,
// o que está espalhado e se junta, a triagem, o café da manhã, o 1:1, a linha do tempo e a receita (a skill).
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
    reg({ id, nome, familia: "rotina", tipo: "acao", serve_para, nao_usar_quando, camada: "meio", caixa, parametros: [...P3, ...extras], movimento: { param: "p", duracao_s, descricao, usa_t: true } });
    return (pai, o = {}) => montar(pai, o, build);
  };
  const pop = (p, u0, u1) => Math.max(0, back(clamp((p - u0) / (u1 - u0))));
  const bump = (p, u0, u1) => Math.sin(Math.PI * clamp((p - u0) / (u1 - u0)));
  const traco = (e, u) => { e.setAttribute("stroke-dasharray", "1 1"); e.setAttribute("stroke-dashoffset", 1 - u); e.setAttribute("opacity", u > 0 ? 1 : 0); };
  const barras = (g, x, y, ws, h = 13, gap = 28, cor = C.tinta, op = .2) => ws.forEach((w, i) => el("rect", { x, y: y + i * gap, width: w, height: h, rx: h / 2, fill: cor, opacity: op }, g));

  // ============ CHIP DE FONTE ============
  const chip_fonte = acao("chip_fonte", "Chip de fonte", "mostrar de onde veio uma informação (a nota, a ata, a data); a pílula entra e o sublinhado se desenha", "a informação não tem fonte (use etiqueta opiniao)", { w: 520, h: 90 }, 1.6,
    "a pílula com ícone de documento entra com um pulo e o sublinhado se desenha", [{ nome: "texto", padrao: "ata de 12/10" }], (g, a, o) => {
      const t = o.texto || "ata de 12/10", w = 150 + t.length * 17, h = 84, pl = el("g", {}, g);
      el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, ...a.f(C.creme) }, pl);
      el("circle", { cx: -w / 2 + h / 2, r: h / 2 - 9, ...a.f(C.roxo) }, pl);
      let sub = null;
      if (!a.flat) {
        const ix = -w / 2 + h / 2; el("rect", { x: ix - 11, y: -16, width: 22, height: 32, rx: 4, fill: C.creme }, pl); [-6, 2].forEach((y) => el("rect", { x: ix - 6, y, width: 12, height: 4, rx: 2, fill: C.roxo }, pl));
        txt(pl, -w / 2 + h + 6, 12, t, 38, C.tinta, UI, "start");
        sub = el("path", { d: `M${-w / 2 + h + 6} 28H${w / 2 - 28}`, pathLength: 1, ...a.s(C.cereja, 5) }, pl);
      }
      return (p) => { mover(pl, 0, 0, pop(p, 0, .3)); if (sub) traco(sub, ease(clamp((p - .3) / .4))); };
    });

  // ============ ETIQUETA ============
  const ET = { decisao: [C.verde, "DECISÃO", C.creme], tarefa: [C.laranja, "TAREFA", C.creme], pessoa: [C.roxo, "PESSOA NOVA", C.creme], confirmar: [C.amarelo, "A CONFIRMAR", C.tinta], opiniao: [C.rosa, "OPINIÃO", C.tinta], deducao: [C.lilas, "DEDUÇÃO", C.tinta] };
  const etiqueta = acao("etiqueta", "Etiqueta de status", "marcar o que o agente fez com um item: decisão, tarefa, pessoa nova, a confirmar, opinião ou dedução; carimba com um pulo", "o item não tem status ainda (não use etiqueta vazia)", { w: 360, h: 100 }, 1.4,
    "a etiqueta cai com um carimbo, gira um pouco e assenta", [{ nome: "tipo", padrao: "decisao" }], (g, a, o) => {
      const [cor, rot, tc] = ET[o.tipo || "decisao"] || ET.decisao, w = 90 + rot.length * 24, h = 80, e = el("g", {}, g);
      el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 22, ...a.f(cor) }, e);
      if (!a.flat) { el("circle", { cx: -w / 2 + 26, r: 9, fill: C.creme }, e); txt(e, 16, 15, rot, 44, tc, DISP); el("path", { d: `M${-w / 2 + 50} -26H${w / 2 - 18}`, ...a.s("#fff", 5), "stroke-opacity": .35 }, e); }
      return (p) => { const q = ease(clamp(p / .3)); mover(e, 0, 0, lerp(1.7, 1, q) * (1 + .06 * bump(p, .3, .5)), lerp(-9, -2, q)); e.setAttribute("opacity", p > 0 ? Math.min(1, p / .12) : 0); };
    });

  // ============ CITAÇÃO ============
  const citacao = acao("citacao", "Original e síntese", "mostrar que o texto original fica intacto e a síntese do agente fica ao lado, nunca por cima", "só existe um texto (use documento)", { w: 520, h: 330 }, 2.6,
    "o original entra com a barra lateral e a síntese entra por baixo com as linhas se escrevendo", [], (g, a) => {
      const orig = el("g", {}, g), sint = el("g", {}, g);
      el("rect", { x: -230, y: -150, width: 460, height: 140, rx: 22, ...a.f(C.creme) }, orig);
      el("rect", { x: -230, y: -150, width: 18, height: 140, rx: 9, ...a.f(C.cereja) }, orig);
      el("rect", { x: -230, y: 10, width: 460, height: 140, rx: 22, ...a.f(C.roxo) }, sint);
      const ls = [];
      if (!a.flat) {
        [[-190, -120, 150], [-190, -90, 200], [-190, -60, 120]].forEach(([x, y, w]) => ls.push(el("rect", { x, y, width: w, height: 16, rx: 8, fill: C.tinta, opacity: .25 }, orig)));
        [[-196, 42, 150], [-196, 72, 200], [-196, 102, 100]].forEach(([x, y, w]) => ls.push(el("rect", { x, y, width: w, height: 16, rx: 8, fill: C.lilas }, sint)));
        el("rect", { x: 140, y: -138, width: 78, height: 34, rx: 17, fill: C.cereja }, orig); txt(orig, 179, -113, "ORIGINAL", 22, C.creme, DISP);
        el("rect", { x: 140, y: 22, width: 78, height: 34, rx: 17, fill: C.amarelo }, sint); txt(sint, 179, 47, "SÍNTESE", 22, C.tinta, DISP);
      }
      return (p) => {
        mover(orig, 0, 0, pop(p, 0, .22));
        sint.setAttribute("transform", `translate(0 ${lerp(60, 0, ease(clamp((p - .35) / .25)))})`); sint.setAttribute("opacity", clamp((p - .35) / .12));
        ls.forEach((l, i) => { const k = i < 3 ? 0 : 3, u = i < 3 ? .12 + i * .06 : .55 + (i - 3) * .08; l.setAttribute("transform", `scale(${ease(clamp((p - u) / .18))} 1)`); l.setAttribute("transform-origin", `${l.getAttribute("x")}px 0px`); });
      };
    });

  // ============ CRONÔMETRO ============
  const cronometro = acao("cronometro", "Cronômetro", "marcar quanto tempo leva ('dez minutos por dia', '30 segundos'); o arco amarelo se enche e o ponteiro gira", "o tempo exato não importa (use numero)", { w: 280, h: 330 }, 3,
    "o arco amarelo se enche enquanto o ponteiro dá uma volta e o cronômetro pulsa no fim", [{ nome: "rotulo", padrao: "10 MIN" }], (g, a, o) => {
      const cr = el("g", {}, g);
      el("rect", { x: -16, y: -156, width: 32, height: 26, rx: 8, ...a.f(C.cerejaEsc) }, cr);
      el("circle", { cy: 14, r: 118, ...a.f(C.cereja) }, cr);
      el("circle", { cy: 14, r: 96, ...a.f(C.creme) }, cr);
      let arco = null, mao = null;
      if (!a.flat) {
        [0, 90, 180, 270].forEach((an) => el("path", { d: "M0 -84V-70", ...a.s(C.tinta, 6), transform: `translate(0 14) rotate(${an})`, "stroke-opacity": .5 }, cr));
        arco = el("circle", { cy: 14, r: 107, pathLength: 1, ...a.s(C.amarelo, 17), transform: "rotate(-90 0 14)" }, cr);
        mao = el("g", { }, cr); el("path", { d: "M0 0V-70", ...a.s(C.tinta, 9) }, mao); el("circle", { r: 13, fill: C.tinta }, mao);
        txt(cr, 0, 82, o.rotulo || "10 MIN", 38, C.tinta, DISP);
      }
      return (p) => {
        mover(cr, 0, 0, pop(p, 0, .15) * (1 + .06 * bump(p, .9, 1)));
        if (arco) { const u = ease(clamp((p - .1) / .78)); arco.setAttribute("stroke-dasharray", `${u} 1`); arco.setAttribute("opacity", u > 0 ? 1 : 0); mover(mao, 0, 14, 1, u * 360); }
      };
    });

  // ============ DIAS ============
  const dias = acao("dias", "Dias parado", "mostrar há quantos dias algo está parado ('há 7 dias'); a folha cai e o número conta até o valor", "o prazo é uma data fixa (use calendario)", { w: 230, h: 260 }, 2.2,
    "a folha de calendário cai com um pulo, o número conta até o valor e a folha balança no fim", [{ nome: "n", padrao: 7 }, { nome: "rotulo", padrao: "DIAS" }], (g, a, o) => {
      const n = o.n == null ? 7 : o.n, f = el("g", {}, g);
      el("rect", { x: -100, y: -110, width: 200, height: 230, rx: 24, ...a.f(C.creme) }, f);
      el("rect", { x: -100, y: -110, width: 200, height: 58, rx: 24, ...a.f(C.cereja) }, f); el("rect", { x: -100, y: -78, width: 200, height: 26, ...a.f(C.cereja) }, f);
      let num = null;
      if (!a.flat) { [-50, 50].forEach((x) => el("circle", { cx: x, cy: -110, r: 13, fill: C.tinta }, f)); txt(f, 0, -66, o.rotulo || "DIAS", 40, C.creme, DISP); num = txt(f, 0, 72, "0", 150, C.tinta, DISP); }
      return (p) => {
        const q = ease(clamp((p - .18) / .5)); if (num) num.textContent = String(Math.round(n * q));
        const ba = Math.sin(p * Math.PI * 7) * 7 * clamp((p - .7) / .06) * (1 - clamp((p - .76) / .24));
        f.setAttribute("transform", `translate(0 ${lerp(-120, 0, Math.min(1, ease(clamp(p / .22))))}) rotate(${ba} 0 -110) scale(${1 + .07 * bump(p, .2, .34)})`);
        f.setAttribute("opacity", p > 0 ? 1 : 0);
      };
    });

  // ============ QUEDA ============
  const queda = acao("queda", "Queda", "dizer 'o que eu deixei cair' ou 'o que ficou para trás'; um cartão tomba da prateleira", "a tarefa foi concluída (use certo)", { w: 420, h: 380 }, 2.4,
    "três cartões em cima da prateleira, o do meio inclina, cai girando e some embaixo", [], (g, a) => {
      el("rect", { x: -190, y: 104, width: 380, height: 22, rx: 11, ...a.f(C.roxoEsc) }, g);
      const cs = [-120, 0, 120].map((x, i) => {
        const c = el("g", {}, g); el("rect", { x: -48, y: -118, width: 96, height: 118, rx: 14, ...a.f([C.amarelo, C.laranja, C.menta][i]) }, c);
        if (!a.flat) { el("rect", { x: -32, y: -98, width: 22, height: 22, rx: 6, fill: C.creme }, c); barras(c, -32, -62, [64, 44], 12, 26, C.tinta, .35); }
        return { c, x };
      });
      return (p) => cs.forEach(({ c, x }, i) => {
        const u = pop(p, i * .06, i * .06 + .2);
        if (i === 1) {
          const t1 = ease(clamp((p - .35) / .2)), q = clamp((p - .55) / .45);
          c.setAttribute("transform", `translate(${x + 40 * q * 1.5} ${104 + 320 * q * q}) rotate(${22 * t1 + 120 * q}) translate(48 0) scale(${Math.max(.01, u)}) translate(-48 0)`);
        } else c.setAttribute("transform", `translate(${x} 104) scale(${u})`);
      });
    });

  // ============ VERSÕES ============
  const versoes = acao("versoes", "Versões", "mostrar uma coisa que melhora a cada uso (v1, v2, v3); cada folha nova entra por cima e a última ganha o visto", "só existe uma versão (use documento)", { w: 360, h: 310 }, 2.6,
    "três folhas entram em escada, uma por cima da outra, e a última recebe um visto verde", [], (g, a) => {
      const fs = [[-44, 52, C.areia, "V1"], [0, 8, C.lilas, "V2"], [44, -36, C.creme, "V3"]].map(([x, y, cor, r]) => {
        const f = el("g", {}, g); el("rect", { x: -110, y: -75, width: 220, height: 150, rx: 18, ...a.f(cor) }, f);
        if (!a.flat) { txt(f, -92, 62, r, 44, C.cerejaEsc, DISP, "start"); barras(f, -86, -50, [150, 110, 130], 12, 28); }
        return { f, x, y };
      });
      const ck = el("g", {}, g); el("circle", { r: 34, ...a.f(C.verde), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 7 }, ck); if (!a.flat) el("path", { d: "M-14 2L-4 14L16 -12", ...a.s(C.creme, 10) }, ck);
      return (p) => {
        fs.forEach(({ f, x, y }, i) => { const q = ease(clamp((p - i * .22) / .24)); mover(f, x + (1 - q) * 120, y, pop(p, i * .22, i * .22 + .24)); f.setAttribute("opacity", q > 0 ? 1 : 0); });
        mover(ck, 112, -86, pop(p, .78, .95));
      };
    });

  // ============ FONTES ESPALHADAS ============
  const ICFONTE = [
    (g, a) => { el("rect", { x: -34, y: -52, width: 68, height: 104, rx: 14, ...a.f(C.areia) }, g); if (!a.flat) barras(g, -20, -30, [40, 30, 36, 24], 8, 18, C.tinta, .35); },
    (g, a) => { el("path", { d: "M-52 -34a14 14 0 0 1 14 -14H38a14 14 0 0 1 14 14V14a14 14 0 0 1 -14 14H-14L-40 50V28H-38a14 14 0 0 1 -14 -14Z", ...a.f(C.verde) }, g); if (!a.flat) barras(g, -34, -26, [64, 40], 9, 20, C.creme, 1); },
    (g, a) => { el("rect", { x: -46, y: -44, width: 92, height: 88, rx: 10, ...a.f(C.verdeEsc) }, g); if (!a.flat) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) el("rect", { x: -38 + c * 28, y: -36 + r * 26, width: 24, height: 22, rx: 4, fill: r === 0 ? C.menta : C.creme }, g); },
    (g, a) => { el("circle", { r: 46, ...a.f(C.laranja) }, g); if (!a.flat) [-24, -10, 4, 18].forEach((x, i) => el("rect", { x: x - 4, y: -[14, 28, 38, 22][i] / 2, width: 8, height: [14, 28, 38, 22][i], rx: 4, fill: C.creme }, g)); },
    (g, a) => { el("rect", { x: -38, y: -52, width: 76, height: 104, rx: 12, ...a.f(C.lilas) }, g); if (!a.flat) { el("rect", { x: -26, y: -40, width: 30, height: 8, rx: 4, fill: C.roxo }, g); barras(g, -26, -18, [52, 44, 52, 30], 8, 18, C.roxo, .45); } },
  ];
  const FPOS = [[-200, -60, -8], [-100, 70, 6], [10, -70, -4], [110, 70, 8], [205, -40, -6]];
  const fontes = acao("fontes", "Fontes espalhadas", "mostrar que a informação está espalhada em vários lugares (nota de celular, conversa, planilha, áudio, ata); os ícones pulam e flutuam", "o assunto é um só lugar de informação (use pasta)", { w: 520, h: 300 }, 3,
    "cinco ícones genéricos aparecem um a um em lugares diferentes e ficam flutuando de leve", [], (g, a) => {
      const is = ICFONTE.map((ic, i) => { const n = el("g", {}, g); ic(n, a); return { n, x: FPOS[i][0], y: FPOS[i][1], r: FPOS[i][2] }; });
      return (p, t) => is.forEach(({ n, x, y, r }, i) => mover(n, x, y + 7 * Math.sin(t * 2.2 + i * 1.3), pop(p, .05 + i * .14, .3 + i * .14), r + 3 * Math.sin(t * 1.7 + i)));
    });

  // ============ JUNTAR ============
  const JP = [[-230, -120, C.areia], [220, -140, C.verde], [-240, 80, C.lilas], [235, 100, C.laranja], [-20, -190, C.verdeEsc], [30, 190, C.rosa]];
  const juntar = acao("juntar", "Juntar numa pasta", "mostrar tudo que estava espalhado indo parar numa pasta só; os itens voam e a pasta engole cada um", "a informação já está organizada (use pasta)", { w: 520, h: 420 }, 3,
    "seis itens saem das bordas, voam até a pasta e somem dentro dela, que dá um pulo a cada chegada", [{ nome: "rotulo", padrao: "" }], (g, a, o) => {
      const fl = JP.map(([x, y, cor]) => { const n = el("g", {}, g); el("rect", { x: -34, y: -34, width: 68, height: 68, rx: 14, ...a.f(cor) }, n); return { n, x, y }; });
      const pa = el("g", {}, g);
      el("path", { d: "M-100 -62H-30L-8 -86H80A18 18 0 0 1 98 -68V70A18 18 0 0 1 80 88H-82A18 18 0 0 1 -100 70Z", ...a.f(C.laranja) }, pa);
      el("rect", { x: -100, y: -36, width: 200, height: 124, rx: 18, ...a.f(C.amarelo) }, pa);
      if (!a.flat) { el("path", { d: "M-80 -20C-86 6 -86 40 -84 66", ...a.s("#fff", 8), "stroke-opacity": .5 }, pa); if (o.rotulo) txt(pa, 0, 40, o.rotulo, 54, C.tinta, DISP); }
      return (p) => {
        let b = 0;
        fl.forEach(({ n, x, y }, i) => {
          const u0 = .08 + i * .12, q = ease(clamp((p - u0) / .3)); mover(n, lerp(x, 0, q), lerp(y, 10, q), lerp(1, .15, q), q * 120 * (i % 2 ? 1 : -1)); n.setAttribute("opacity", q > 0 && q < 1 ? 1 : q === 0 ? 1 : 0);
          b += .08 * bump(p, u0 + .22, u0 + .36);
        });
        pv(pa, 0, 40, 1 + b);
      };
    });

  // ============ GAVETEIRO ============
  const gaveteiro = acao("gaveteiro", "Gaveteiro", "mostrar as poucas gavetas onde as coisas ficam (inbox, diário, reuniões, pessoas, projetos, notas); a inbox se destaca", "são mais de seis categorias (use tabela)", { w: 360, h: 440 }, 2.8,
    "as seis gavetas surgem uma a uma e a primeira, a inbox, abre um pouco e brilha em amarelo", [{ nome: "rotulos", padrao: ["INBOX", "DIÁRIO", "REUNIÕES", "PESSOAS", "PROJETOS", "NOTAS"] }], (g, a, o) => {
      const rs = o.rotulos || ["INBOX", "DIÁRIO", "REUNIÕES", "PESSOAS", "PROJETOS", "NOTAS"];
      el("rect", { x: -170, y: -210, width: 340, height: 420, rx: 28, ...a.f(C.roxoEsc) }, g);
      const dr = rs.map((r, i) => {
        const c = i % 2, l = Math.floor(i / 2), n = el("g", {}, g), x = c ? 6 : -158, y = -190 + l * 130;
        const body = el("rect", { x, y, width: 152, height: 116, rx: 16, ...a.f(i === 0 ? C.amarelo : C.roxo) }, n);
        let pl = null;
        if (!a.flat) { pl = el("rect", { x: x + 18, y: y + 24, width: 116, height: 40, rx: 20, fill: C.creme }, n); txt(n, x + 76, y + 53, r, 26, C.tinta, DISP); el("rect", { x: x + 52, y: y + 82, width: 48, height: 12, rx: 6, fill: i === 0 ? C.laranja : C.roxoEsc }, n); }
        return { n, body, i };
      });
      return (p) => dr.forEach(({ n, body, i }) => {
        const u = pop(p, .04 + i * .1, .24 + i * .1), ab = i === 0 ? ease(clamp((p - .7) / .15)) * 14 : 0;
        pv(n, 0, 0, u, 0); n.setAttribute("transform", `translate(0 ${ab}) translate(${(i % 2 ? 80 : -80)} ${-130 + Math.floor(i / 2) * 130}) scale(${Math.max(.001, u)}) translate(${-(i % 2 ? 80 : -80)} ${130 - Math.floor(i / 2) * 130})`);
      });
    });

  // ============ TRIAGEM ============
  const TRI = [[C.verde, "DECISÃO", C.creme], [C.laranja, "TAREFA", C.creme], [C.roxo, "PESSOA NOVA", C.creme], [C.amarelo, "A CONFIRMAR", C.tinta]];
  const triagem = acao("triagem", "Triagem", "mostrar o agente separando um texto bagunçado em decisão, tarefa, pessoa nova e 'a confirmar'; os cartões saem do texto e se alinham", "o texto já está organizado (use documento)", { w: 580, h: 420 }, 3.4,
    "o texto bagunçado balança e quatro cartões etiquetados saem dele e se empilham à direita", [], (g, a) => {
      const bg = el("g", {}, g);
      el("rect", { x: -90, y: -130, width: 180, height: 260, rx: 18, ...a.f(C.areia) }, bg);
      if (!a.flat) el("path", { d: "M-60 -90C-40 -100 -20 -80 0 -92S40 -84 60 -92M-62 -50C-42 -60 -18 -40 2 -52S40 -44 60 -50M-60 -10C-40 -20 -18 0 2 -12S40 -4 58 -10M-62 30C-42 20 -20 40 0 28S38 36 58 30M-60 70C-40 60 -18 80 2 68", ...a.s(C.tinta, 6), "stroke-opacity": .4 }, bg);
      const cs = TRI.map(([cor, r, tc], i) => {
        const n = el("g", {}, g); el("rect", { x: -108, y: -38, width: 216, height: 76, rx: 18, ...a.f(cor) }, n);
        if (!a.flat) { txt(n, 0, 14, r, 42, tc, DISP); if (i === 3) el("circle", { cx: -78, r: 0 }, n); }
        return { n, y: -150 + i * 100 };
      });
      return (p) => {
        mover(bg, -190, 0, 1, Math.sin(p * Math.PI * 12) * 3 * (1 - clamp((p - .6) / .3)));
        cs.forEach(({ n, y }, i) => { const u0 = .2 + i * .15, q = ease(clamp((p - u0) / .28)); mover(n, lerp(-190, 150, q), lerp(0, y, q), lerp(.3, 1, q) * (1 + .08 * bump(p, u0 + .22, u0 + .36)), lerp(-20, 0, q)); n.setAttribute("opacity", q > 0 ? 1 : 0); });
      };
    });

  // ============ XÍCARA DE CAFÉ ============
  const xicara = acao("xicara", "Xícara de café", "marcar a manhã, o 'antes do primeiro café', o começo do dia; a xícara pula e solta vapor", "o assunto é noite ou fim do dia", { w: 280, h: 290 }, 3,
    "a xícara dá um pulo, e três fios de vapor sobem ondulando sem parar", [], (g, a) => {
      el("ellipse", { cy: 104, rx: 128, ry: 24, ...a.f(C.creme) }, g);
      const xi = el("g", {}, g);
      el("path", { d: "M86 -10H110A36 36 0 0 1 110 62H78", ...a.s(a.flat ? C.tinta : C.laranjaEsc, 16) }, xi);
      el("path", { d: "M-86 -34H86V30C86 76 52 98 0 98C-52 98 -86 76 -86 30Z", ...a.f(C.laranja) }, xi);
      el("ellipse", { cy: -34, rx: 86, ry: 16, ...a.f(C.laranjaEsc) }, xi);
      if (!a.flat) { el("ellipse", { cy: -34, rx: 70, ry: 10, fill: C.tinta }, xi); el("path", { d: "M-64 -4C-68 20 -64 46 -56 64", ...a.s("#fff", 8), "stroke-opacity": .45 }, xi); }
      const vs = a.flat ? [] : [-34, 0, 34].map((x) => el("path", { d: `M${x} -62C${x - 16} -88 ${x + 16} -106 ${x} -132`, ...a.s(C.creme, 9) }, g));
      return (p, t) => {
        pv(xi, 0, 98, 1 + .12 * bump(p, 0, .2) , 0); xi.setAttribute("transform", `translate(0 ${-14 * bump(p, 0, .2)}) scale(1 ${1 + .08 * bump(p, 0, .2)})`);
        vs.forEach((v, i) => { v.setAttribute("opacity", clamp((p - .15) / .15) * (.55 + .45 * Math.sin(t * 2.6 + i * 2))); v.setAttribute("transform", `translate(${6 * Math.sin(t * 2 + i * 1.6)} ${-8 * ((t * .9 + i * .3) % 1)})`); });
      };
    });

  // ============ DUPLA ============
  const busto = (g, a, x, pele, roupa, coque) => {
    const b = el("g", { transform: `translate(${x} 34)` }, g);
    el("path", { d: "M-74 120C-74 54 -42 34 0 34C42 34 74 54 74 120Z", ...a.f(roupa) }, b);
    el("rect", { x: -14, y: 6, width: 28, height: 34, rx: 10, ...a.f(pele) }, b);
    el("circle", { cy: -30, r: 46, ...a.f(pele) }, b);
    if (!a.flat) { el("path", { d: "M-48 -32C-50 -88 50 -88 48 -32C30 -58 -30 -58 -48 -32Z", fill: C.tinta }, b); if (coque) el("circle", { cy: -86, r: 22, fill: C.tinta }, b); }
    return b;
  };
  const dupla = acao("dupla", "Dupla conversando", "mostrar uma conversa a dois (1:1, combinado, cobrança); dois avatares sem rosto trocam balões", "são mais de duas pessoas (use grupo)", { w: 480, h: 340 }, 3,
    "os dois avatares aparecem e trocam balões de fala, um de cada vez", [{ nome: "pele1", padrao: C.areia }, { nome: "pele2", padrao: C.laranja }], (g, a, o) => {
      busto(g, a, -130, o.pele1 || C.areia, C.roxo, false); busto(g, a, 130, o.pele2 || C.laranja, C.verde, true);
      const bl = [[-90, C.creme, -1], [90, C.lilas, 1]].map(([x, cor, d]) => {
        const n = el("g", {}, g); el("rect", { x: -78, y: -48, width: 156, height: 84, rx: 28, ...a.f(cor) }, n); el("path", { d: `M${-24 * d} 34L${-44 * d} 62L${6 * d} 34Z`, ...a.f(cor) }, n);
        if (!a.flat) barras(n, -52, -26, [104, 68], 13, 28, C.tinta, .3);
        return { n, x };
      });
      return (p) => bl.forEach(({ n, x }, i) => { const u0 = .12 + i * .38, vis = clamp((p - u0) / .08) * (i === 1 ? 1 : 1 - clamp((p - u0 - .36) / .06)); mover(n, x, -110, pop(p, u0, u0 + .18) * (vis > 0 ? 1 : 0)); });
    });

  // ============ LINHA DO TEMPO ============
  const linha_tempo = acao("linha_tempo", "Linha do tempo", "mostrar o histórico de reuniões ou atas em ordem de data; a linha se desenha e cada ata aparece", "são eventos sem ordem (use pictograma)", { w: 560, h: 260 }, 3,
    "a linha se desenha da esquerda para a direita, cada ata sobe no seu ponto e a última acende em amarelo com 'hoje'", [{ nome: "datas", padrao: ["3/10", "10/10", "17/10", "24/10"] }], (g, a, o) => {
      const ds = o.datas || ["3/10", "10/10", "17/10", "24/10"], n = ds.length, xs = ds.map((_, i) => n === 1 ? 0 : -210 + i * 420 / (n - 1));
      const li = el("path", { d: "M-250 0H250", pathLength: 1, ...a.s(C.creme, 12) }, g);
      const no = ds.map((d, i) => {
        const nd = el("g", {}, g), ult = i === n - 1;
        el("circle", { r: 18, ...a.f(ult ? C.amarelo : C.cereja), stroke: a.flat ? C.tinta : C.creme, "stroke-width": 7 }, nd);
        el("rect", { x: -32, y: -118, width: 64, height: 76, rx: 12, ...a.f(ult ? C.amarelo : C.creme) }, nd);
        if (!a.flat) { barras(nd, -20, -102, [40, 32, 40], 8, 18, C.tinta, .35); txt(nd, 0, 62, d, 36, C.creme, DISP); if (ult) { el("rect", { x: -40, y: -158, width: 80, height: 32, rx: 16, fill: C.cereja }, nd); txt(nd, 0, -134, "HOJE", 24, C.creme, DISP); } }
        return { nd, x: xs[i] };
      });
      return (p) => { traco(li, ease(clamp(p / .6))); no.forEach(({ nd, x }, i) => mover(nd, x, 0, pop(p, .1 + i * .14, .3 + i * .14))); };
    });

  // ============ RECEITA ============
  const receita = acao("receita", "Cartão de receita", "mostrar a skill como uma receita: nome, passos numerados que se marcam um a um; é o jeito do Claude fazer sempre igual", "o conteúdo é um documento comum (use documento)", { w: 360, h: 450 }, 3,
    "o cartão entra, o nome aparece e os três passos se acendem em sequência, cada um com um visto verde", [{ nome: "nome", padrao: "/resumo-comite" }], (g, a, o) => {
      const cd = el("g", {}, g);
      el("rect", { x: -170, y: -215, width: 340, height: 430, rx: 26, ...a.f(C.creme) }, cd);
      el("rect", { x: -170, y: -215, width: 340, height: 86, rx: 26, ...a.f(C.cereja) }, cd); el("rect", { x: -170, y: -170, width: 340, height: 41, ...a.f(C.cereja) }, cd);
      const pas = [];
      if (!a.flat) {
        txt(cd, 0, -150, "RECEITA", 50, C.creme, DISP); txt(cd, 0, -80, o.nome || "/resumo-comite", 36, C.roxo, UI);
        [-20, 50, 120].forEach((y, i) => { const p = el("g", {}, cd); el("circle", { cx: -120, cy: y, r: 24, fill: C.laranja }, p); txt(p, -120, y + 11, String(i + 1), 30, C.creme, DISP); el("rect", { x: -82, y: y - 9, width: [170, 140, 156][i], height: 18, rx: 9, fill: C.tinta, opacity: .22 }, p); const ck = el("g", {}, p); el("circle", { cx: 132, cy: y, r: 20, fill: C.verde }, ck); el("path", { d: `M122 ${y + 1}L130 ${y + 9}L145 ${y - 9}`, ...a.s(C.creme, 6) }, ck); pas.push({ p, ck, y }); });
      }
      return (p) => {
        mover(cd, 0, 0, pop(p, 0, .2));
        pas.forEach(({ p: pp, ck, y }, i) => { const u = .3 + i * .22; pp.setAttribute("opacity", clamp((p - u) / .1)); pv(ck, 132, y, pop(p, u + .12, u + .26)); });
      };
    });

  // ============ LIVRO DE RECEITAS ============
  const livro = acao("livro", "Livro de receitas", "mostrar a pasta de skills como um livro de receitas; o livro abre e uma página vira", "só existe uma skill (use receita)", { w: 420, h: 300 }, 2.6,
    "o livro aparece, a página da direita vira para a esquerda mostrando mais receitas", [], (g, a) => {
      const lv = el("g", {}, g);
      el("rect", { x: -204, y: -134, width: 408, height: 268, rx: 20, ...a.f(C.cerejaEsc) }, lv);
      el("rect", { x: -190, y: -120, width: 188, height: 240, rx: 8, ...a.f(C.creme) }, lv);
      el("rect", { x: 2, y: -120, width: 188, height: 240, rx: 8, ...a.f(C.areia) }, lv);
      const pg = el("g", {}, lv); el("rect", { x: 2, y: -120, width: 188, height: 240, rx: 8, ...a.f(C.creme) }, pg);
      let esq = null;
      if (!a.flat) {
        esq = el("g", {}, lv); txt(esq, -96, 30, "/", 130, C.cereja, DISP); barras(esq, -150, 56, [100, 70], 11, 24, C.tinta, .25);
        barras(pg, 22, -90, [140, 110, 140, 90, 120], 12, 34, C.tinta, .22);
      }
      el("rect", { x: -3, y: -120, width: 6, height: 240, fill: C.cerejaEsc, opacity: a.flat ? 0 : .6 }, lv);
      return (p) => {
        mover(lv, 0, 0, pop(p, 0, .22));
        const q = ease(clamp((p - .4) / .45)), sx = Math.cos(q * Math.PI);
        pg.setAttribute("transform", `scale(${Math.abs(sx) < .02 ? .02 : sx} 1)`);
        pg.firstChild.setAttribute("fill", a.flat ? C.tinta : sx < 0 ? C.areia : C.creme);
        if (esq) esq.setAttribute("opacity", sx > 0 ? 1 : 0);
      };
    });

  Object.assign(EL, { chip_fonte, etiqueta, citacao, cronometro, dias, queda, versoes, fontes, juntar, gaveteiro, triagem, xicara, dupla, linha_tempo, receita, livro });
})();
