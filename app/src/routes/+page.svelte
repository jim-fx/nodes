<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import * as templates from "$lib/graph-templates";
  import type { Graph, Node } from "@nodes/types";
  import Viewer from "$lib/result-viewer/Viewer.svelte";
  import {
    appSettings,
    AppSettingTypes,
  } from "$lib/settings/app-settings.svelte";
  import Keymap from "$lib/sidebar/panels/Keymap.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import NodeStore from "$lib/node-store/NodeStore.svelte";
  import ActiveNodeSettings from "$lib/sidebar/panels/ActiveNodeSettings.svelte";
  import PerformanceViewer from "$lib/performance/PerformanceViewer.svelte";
  import Panel from "$lib/sidebar/Panel.svelte";
  import NestedSettings from "$lib/settings/NestedSettings.svelte";
  import type { Group } from "three";
  import ExportSettings from "$lib/sidebar/panels/ExportSettings.svelte";
  import {
    MemoryRuntimeCache,
    WorkerRuntimeExecutor,
    MemoryRuntimeExecutor,
  } from "$lib/runtime";
  import { IndexDBCache, RemoteNodeRegistry } from "@nodes/registry";
  import { createPerformanceStore } from "@nodes/utils";
  import BenchmarkPanel from "$lib/sidebar/panels/BenchmarkPanel.svelte";
  import { debounceAsyncFunction } from "$lib/helpers";

  let performanceStore = createPerformanceStore();

  const registryCache = new IndexDBCache("node-registry");
  const nodeRegistry = new RemoteNodeRegistry("", registryCache);
  const workerRuntime = new WorkerRuntimeExecutor();
  const runtimeCache = new MemoryRuntimeCache();
  const memoryRuntime = new MemoryRuntimeExecutor(nodeRegistry, runtimeCache);
  memoryRuntime.perf = performanceStore;

  const runtime = $derived(
    appSettings.value.debug.useWorker ? workerRuntime : memoryRuntime,
  );

  let activeNode = $state<Node | undefined>(undefined);
  let scene = $state<Group>(null!);

  let graph = $state(
    localStorage.getItem("graph")
      ? JSON.parse(localStorage.getItem("graph")!)
      : templates.defaultPlant,
  );
  function handleSave(graph: Graph) {
    localStorage.setItem("graph", JSON.stringify(graph));
  }

  let graphInterface = $state<ReturnType<typeof GraphInterface>>(null!);
  let viewerComponent = $state<ReturnType<typeof Viewer>>();
  const manager = $derived(graphInterface?.manager);

  async function randomGenerate() {
    if (!manager) return;
    const g = manager.serialize();
    const s = { ...graphSettings, randomSeed: true };
    await handleUpdate(g, s);
  }

  let applicationKeymap = createKeyMap([
    {
      key: "r",
      description: "Regenerate the plant model",
      callback: randomGenerate,
    },
  ]);
  let graphSettings = $state<Record<string, any>>({});
  $effect(() => {
    if (graphSettings) {
      manager?.setSettings($state.snapshot(graphSettings));
    }
  });
  type BooleanSchema = {
    [key: string]: {
      type: "boolean";
      value: false;
    };
  };
  let graphSettingTypes = $state<BooleanSchema>({
    randomSeed: { type: "boolean", value: false },
  });

  let runIndex = 0;
  const handleUpdate = debounceAsyncFunction(
    async (g: Graph, s: Record<string, any> = graphSettings) => {
      runIndex++;
      performanceStore.startRun();
      try {
        let a = performance.now();
        const graphResult = await runtime.execute(
          $state.snapshot(g),
          $state.snapshot(s),
        );
        let b = performance.now();

        if (appSettings.value.debug.useWorker) {
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
        viewerComponent?.update(graphResult);
      } catch (error) {
        console.log("errors", error);
      } finally {
        performanceStore.stopRun();
      }
    },
  );

  $effect(() => {
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadGrid.callback = () => {
      manager.load(
        templates.grid(
          appSettings.value.debug.stressTest.amount,
          appSettings.value.debug.stressTest.amount,
        ),
      );
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.loadTree.callback = () => {
      manager.load(templates.tree(appSettings.value.debug.stressTest.amount));
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaFaces.callback = () => {
      manager.load(templates.lottaFaces as unknown as Graph);
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaNodes.callback = () => {
      manager.load(templates.lottaNodes as unknown as Graph);
    };
    //@ts-ignore
    AppSettingTypes.debug.stressTest.lottaNodesAndFaces.callback = () => {
      manager.load(templates.lottaNodesAndFaces as unknown as Graph);
    };
  });
</script>

<svelte:document onkeydown={applicationKeymap.handleKeyboardEvent} />

<div class="wrapper manager-{manager?.status}">
  <header></header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer
        bind:scene
        bind:this={viewerComponent}
        perf={performanceStore}
        centerCamera={appSettings.value.centerCamera}
      />
    </Grid.Cell>
    <Grid.Cell>
      <GraphInterface
        {graph}
        bind:this={graphInterface}
        registry={nodeRegistry}
        showGrid={appSettings.value.nodeInterface.showNodeGrid}
        snapToGrid={appSettings.value.nodeInterface.snapToGrid}
        bind:activeNode
        bind:showHelp={appSettings.value.nodeInterface.showHelp}
        bind:settings={graphSettings}
        bind:settingTypes={graphSettingTypes}
        onresult={(result) => handleUpdate(result)}
        onsave={(graph) => handleSave(graph)}
      />
      <Sidebar>
        <Panel id="general" title="General" icon="i-tabler-settings">
          <NestedSettings
            id="general"
            bind:value={appSettings.value}
            type={AppSettingTypes}
          />
        </Panel>
        <Panel
          id="shortcuts"
          title="Keyboard Shortcuts"
          icon="i-tabler-keyboard"
        >
          <Keymap
            keymaps={[
              { keymap: applicationKeymap, title: "Application" },
              { keymap: graphInterface.keymap, title: "Node-Editor" },
            ]}
          />
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
          hidden={!appSettings.value.debug.showPerformancePanel}
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
          hidden={!appSettings.value.debug.showBenchmarkPanel}
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
          <NestedSettings
            id="graph-settings"
            type={graphSettingTypes}
            bind:value={graphSettings}
          />
        </Panel>
        <Panel
          id="active-node"
          title="Node Settings"
          classes="text-blue-400"
          icon="i-tabler-adjustments"
        >
          <ActiveNodeSettings {manager} node={activeNode} />
        </Panel>
      </Sidebar>
    </Grid.Cell>
  </Grid.Row>
</div>

<style>
  header {
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
