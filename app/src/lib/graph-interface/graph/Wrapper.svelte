<script lang="ts">
  import type { Graph, Node, NodeRegistry } from "@nodes/types";
  import GraphEl from "./Graph.svelte";
  import { GraphManager } from "../graph-manager.js";
  import { createEventDispatcher, setContext } from "svelte";
  import { type Writable } from "svelte/store";
  import { debounce } from "$lib/helpers";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import { activeNodeId } from "./stores";

  export let registry: NodeRegistry;
  export let graph: Graph;
  export let settings: Writable<Record<string, any>> | undefined;
  export const manager = new GraphManager(registry);
  export let activeNode: Node | undefined;
  $: if ($activeNodeId !== -1) {
    activeNode = manager.getNode($activeNodeId);
  } else {
    activeNode = undefined;
  }

  export const status = manager.status;

  export const keymap = createKeyMap([]);
  setContext("keymap", keymap);

  export let showGrid = false;
  export let snapToGrid = false;

  const updateSettings = debounce((s) => {
    manager.setSettings(s);
  }, 200);

  $: if (settings && $settings) {
    updateSettings($settings);
  }

  manager.on("settings", (settings) => {
    dispatch("settings", settings);
  });

  manager.on("result", (result) => {
    dispatch("result", result);
  });

  manager.on("save", (save) => {
    dispatch("save", save);
  });

  manager.load(graph);

  const dispatch = createEventDispatcher();
</script>

<GraphEl graph={manager} settings={{ showGrid, snapToGrid }} />
