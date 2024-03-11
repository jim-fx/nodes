import type { Vector3 } from "three";
import { lines, points } from "./store";

export function debugPosition(pos: Vector3) {
  points.update((p) => {
    p.push(pos);
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
