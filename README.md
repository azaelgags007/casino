# Casino Royal PWA — Instrucciones de ensamblado

## Estructura final del proyecto

```
casino/
├── index.html          ← Lote 0
├── manifest.json       ← Lote 4 (este)
├── sw.js               ← Lote 4 (este)
├── vercel.json         ← Lote 4 (este)
├── icons/
│   ├── icon-192.png    ← Lote 4 (este)
│   └── icon-512.png    ← Lote 4 (este)
├── css/
│   └── main.css        ← Lote 0
└── js/
    ├── core/
    │   ├── deck.js     ← Lote 0
    │   ├── stats.js    ← Lote 0
    │   └── app.js      ← Lote 0
    └── games/
        ├── adivina.js  ← Lote 1
        ├── blackjack.js← Lote 1
        ├── memory.js   ← Lote 1
        ├── cards2048.js← Lote 1
        ├── poker.js    ← Lote 2
        ├── yahtzee.js  ← Lote 2
        ├── ruleta.js   ← Lote 2
        ├── slots.js    ← Lote 2
        ├── guerra.js   ← Lote 3
        ├── bingo.js    ← Lote 3
        └── solitario.js← Lote 3
```

## Deploy en Vercel

1. Sube la carpeta `casino/` a GitHub
2. En vercel.com → New Project → Import
3. Framework: **Other** (sitio estático)
4. Root Directory: `casino`
5. Deploy ✓

## Probar en local

```bash
cd casino
npx serve .
# Abre http://localhost:3000
```
