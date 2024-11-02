import type { Socket } from "@nodes/types";
import { getContext } from "svelte";

export function getGraphState() {
  return getContext<GraphState>("graphState");
}

export class GraphState {

  activeNodeId = $state(-1);

  selectedNodes = $state(new Set<number>());
  clearSelection() {
    this.selectedNodes = new Set();
  }

  activeSocket = $state<Socket | null>(null);
  hoveredSocket = $state<Socket | null>(null);
  possibleSockets = $state<Socket[]>([]);
  possibleSocketIds = $derived(new Set(
    this.possibleSockets.map((s) => `${s.node.id}-${s.index}`),
  ));

}

export { colors } from "./colors";

