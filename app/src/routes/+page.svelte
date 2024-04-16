<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry";
  import * as templates from "$lib/graph-templates";
  import type { Graph } from "@nodes/types";
  import { decode, encode } from "$lib/helpers/flat_tree";
  import { decodeFloat, encodeFloat } from "$lib/helpers/encode";
  import Viewer from "$lib/viewer/Viewer.svelte";

  globalThis.decode = decode;
  globalThis.encode = encode;
  globalThis.df = decodeFloat;
  globalThis.en = encodeFloat;

  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res: Int32Array;
  let time = 0;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  function handleResult(event: CustomEvent<Graph>) {
    let a = performance.now();
    res = runtimeExecutor.execute(event.detail);
    time = performance.now() - a;
    console.log(res);
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }
</script>

<div class="wrapper">
  <header>
    header
    <button
      on:click={() => {
        graph = templates.grid(10, 10);
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
          on:result={handleResult}
          on:save={handleSave}
        />
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
