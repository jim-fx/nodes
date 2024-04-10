import { writable } from "svelte/store";
import { Vector3 } from "three/src/math/Vector3.js";

export const points = writable<Vector3[]>([]);

export const lines = writable<Vector3[][]>([]);
