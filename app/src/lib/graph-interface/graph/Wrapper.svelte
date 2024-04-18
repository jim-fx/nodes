<script lang="ts">
  import type { Graph, NodeRegistry } from "@nodes/types";
  import GraphEl from "./Graph.svelte";
  import { GraphManager } from "../graph-manager.js";
  import { createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";
  import { debounce } from "$lib/helpers";

  export let registry: NodeRegistry;
  export let graph: Graph;
  export let settings: Writable<Record<string, any>> | undefined;

  const manager = new GraphManager(registry);

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

<GraphEl graph={manager} />
