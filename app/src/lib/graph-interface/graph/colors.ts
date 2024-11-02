import { readable } from "svelte/store";
import { Color } from "three";

const variables = [
  "layer-0",
  "layer-1",
  "layer-2",
  "layer-3",
  "outline",
  "active",
  "selected",
  "edge",
] as const;

const store = Object.fromEntries(variables.map(v => [v, new Color()])) as Record<typeof variables[number], Color>;

let lastStyle = "";

function updateColors() {
  if (!("getComputedStyle" in globalThis)) return;
  console.log("updateColors")
  const style = getComputedStyle(document.body.parentElement!);
  let hash = "";
  for (const v of variables) {
    let color = style.getPropertyValue(`--${v}`);
    hash += color;
    store[v].setStyle(color);
  }
  if (hash === lastStyle) return;
  lastStyle = hash;
}

export const colors = readable(store, set => {

  updateColors();
  set(store);

  setTimeout(() => {
    updateColors();
    set(store);
  }, 1000);

  window.onload = function () { updateColors(); set(store) };

  document.body.addEventListener("transitionstart", () => {
    updateColors();
    set(store);
  })
});
