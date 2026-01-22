<script lang="ts">
  import type { Graph, NodeInstance, NodeRegistry } from "@nodarium/types";
  import GraphEl from "./Graph.svelte";
  import { GraphManager } from "../graph-manager.svelte";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import {
    GraphState,
    setGraphManager,
    setGraphState,
  } from "../graph-state.svelte";
  import { setupKeymaps } from "../keymaps";

  type Props = {
    graph?: Graph;
    registry: NodeRegistry;

    settings?: Record<string, any>;

    activeNode?: NodeInstance;
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
    activeNode = $bindable(),
    showGrid = $bindable(true),
    snapToGrid = $bindable(true),
    showHelp = $bindable(false),
    settings = $bindable(),
    settingTypes = $bindable(),
    onsave,
    onresult,
  }: Props = $props();

  export const keymap = createKeyMap([]);

  export const manager = new GraphManager(registry);
  setGraphManager(manager);

  const graphState = new GraphState(manager);
  $effect(() => {
    graphState.showGrid = showGrid;
    graphState.snapToGrid = snapToGrid;
    graphState.showHelp = showHelp;
  });

  setGraphState(graphState);

  setupKeymaps(keymap, manager, graphState);

  $effect(() => {
    if (graphState.activeNodeId !== -1) {
      activeNode = manager.getNode(graphState.activeNodeId);
    } else if (activeNode) {
      activeNode = undefined;
    }
  });

  $effect(() => {
    if (!graphState.addMenuPosition) {
      graphState.edgeEndPosition = null;
      graphState.activeSocket = null;
    }
  });

  manager.on("settings", (_settings) => {
    settingTypes = { ...settingTypes, ..._settings.types };
    settings = _settings.values;
  });

  manager.on("result", (result) => onresult?.(result));

  manager.on("save", (save) => onsave?.(save));

  $effect(() => {
    if (graph) {
      manager.load(graph);
    }
  });
</script>

<GraphEl {keymap} />
