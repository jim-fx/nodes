---
title: Project **Nodarium**
sub_title: dynaweek 2026
authors:
  - Max
  - Niklas
  - Felix
options:
  end_slide_shorthand: true
---

## Recap

What

---

## Project Manager

---

## UI Goodies

- Drop node on connection
- Node add context menu

---

## Unified Memory Runtime

- [Demo](https://27.nodes.app.max-richter.dev/dev)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Shared WebAssembly.Memory                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [Node A output]  [Node B output]  [Node C output]  ...       │  │
│  │  ┌────────────┐   ┌────────────┐   ┌────────────┐             │  │
│  │  │ Vec<i32>   │   │ Vec<i32>   │   │ Vec<i32>   │             │  │
│  │  │ 4 bytes    │   │ 12 bytes   │   │ 2KB        │             │  │
│  │  └────────────┘   └────────────┘   └────────────┘             │  │
│  │                                                               │  │
│  │  offset: 0 ────────────────────────────────────────────────►  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │
                                   │ import { memory } from "env"
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
    ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
    │  Node A │               │  Node B │               │  Node C │
    │  WASM   │               │  WASM   │               │  WASM   │
    └─────────┘               └─────────┘               └─────────┘
```

---

## Zukunft

- Animation
- Materials
- Wachstum über Zeit

---

## Praxis Tip 1 - Preview Deployments mit Coolify

---

## Praxis Tip 2 - Universal Formatter

[dprint](dprint.dev)

<!-- column_layout: [1, 3] -->

<!-- column: 0 -->

- Typescript
- Javascript
- JSON
- Markdown
- TOML
- YAML
- Dockerfile
- C#
- CSS
- HTML
- Vue
- Svelte
- Astro
- Oxc
- GraphQL
- PHP
- Python
- Jupyter
- **Und alles was eine CLI hat**

<!-- column: 1 -->

Beispiel config:

```jsonc
{
  "lineWidth": 80,
  "typescript": {
    // This applies to both JavaScript & TypeScript
    "quoteStyle": "preferSingle",
    "binaryExpression.operatorPosition": "sameLine",
  },
  "json": {
    "indentWidth": 2,
  },
  "excludes": [
    "**/*-lock.json",
  ],
  "plugins": [
    // You may specify any urls or file paths here that you wish.
    "https://plugins.dprint.dev/typescript-x.x.x.wasm",
    "https://plugins.dprint.dev/json-x.x.x.wasm",
    "https://plugins.dprint.dev/markdown-x.x.x.wasm",
  ],
}
```

<!-- reset_layout -->

---

## Demo Time 🚀

[Open](http://localhost:5173/)
