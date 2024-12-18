<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import * as templates from "$lib/graph-templates";
  import type { Graph, Node } from "@nodes/types";
  import Viewer from "$lib/result-viewer/Viewer.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import { AppSettingTypes, AppSettings } from "$lib/settings/app-settings";
  import {
    appSettings as _appSettings,
    AppSettingTypes as _AppSettingTypes,
  } from "$lib/settings/app-settings.svelte";
  import { writable } from "svelte/store";
  import Keymap from "$lib/settings/panels/Keymap.svelte";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import NodeStore from "$lib/node-store/NodeStore.svelte";
  import ActiveNodeSettings from "$lib/settings/panels/ActiveNodeSettings.svelte";
  import PerformanceViewer from "$lib/performance/PerformanceViewer.svelte";
  import Panel from "$lib/settings/Panel.svelte";
  import GraphSettings from "$lib/settings/panels/GraphSettings.svelte";
  import NestedSettings from "$lib/settings/panels/NestedSettings.svelte";
  import type { Group } from "three";
  import ExportSettings from "$lib/settings/panels/ExportSettings.svelte";
  import {
    MemoryRuntimeCache,
    WorkerRuntimeExecutor,
    MemoryRuntimeExecutor,
  } from "$lib/runtime";
  import { IndexDBCache, RemoteNodeRegistry } from "@nodes/registry";
  import { createPerformanceStore } from "@nodes/utils";
  import BenchmarkPanel from "$lib/settings/panels/BenchmarkPanel.svelte";
  import { debounceAsyncFunction } from "$lib/helpers";

  let performanceStore = createPerformanceStore();

  const registryCache = new IndexDBCache("node-registry");
  const nodeRegistry = new RemoteNodeRegistry("http://localhost:8000/v1");
  nodeRegistry.cache = registryCache;
  const workerRuntime = new WorkerRuntimeExecutor();
  const runtimeCache = new MemoryRuntimeCache();
  const memoryRuntime = new MemoryRuntimeExecutor(nodeRegistry, runtimeCache);
  memoryRuntime.perf = performanceStore;

  $: runtime = $AppSettings.useWorker ? workerRuntime : memoryRuntime;

  let activeNode: Node | undefined;
  let scene: Group;
  let updateViewerResult: (result: Int32Array) => void;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.defaultPlant;

  let graphInterface: ReturnType<typeof GraphInterface>;
  $: manager = graphInterface?.manager;
  $: managerStatus = manager?.status;
  $: keymap = graphInterface?.keymap;

  async function randomGenerate() {
    const g = manager.serialize();
    const s = { ...$graphSettings, randomSeed: true };
    await handleUpdate(g, s);
  }

  let applicationKeymap = createKeyMap([
    {
      key: "r",
      description: "Regenerate the plant model",
      callback: randomGenerate,
    },
  ]);
  let graphSettings = writable<Record<string, any>>({});
  let graphSettingTypes = {};

  const handleUpdate = debounceAsyncFunction(
    async (g: Graph, s: Record<string, any>) => {
      performanceStore.startRun();
      try {
        let a = performance.now();
        const graphResult = await runtime.execute(g, s);
        let b = performance.now();

        if ($AppSettings.useWorker) {
          let perfData = await runtime.getPerformanceData();
          let lastRun = perfData?.at(-1);
          if (lastRun?.total) {
            lastRun.runtime = lastRun.total;
            delete lastRun.total;
            performanceStore.mergeData(lastRun);
            performanceStore.addPoint(
              "worker-transfer",
              b - a - lastRun.runtime[0],
            );
          }
        }

        updateViewerResult(graphResult);
      } catch (error) {
        console.log("errors", error);
      } finally {
        performanceStore.stopRun();
      }
    },
  );

  $: if (AppSettings) {
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadGrid.callback = () => {
      graph = templates.grid($AppSettings.amount, $AppSettings.amount);
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadTree.callback = () => {
      graph = templates.tree($AppSettings.amount);
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaFaces.callback = () => {
      graph = templates.lottaFaces;
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaNodes.callback = () => {
      graph = templates.lottaNodes;
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaNodesAndFaces.callback = () => {
      graph = templates.lottaNodesAndFaces;
    };
  }

  function handleSave(graph: Graph) {
    localStorage.setItem("graph", JSON.stringify(graph));
  }
</script>

<svelte:document on:keydown={applicationKeymap.handleKeyboardEvent} />
<div class="wrapper manager-{$managerStatus}">
  <header></header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer
        perf={performanceStore}
        bind:scene
        bind:update={updateViewerResult}
        centerCamera={$AppSettings.centerCamera}
      />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          bind:this={graphInterface}
          {graph}
          registry={nodeRegistry}
          bind:activeNode
          showGrid={$AppSettings.showNodeGrid}
          snapToGrid={$AppSettings.snapToGrid}
          bind:showHelp={$AppSettings.showHelp}
          bind:settings={graphSettings}
          bind:settingTypes={graphSettingTypes}
          onresult={(result) => handleUpdate(result, $graphSettings)}
          onsave={(graph) => handleSave(graph)}
        />
        <Settings>
          <Panel id="general" title="General" icon="i-tabler-settings">
            <NestedSettings
              id="general"
              value={_appSettings}
              type={_AppSettingTypes}
            />
          </Panel>
          <Panel
            id="shortcuts"
            title="Keyboard Shortcuts"
            icon="i-tabler-keyboard"
          >
            <Keymap title="Application" keymap={applicationKeymap} />
            {#if keymap}
              <Keymap title="Node-Editor" {keymap} />
            {/if}
          </Panel>
          <Panel id="exports" title="Exporter" icon="i-tabler-package-export">
            <ExportSettings {scene} />
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
            {#if $performanceStore}
              <PerformanceViewer data={$performanceStore} />
            {/if}
          </Panel>
          <Panel
            id="benchmark"
            title="Benchmark"
            classes="text-red-400"
            hidden={!$AppSettings.showBenchmarkPanel}
            icon="i-tabler-graph"
          >
            <BenchmarkPanel run={randomGenerate} />
          </Panel>
          <Panel
            id="graph-settings"
            title="Graph Settings"
            classes="text-blue-400"
            icon="i-custom-graph"
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
