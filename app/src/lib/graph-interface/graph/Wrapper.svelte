<script lang="ts">
  import type { Graph, Node, NodeRegistry } from "@nodes/types";
  import GraphEl from "./Graph.svelte";
  import { GraphManager } from "../graph-manager.js";
  import { setContext } from "svelte";
  import { type Writable } from "svelte/store";
  import { debounce } from "$lib/helpers";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import { GraphState } from "./state.svelte";

  const state = new GraphState();
  setContext("graphState", state);

  type Props = {
    graph: Graph;
    registry: NodeRegistry;

    settings?: Writable<Record<string, any>>;

    activeNode?: Node;
    showGrid?: boolean;
    snapToGrid?: boolean;
    showHelp?: boolean;
    settingTypes?: Record<string, any>;

    onsave?: (save: Graph) => void;
    onresult?: (result: any) => void;
  };

  let {
    graph,
    registry,
    settings = $bindable(),
    activeNode = $bindable(),
    showGrid,
    snapToGrid,
    showHelp = $bindable(false),
    settingTypes = $bindable(),
    onsave,
    onresult,
  }: Props = $props();

  export const keymap = createKeyMap([]);

  export const manager = new GraphManager(registry);
  setContext("graphManager", manager);

  $effect(() => {
    if (state.activeNodeId !== -1) {
      activeNode = manager.getNode(state.activeNodeId);
    } else {
      activeNode = undefined;
    }
  });

  setContext("keymap", keymap);

  const updateSettings = debounce((s) => {
    manager.setSettings(s);
  }, 200);

  $effect(() => {
    if (settingTypes && settings) {
      updateSettings($settings);
    }
  });

  manager.on("settings", (_settings) => {
    settingTypes = _settings.types;
    settings?.set(_settings.values);
  });

  manager.on("result", (result) => onresult?.(result));

  manager.on("save", (save) => onsave?.(save));

  manager.load(graph);
</script>

<GraphEl bind:showGrid bind:snapToGrid bind:showHelp />
