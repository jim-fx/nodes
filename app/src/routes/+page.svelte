<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry-client";
  import * as templates from "$lib/graph-templates";
  import type { Graph, Node } from "@nodes/types";
  import Viewer from "$lib/result-viewer/Viewer.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import { AppSettings, AppSettingTypes } from "$lib/settings/app-settings";
  import { get, writable, type Readable, type Writable } from "svelte/store";
  import Keymap from "$lib/settings/Keymap.svelte";
  import type { createKeyMap } from "$lib/helpers/createKeyMap";
  import NodeStore from "$lib/node-store/NodeStore.svelte";
  import type { GraphManager } from "$lib/graph-interface/graph-manager";
  import { setContext } from "svelte";
  import { decodeNestedArray, encodeNestedArray } from "@nodes/utils";
  import type { PerspectiveCamera, Vector3 } from "three";
  import type { OrbitControls } from "three/examples/jsm/Addons.js";
  import ActiveNode from "$lib/settings/ActiveNode.svelte";

  const nodeRegistry = new RemoteNodeRegistry("");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  globalThis.decode = decodeNestedArray;
  globalThis.encode = encodeNestedArray;

  let res: Int32Array;
  let viewerCamera: PerspectiveCamera;
  let viewerControls: OrbitControls;
  let viewerCenter: Vector3;
  let activeNode: Node | undefined;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  let manager: GraphManager;
  let managerStatus: Writable<"loading" | "error" | "idle">;
  $: if (manager) {
    setContext("graphManager", manager);
  }

  let keymap: ReturnType<typeof createKeyMap>;

  function handleResult(event: CustomEvent<Graph>) {
    res = runtimeExecutor.execute(event.detail, get(settings?.graph?.settings));

    if ($AppSettings.centerCamera && viewerCamera && viewerCenter) {
      viewerControls.target.copy(viewerCenter);
      viewerControls.update();
    }
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }

  let settings: Record<string, any> = {
    general: {
      id: "general",
      icon: "i-tabler-settings",
      settings: AppSettings,
      definition: AppSettingTypes,
    },
    shortcuts: {},
    nodeStore: {},
    graph: {},
    activeNode: {
      id: "Active Node",
      icon: "i-tabler-adjustments",
      props: { node: undefined, manager },
      component: ActiveNode,
    },
  };

  $: if (keymap) {
    settings.shortcuts = {
      id: "shortcuts",
      icon: "i-tabler-keyboard",
      props: { keymap },
      component: Keymap,
    };

    settings = settings;
  }

  $: if (manager) {
    settings.activeNode.props.manager = manager;
    settings.nodeStore = {
      id: "Node Store",
      icon: "i-tabler-database",
      props: { nodeRegistry, manager },
      component: NodeStore,
    };
    settings = settings;
  }

  $: if (activeNode) {
    settings.activeNode.props.node = activeNode;
    settings = settings;
  } else {
    settings.activeNode.props.node = undefined;
    settings = settings;
  }

  function handleSettings(
    ev: CustomEvent<{
      values: Record<string, unknown>;
      types: Record<string, unknown>;
    }>,
  ) {
    settings.general.definition.debug.stressTest.loadGrid.callback =
      function () {
        const store = get(settings.general.settings);
        graph = templates.grid(store.amount, store.amount);
      };

    settings.general.definition.debug.stressTest.loadTree.callback =
      function () {
        const store = get(settings.general.settings);
        graph = templates.tree(store.amount);
      };

    settings.graph = {
      icon: "i-tabler-git-fork",
      id: "graph",
      settings: writable(ev.detail.values),
      definition: {
        randomSeed: {
          type: "boolean",
          label: "Random Seed",
          value: true,
        },
        ...ev.detail.types,
      },
    };

    settings = settings;
  }
</script>

<div class="wrapper manager-{$managerStatus}">
  <header></header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer
        bind:controls={viewerControls}
        bind:center={viewerCenter}
        bind:camera={viewerCamera}
        result={res}
      />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          bind:manager
          bind:activeNode
          registry={nodeRegistry}
          {graph}
          bind:keymap
          showGrid={$AppSettings?.showNodeGrid}
          snapToGrid={$AppSettings?.snapToGrid}
          settings={settings?.graph?.settings}
          on:settings={handleSettings}
          on:result={handleResult}
          on:save={handleSave}
        />
        <Settings panels={settings}></Settings>
      {/key}
    </Grid.Cell>
  </Grid.Row>
</div>

<style>
  header {
    /* border-bottom: solid thin var(--outline); */
    background-color: var(--layer-1);
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
    color: white;
    display: grid;
    grid-template-rows: 0px 1fr;
  }

  .wrapper :global(canvas) {
    transition: opacity 0.3s ease;
    opacity: 1;
  }

  .manager-loading :global(.graph-wrapper),
  .manager-loading :global(canvas) {
    opacity: 0.2;
    pointer-events: none;
  }

  :global(html) {
    background: rgb(13, 19, 32);
    background: linear-gradient(
      180deg,
      rgba(13, 19, 32, 1) 0%,
      rgba(8, 12, 21, 1) 100%
    );
  }

  :global(body) {
    margin: 0;
    position: relative;
  }
</style>
