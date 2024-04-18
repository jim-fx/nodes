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
  import { get, writable } from "svelte/store";

  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res: Int32Array;
  let time = 0;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  function handleResult(event: CustomEvent<Graph>) {
    let a = performance.now();
    res = runtimeExecutor.execute(event.detail, get(settings?.graph?.settings));
    time = performance.now() - a;
    console.log({ res, time });
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
  };

  function handleSettings(
    ev: CustomEvent<{
      values: Record<string, unknown>;
      types: Record<string, unknown>;
    }>,
  ) {
    settings = {
      ...settings,
      graph: {
        icon: "i-tabler-chart-bar",
        id: "graph",
        settings: writable(ev.detail.values),
        definition: ev.detail.types,
      },
    };
  }
</script>

<div class="wrapper">
  <header>
    header
    <button
      on:click={() => {
        graph = templates.grid(15, 15);
      }}>grid stress-test</button
    >
  </header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer result={res} />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          registry={nodeRegistry}
          {graph}
          settings={settings?.graph?.settings}
          on:settings={handleSettings}
          on:result={handleResult}
          on:save={handleSave}
        />
        <Settings {settings}></Settings>
      {/key}
    </Grid.Cell>
  </Grid.Row>
</div>

<style>
  header {
    border-bottom: solid thin white;
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
    color: white;
    display: grid;
    grid-template-rows: 50px 1fr;
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
