---
title: dynaweek 2026 v1 Project Nodarium
author: Max, Niklas, Felix
---

## Hello World

_presenterm_ allows configuring almost anything about your presentation:

- The colors used.
- Layouts.
- Footers, including images in the footer.

<!-- pause -->

This is an example on how to configure a footer:

```yaml
footer:
  style: template
  left:
    image: doge.png
  center: '<span class="noice">Colored</span> _footer_'
  right: "{current_slide} / {total_slides}"
  height: 5

palette:
  classes:
    noice:
      foreground: red
```

<!-- end_slide -->

## Formatter

```diff
+ dprint w/ rustfmt
- eslint
- prettier
- svelte-
```
