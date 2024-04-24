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
  import { get, writable, type Writable } from "svelte/store";
  import Keymap from "$lib/settings/panels/Keymap.svelte";
  import type { createKeyMap } from "$lib/helpers/createKeyMap";
  import NodeStore from "$lib/node-store/NodeStore.svelte";
  import type { GraphManager } from "$lib/graph-interface/graph-manager";
  import { setContext } from "svelte";
  import {
    decodeFloat,
    decodeNestedArray,
    encodeNestedArray,
  } from "@nodes/utils";
  import type { PerspectiveCamera, Vector3 } from "three";
  import type { OrbitControls } from "three/examples/jsm/Addons.js";
  import ActiveNode from "$lib/settings/panels/ActiveNode.svelte";

  const nodeRegistry = new RemoteNodeRegistry("");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  globalThis.decode = decodeNestedArray;
  globalThis.encode = encodeNestedArray;
  globalThis.decodeFloat = decodeFloat;

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
    try {
      res = runtimeExecutor.execute(
        event.detail,
        get(settingPanels?.graph?.settings),
      );
    } catch (error) {
      console.log("errors", error);
    }

    if ($AppSettings.centerCamera && viewerCamera && viewerCenter) {
      if (
        Number.isNaN(viewerCenter.x) ||
        Number.isNaN(viewerCenter.y) ||
        Number.isNaN(viewerCenter.z)
      ) {
        // viewerCenter.set(0, 0, 0);
      } else {
        viewerControls.target.copy(viewerCenter);
      }
      viewerControls.update();
    }
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }

  let settingPanels: Record<string, any> = {
    general: {
      id: "general",
      icon: "i-tabler-settings",
      settings: AppSettings,
      definition: AppSettingTypes,
    },
    shortcuts: {},
    nodeStore: {},
    graph: {
      id: "graph",
      icon: "i-tabler-git-fork",
      definition: {
        randomSeed: {
          type: "boolean",
          label: "Random Seed",
          value: true,
        },
      },
    },
    activeNode: {
      id: "Active Node",
      icon: "i-tabler-adjustments",
      props: { node: undefined, manager: undefined },
      component: ActiveNode,
    },
  };

  $: if (keymap) {
    settingPanels.shortcuts = {
      id: "shortcuts",
      icon: "i-tabler-keyboard",
      props: { keymap },
      component: Keymap,
    };

    settingPanels = settingPanels;
  }

  $: if (manager) {
    settingPanels.activeNode.props.manager = manager;
    settingPanels.nodeStore = {
      id: "Node Store",
      icon: "i-tabler-database",
      props: { nodeRegistry, manager },
      component: NodeStore,
    };
    settingPanels = settingPanels;
  }

  $: if (activeNode) {
    settingPanels.activeNode.props.node = activeNode;
    settingPanels = settingPanels;
  } else {
    settingPanels.activeNode.props.node = undefined;
    settingPanels = settingPanels;
  }

  function handleSettings(
    ev: CustomEvent<{
      values: Record<string, unknown>;
      types: Record<string, unknown>;
    }>,
  ) {
    settingPanels.general.definition.debug.stressTest.loadGrid.callback =
      function () {
        const store = get(settingPanels.general.settings);
        graph = templates.grid(store.amount, store.amount);
      };

    settingPanels.general.definition.debug.stressTest.loadTree.callback =
      function () {
        const store = get(settingPanels.general.settings);
        graph = templates.tree(store.amount);
      };

    settingPanels.graph.settings = writable(ev.detail.values);
    settingPanels.graph.definition = {
      ...settingPanels.graph.definition,
      ...ev.detail.types,
    };

    settingPanels = settingPanels;
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
          settings={settingPanels?.graph?.settings}
          on:settings={handleSettings}
          on:result={handleResult}
          on:save={handleSave}
        />
        <Settings panels={settingPanels}></Settings>
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
