import type { GraphManager } from "../graph-manager.svelte";
import { getContext } from "svelte";

export function getGraphManager(): GraphManager {
  return getContext("graphManager");
}
