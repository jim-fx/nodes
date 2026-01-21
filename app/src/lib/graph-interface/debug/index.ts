import type { Box } from '@nodarium/types';
import type { Color } from 'three';
import { Vector3 } from 'three/src/math/Vector3.js';
import Component from './Debug.svelte';
import { lines, points, rects } from './store';

export function debugPosition(x: number, y: number) {
  points.update((p) => {
    p.push(new Vector3(x, 1, y));
    return p;
  });
}

export function debugRect(rect: Box) {
  rects.update((r) => {
    r.push(rect);
    return r;
  });
}

export function clear() {
  points.set([]);
  lines.set([]);
  rects.set([]);
}

export function debugLine(points: Vector3[], color?: Color) {
  lines.update((l) => {
    l.push({ points, color });
    return l;
  });
}

export default Component;
export function clearLines() {
  lines.set([]);
}
