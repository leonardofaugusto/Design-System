# comida-viva (nome provisório)

O universo visual da comida de verdade: cores fortes, a Forma inclinada e objetos ilustrados com volume. Cada peça é fixa: o mesmo desenho sempre, só muda o movimento.

Referência de direção: o brandbook público "Universo Visual Liv Up" (Behance, 2022). A paleta e a Forma vêm de lá. Os objetos e os movimentos são desenhos próprios.

## Arquivos

| Arquivo | O que é |
|---|---|
| `elementos.js` | as peças: Forma, pote, marmita, frutas. Cada uma com sua ação em função de `p` (progresso) e `t` (tempo) |
| `cartilha-v1.html` | a cartilha: cores, objetos, movimento em quadros-chave, controles, dados e formações |
| `movimento.html` | cena de exemplo: o pote enche, a cortina de Forma varre a tela, a marmita abre |

## Regras de ouro

1. **Peça fixa.** Quem monta a cena só escolhe a peça, onde e quando. Nunca redesenha.
2. **Sem contorno preto.** Formas chapadas, com luz e sombra dura deslocada (sem blur).
3. **Sem `filter: blur` em movimento.** Blur recalculado por quadro foi o que deixou um render de 4 min em 34 min.
4. **A cena é função do tempo:** `render(t)` desenha o quadro do instante `t`.
5. **Fonte provisória:** Barlow Condensed (títulos) e Outfit (texto), no lugar da Amsi Pro, que é comercial.

## Como renderizar (ferramentas fora deste repositório)

```
python tools/imprimir.py sistemas/comida-viva/cartilha-v1.html saida.png
python tools/animar.py sistemas/comida-viva/movimento.html saida.mp4 --dur 7.6
```

As ferramentas estão em `ferramentas/` (Python; precisam de `playwright`, `faster-whisper` e `ffmpeg`). Vídeos e takes ficam fora do git.
