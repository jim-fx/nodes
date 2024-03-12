import type { GraphManager } from "$lib/graph-manager";
import { getContext } from "svelte";
import type { GraphView } from "./view";

export function getGraphManager(): GraphManager {
  return getContext("graphManager");
}

export function getGraphState(): GraphView {
  return getContext("graphState");
}
