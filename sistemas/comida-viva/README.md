# comida-viva (nome provisório)

O universo visual da comida de verdade: cores fortes, a Forma inclinada e objetos ilustrados com volume. Cada peça é fixa: o mesmo desenho sempre, só muda o movimento.

Referência de direção: o brandbook público "Universo Visual Liv Up" (Behance, 2022). A paleta e a Forma vêm de lá. Os objetos e os movimentos são desenhos próprios.

## Arquivos

| Arquivo | O que é |
|---|---|
| `elementos.js`, `cozinha.js` | os objetos de comida e as ações da cozinha (pote, marmita, frutas, frango, talheres, servir, cortar, mexer...) |
| `layout.js`, `computador.js`, `dados.js` | chip, painel, polaroid, legenda; pasta, janela, terminal, tabela, fluxo...; barras, linha, rosca, medidor... |
| `texto.js` | **texto em movimento:** letras, palavras que sobem, contorno que enche, carimbo, faixa que rola, roleta, riscado, marca-texto |
| `entrega.js` | **entrega**: bag térmica, broto, celular, pin de mapa, moto, floco, geladeira |
| `navegacao.js` | **navegação**: seta, botão, abas, menu, interruptor, rolagem, pontos de página |
| `feedback.js` | **feedback**: certo, erro, alerta, carregando, estrelas, coração, sino, confete |
| `maos.js` | **mãos e pessoas**: aceno, mão que aponta, joinha, avatar (6 penteados), grupo, chef |
| `conceitos.js` | **ideias**: ciclo, bloco de peça, grafo, teia, ferramentas, bifurcação, plano furado, voto contra, cadeado, plataforma |
| `rotina.js` | **rotina de trabalho**: chip de fonte, etiqueta de status, original e síntese, cronômetro, dias parado, queda, versões, fontes espalhadas, juntar, gaveteiro, triagem, xícara, dupla, linha do tempo, receita, livro |
| `cena.js` | **cena do reel**: janela do rosto, moldura de captura, overlay de gancho |
| `fundos.js` | **fundos** que andam devagar: xadrez, listras, formas, horta, raios, ondas. Formato por parâmetro: `formato` reel (padrão, 1080×1920), slide (1920×1080), quadrado ou feed; ou `w` e `h` |
| `transicoes.js` | **transições** de cena (p=0,5 é a tela coberta): cortina de Forma, fatias, cascata, íris, onda |
| `manifesto.json` | GERADO das fichas das peças (80 peças, 13 famílias); nunca editar à mão |
| `movimento-*.html` | cenas de demonstração de cada família |

## Regras de ouro

1. **Peça fixa.** Quem monta a cena só escolhe a peça, onde e quando. Nunca redesenha.
2. **Sem contorno preto.** Formas chapadas, com luz e sombra dura deslocada (sem blur).
3. **Sem `filter: blur` em movimento.** Blur recalculado por quadro foi o que deixou um render de 4 min em 34 min.
4. **A cena é função do tempo:** `render(t)` desenha o quadro do instante `t`.
5. **Fonte provisória:** Barlow Condensed (títulos) e Outfit (texto), no lugar da Amsi Pro, que é comercial.

## Como renderizar (ferramentas fora deste repositório)

```
python ferramentas/animar.py sistemas/comida-viva/movimento-texto.html saida.mp4 --dur 18
python ferramentas/manifesto.py sistemas/comida-viva --versao 0.4.0
```

As ferramentas estão em `ferramentas/` (Python; precisam de `playwright`, `faster-whisper` e `ffmpeg`). Vídeos e takes ficam fora do git.
