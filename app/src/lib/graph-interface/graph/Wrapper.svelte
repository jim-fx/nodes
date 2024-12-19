<script lang="ts">
  import type { Graph, Node, NodeRegistry } from "@nodes/types";
  import GraphEl from "./Graph.svelte";
  import { GraphManager } from "../graph-manager.js";
  import { setContext } from "svelte";
  import { debounce } from "$lib/helpers";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import { GraphState } from "./state.svelte";

  const graphState = new GraphState();
  setContext("graphState", graphState);

  type Props = {
    graph: Graph;
    registry: NodeRegistry;

    settings?: Record<string, any>;

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
  setContext("keymap", keymap);

  export const manager = new GraphManager(registry);
  setContext("graphManager", manager);

  $effect(() => {
    if (graphState.activeNodeId !== -1) {
      activeNode = manager.getNode(graphState.activeNodeId);
    } else if (activeNode) {
      activeNode = undefined;
    }
  });

  const updateSettings = debounce((s) => {
    manager.setSettings(s);
  }, 200);

  $effect(() => {
    if (settingTypes && settings) {
      updateSettings($state.snapshot(settings));
    }
  });

  manager.on("settings", (_settings) => {
    settingTypes = { ...settingTypes, ..._settings.types };
    settings = _settings.values;
  });

  manager.on("result", (result) => onresult?.(result));

  manager.on("save", (save) => onsave?.(save));

  manager.load(graph);
</script>

<GraphEl bind:showGrid bind:snapToGrid bind:showHelp />
