import { browser } from "$app/environment";
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
  backgroundColorDarker: new Color().setStyle("#101010"),
  backgroundColor: new Color().setStyle("#151515"),
  backgroundColorLighter: new Color().setStyle("#202020")
});

if (browser) {

  const body = document.body;

  function updateColors() {

    const style = getComputedStyle(body);
    const backgroundColorDarker = style.getPropertyValue("--background-color-darker");
    const backgroundColor = style.getPropertyValue("--background-color");
    const backgroundColorLighter = style.getPropertyValue("--background-color-lighter");

    colors.update(col => {
      col.backgroundColorDarker.setStyle(backgroundColorDarker);
      col.backgroundColor.setStyle(backgroundColor);
      col.backgroundColorLighter.setStyle(backgroundColorLighter);
      return col;
    });

  }

  body.addEventListener("transitionstart", () => {
    updateColors();
  })
}
