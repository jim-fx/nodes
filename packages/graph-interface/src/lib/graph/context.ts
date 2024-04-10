import type { GraphManager } from "../graph-manager.js";
import { getContext } from "svelte";

export function getGraphManager(): GraphManager {
  return getContext("graphManager");
}
