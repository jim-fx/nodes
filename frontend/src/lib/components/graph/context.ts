import type { GraphManager } from "$lib/graph-manager";
import { getContext } from "svelte";

export function getGraphManager(): GraphManager {
  return getContext("graphManager");
}
