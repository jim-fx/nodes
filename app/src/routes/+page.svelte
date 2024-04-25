<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { WorkerRuntimeExecutor } from "$lib/worker-runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry-client";
  import * as templates from "$lib/graph-templates";
  import type { Graph, Node } from "@nodes/types";
  import Viewer from "$lib/result-viewer/Viewer.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import { AppSettingTypes, AppSettings } from "$lib/settings/app-settings";
  import { writable, type Writable } from "svelte/store";
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
  import ActiveNodeSettings from "$lib/settings/panels/ActiveNodeSettings.svelte";
  import PerformanceViewer from "$lib/performance/PerformanceViewer.svelte";
  import Panel from "$lib/settings/Panel.svelte";
  import GraphSettings from "$lib/settings/panels/GraphSettings.svelte";
  import NestedSettings from "$lib/settings/panels/NestedSettings.svelte";
  import { createPerformanceStore } from "$lib/performance";
  import { type PerformanceData } from "$lib/performance/store";

  const nodeRegistry = new RemoteNodeRegistry("");
  const workerRuntime = new WorkerRuntimeExecutor();

  let performanceData: PerformanceData;
  let viewerPerformance = createPerformanceStore();

  globalThis.decode = decodeNestedArray;
  globalThis.encode = encodeNestedArray;
  globalThis.decodeFloat = decodeFloat;

  let res: Int32Array;
  let activeNode: Node | undefined;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.plant;

  let manager: GraphManager;
  let managerStatus: Writable<"loading" | "error" | "idle">;
  $: if (manager) {
    setContext("graphManager", manager);
  }

  let keymap: ReturnType<typeof createKeyMap>;
  let graphSettings = writable<Record<string, any>>({});
  let graphSettingTypes = {};

  let isWorking = false;

  let unfinished:
    | {
        graph: Graph;
        settings: Record<string, any>;
      }
    | undefined;

  async function handleResult(_graph: Graph, _settings: Record<string, any>) {
    if (!_settings) return;
    if (isWorking) {
      unfinished = {
        graph: _graph,
        settings: _settings,
      };
      return;
    }
    isWorking = true;
    try {
      let a = performance.now();
      res = await workerRuntime.execute(_graph, _settings);
      let b = performance.now();
      let perfData = await workerRuntime.getPerformanceData();
      let lastRun = perfData.runs?.at(-1);
      if (lastRun) {
        perfData.total["worker-transfer"] = b - a - lastRun.runtime[0];
        lastRun["worker-transfer"] = [b - a - lastRun.runtime[0]];
      }
      performanceData = perfData;
      isWorking = false;
    } catch (error) {
      console.log("errors", error);
    }

    viewerPerformance.stopRun();
    viewerPerformance.startRun();

    if (unfinished) {
      let d = unfinished;
      unfinished = undefined;
      handleResult(d.graph, d.settings);
    }
  }

  $: if (AppSettings) {
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadGrid.callback = () => {
      graph = templates.grid($AppSettings.amount, $AppSettings.amount);
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadTree.callback = () => {
      graph = templates.tree($AppSettings.amount);
    };
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }
</script>

<div class="wrapper manager-{$managerStatus}">
  <header></header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer
        centerCamera={$AppSettings.centerCamera}
        result={res}
        perf={viewerPerformance}
      />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          {graph}
          registry={nodeRegistry}
          bind:manager
          bind:activeNode
          bind:keymap
          showGrid={$AppSettings?.showNodeGrid}
          snapToGrid={$AppSettings?.snapToGrid}
          bind:settings={graphSettings}
          bind:settingTypes={graphSettingTypes}
          on:result={(ev) => handleResult(ev.detail, $graphSettings)}
          on:save={handleSave}
        />
        <Settings>
          <Panel id="general" title="General" icon="i-tabler-settings">
            <NestedSettings
              id="general"
              store={AppSettings}
              settings={AppSettingTypes}
            />
          </Panel>
          <Panel
            id="shortcuts"
            title="Keyboard Shortcuts"
            icon="i-tabler-keyboard"
          >
            {#if keymap}
              <Keymap {keymap} />
            {/if}
          </Panel>
          <Panel
            id="node-store"
            classes="text-green-400"
            title="Node Store"
            icon="i-tabler-database"
          >
            <NodeStore registry={nodeRegistry} />
          </Panel>
          <Panel
            id="performance"
            title="Performance"
            classes="text-red-400"
            hidden={!$AppSettings.showPerformancePanel}
            icon="i-tabler-brand-speedtest"
          >
            {#if performanceData}
              <PerformanceViewer
                data={performanceData}
                viewer={$viewerPerformance}
              />
            {/if}
          </Panel>
          <Panel
            id="graph-settings"
            title="Graph Settings"
            classes="text-blue-400"
            icon="i-tabler-brand-git"
          >
            {#if Object.keys(graphSettingTypes).length > 0}
              <GraphSettings type={graphSettingTypes} store={graphSettings} />
            {/if}
          </Panel>
          <Panel
            id="active-node"
            title="Node Settings"
            classes="text-blue-400"
            icon="i-tabler-adjustments"
          >
            <ActiveNodeSettings {manager} node={activeNode} />
          </Panel>
        </Settings>
      {/key}
    </Grid.Cell>
  </Grid.Row>
</div>

<span class="font-red" />

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
