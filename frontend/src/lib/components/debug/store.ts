import { writable } from "svelte/store";
import type { Vector3 } from "three";

export const points = writable<Vector3[]>([]);

export const lines = writable<Vector3[][]>([]);
