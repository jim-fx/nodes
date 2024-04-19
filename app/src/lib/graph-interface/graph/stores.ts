import type { Socket } from "@nodes/types";
import { writable, type Writable } from "svelte/store";
import { Color } from "three/src/math/Color.js";

export const activeNodeId: Writable<number> = writable(-1);
export const selectedNodes: Writable<Set<number> | null> = writable(new Set());

export const activeSocket: Writable<Socket | null> = writable(null);
export const hoveredSocket: Writable<Socket | null> = writable(null);
export const possibleSockets: Writable<Socket[]> = writable([]);
export const possibleSocketIds: Writable<Set<string> | null> = writable(null);

export const colors = writable({
  layer0: new Color().setStyle("#060606"),
  layer1: new Color().setStyle("#171717"),
  layer2: new Color().setStyle("#2D2D2D"),
  layer3: new Color().setStyle("#A6A6A6"),
  outline: new Color().setStyle("#000000"),
  active: new Color().setStyle("#c65a19"),
  selected: new Color().setStyle("#ffffff"),
});

if ("getComputedStyle" in globalThis) {

  const body = document.body;

  let lastStyle = "";

  function updateColors() {

    const style = getComputedStyle(body);
    const layer0 = style.getPropertyValue("--layer-0");
    const layer1 = style.getPropertyValue("--layer-1");
    const layer2 = style.getPropertyValue("--layer-2");
    const layer3 = style.getPropertyValue("--layer-3");
    const outline = style.getPropertyValue("--outline");
    const active = style.getPropertyValue("--active");
    const selected = style.getPropertyValue("--selected");

    const newStyle = `${layer0}${layer1}${layer2}${layer3}${outline}${active}${selected}`;

    if (newStyle === lastStyle) return;
    lastStyle = newStyle;

    colors.update(col => {
      col.layer0.setStyle(layer0);
      col.layer0.convertLinearToSRGB();
      col.layer1.setStyle(layer1);
      col.layer1.convertLinearToSRGB();
      col.layer2.setStyle(layer2);
      col.layer2.convertLinearToSRGB();
      col.layer3.setStyle(layer3);
      col.layer3.convertLinearToSRGB();
      col.outline.setStyle(outline);
      col.outline.convertLinearToSRGB();
      col.active.setStyle(active);
      col.active.convertLinearToSRGB();
      col.selected.setStyle(selected);
      col.selected.convertLinearToSRGB();
      return col;
    });

  }

  updateColors();

  window.onload = updateColors;

  body.addEventListener("transitionstart", () => {
    updateColors();
  })
}
