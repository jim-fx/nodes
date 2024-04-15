<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry";
  import * as templates from "$lib/graph-templates";
  import type { Graph } from "@nodes/types";
  import { decode, encode } from "$lib/helpers/flat_tree";
  import { decodeFloat } from "$lib/helpers/encode";

  globalThis.decode = decode;
  globalThis.encode = encode;

  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res = "2";
  let time = 0;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  function handleResult(event: CustomEvent<Graph>) {
    let a = performance.now();
    let _res: any = runtimeExecutor.execute(event.detail);
    if (_res instanceof Int32Array) {
      const f = decodeFloat(_res[0], _res[1]);
      res = Math.round(f * 100_000) / 100_000;
    } else {
      res = _res;
    }
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
      result: {res}
      <br />
      time: {time}ms
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
