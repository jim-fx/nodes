import { Vector3 } from "three/src/math/Vector3.js";
import { lines, points } from "./store";

export function debugPosition(x: number, y: number) {
  points.update((p) => {
    p.push(new Vector3(x, 1, y));
    return p;
  });
}

export function clear() {
  points.set([]);
  lines.set([]);
}

export function debugLine(line: Vector3[]) {
  lines.update((l) => {
    l.push(line);
    return l;
  });
}

import Component from "./Debug.svelte";

export default Component
