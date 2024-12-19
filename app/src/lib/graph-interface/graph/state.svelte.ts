import type { Socket } from "@nodes/types";
import { getContext } from "svelte";
import { SvelteSet } from 'svelte/reactivity';

export function getGraphState() {
  return getContext<GraphState>("graphState");
}

export class GraphState {
  activeNodeId = $state(-1);
  selectedNodes = new SvelteSet<number>();
  activeSocket = $state<Socket | null>(null);
  hoveredSocket = $state<Socket | null>(null);
  possibleSockets = $state<Socket[]>([]);
  possibleSocketIds = $derived(new Set(
    this.possibleSockets.map((s) => `${s.node.id}-${s.index}`),
  ));
  clearSelection() {
    this.selectedNodes.clear();
  }
}

