<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry";
  import * as templates from "$lib/graph-templates";
  import type { Graph } from "@nodes/types";
  import Viewer from "$lib/viewer/Viewer.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import { AppSettings, AppSettingTypes } from "$lib/settings/app-settings";
  import { get, writable, type Writable } from "svelte/store";
  import Keymap from "$lib/settings/Keymap.svelte";
  import { createKeyMap } from "$lib/helpers/createKeyMap";
  import { setContext } from "svelte";

  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res: Int32Array;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  let managerStatus: Writable<"loading" | "error" | "idle">;

  function handleResult(event: CustomEvent<Graph>) {
    res = runtimeExecutor.execute(event.detail, get(settings?.graph?.settings));
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }

  const keyMap = createKeyMap([]);

  setContext("keymap", keyMap);

  let settings: Record<string, any> = {
    general: {
      id: "general",
      icon: "i-tabler-settings",
      settings: AppSettings,
      definition: AppSettingTypes,
    },
    graph: {},
    shortcuts: {
      id: "shortcuts",
      icon: "i-tabler-keyboard",
      component: Keymap,
    },
  };

  function handleSettings(
    ev: CustomEvent<{
      values: Record<string, unknown>;
      types: Record<string, unknown>;
    }>,
  ) {
    settings.general.definition.stressTest.loadGrid.callback = function () {
      const store = get(settings.general.settings);
      graph = templates.grid(store.amount, store.amount);
    };

    settings.general.definition.stressTest.loadTree.callback = function () {
      const store = get(settings.general.settings);
      graph = templates.tree(store.amount);
    };

    settings.graph = {
      icon: "i-tabler-chart-bar",
      id: "graph",
      settings: writable(ev.detail.values),
      definition: ev.detail.types,
    };
    settings = settings;
  }
</script>

<div class="wrapper manager-{$managerStatus}">
  <header></header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer result={res} />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          registry={nodeRegistry}
          {graph}
          bind:status={managerStatus}
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
    border-bottom: solid thin var(--outline);
    background-color: var(--layer-1);
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
    color: white;
    display: grid;
    grid-template-rows: 50px 1fr;
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
