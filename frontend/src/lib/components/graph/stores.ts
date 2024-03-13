import type { Node, Socket } from "$lib/types";
import { writable, type Writable } from "svelte/store";

export const activeNodeId: Writable<number> = writable(-1);
export const selectedNodes: Writable<Set<number> | null> = writable(null);

export const activeSocket: Writable<Socket | null> = writable(null);
export const hoveredSocket: Writable<Socket | null> = writable(null);
export const possibleSockets: Writable<Socket[]> = writable([]);
export const possibleSocketIds: Writable<Set<string> | null> = writable(null);
