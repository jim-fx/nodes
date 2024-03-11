import type { GraphManager } from "$lib/graph-manager";
import { getContext } from "svelte";
import type { GraphState } from "./graph-state";

export function getGraphManager(): GraphManager {
  return getContext("graphManager");
}

export function getGraphState(): GraphState {
  return getContext("graphState");
}
