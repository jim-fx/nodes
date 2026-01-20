import type { Box } from '@nodarium/types';
import { writable } from 'svelte/store';
import type { Color } from 'three';
import { Vector3 } from 'three/src/math/Vector3.js';

export const points = writable<Vector3[]>([]);
export const rects = writable<Box[]>([]);
export const lines = writable<{ points: Vector3[]; color?: Color }[]>([]);
