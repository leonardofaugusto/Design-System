# Design-System

Os design systems da AG.F. Cada sistema é um **kit de peças** (tokens, componentes, regras de uso) usado para construir obras: reels, páginas, decks. O kit não é a obra; a obra é feita com ele.

## Como é organizado

```
indice.json          lista dos sistemas e das versões vigentes
sistemas/<nome>/     um sistema por pasta
  manifesto.json     o catálogo que o modelo lê: o que existe, para que serve, quando não usar, em que camada
  tokens.css         cores, fontes, bordas, sombras
  pecas/             uma peça por arquivo
  guia.html          página que mostra todas as peças (para o Leonardo aprovar o gosto)
  CHANGELOG.md
```

## Regras

1. **O modelo só usa o que o manifesto lista.** Peça que falta é pedida à Galeria, nunca inventada na cena.
2. **Versão por sistema**, com tag no git: `reels/v1.0.0`. Mudar um sistema não mexe nos outros.
3. **Cada obra anota a versão do kit que usou.** Mudar o kit não quebra obra antiga.
4. **Gosto é do Leonardo.** Peça nova só entra depois da aprovação dele.
5. **Sem binários.** Vídeos, takes e fotos ficam fora do git (ver `.gitignore`).
6. **Nada compartilhado entre sistemas por enquanto.** Uma pasta `comum/` só nasce quando dois sistemas repetirem a mesma coisa.

## Sistemas

| Sistema | Estado | Para quê |
|---|---|---|
| `reels` | rascunho | reels com apresentador no centro, fundo animado e legenda por palavra |

Proposta de origem: `docs/propostas/reels-cinema-e-kit.md`, no repositório da Vila.
