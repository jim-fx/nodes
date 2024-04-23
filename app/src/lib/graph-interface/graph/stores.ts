import type { Socket } from "@nodes/types";
import { writable, type Writable } from "svelte/store";
import { Color } from "three/src/math/Color.js";

export const activeNodeId: Writable<number> = writable(-1);
export const selectedNodes: Writable<Set<number> | null> = writable(new Set());

export const activeSocket: Writable<Socket | null> = writable(null);
export const hoveredSocket: Writable<Socket | null> = writable(null);
export const possibleSockets: Writable<Socket[]> = writable([]);
export const possibleSocketIds: Writable<Set<string> | null> = writable(null);

export { colors } from "./colors";
