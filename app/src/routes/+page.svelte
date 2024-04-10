<script lang="ts">
  import Grid from "$lib/grid";
  import Graph from "@nodes/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { MemoryNodeRegistry, RemoteNodeRegistry } from "$lib/node-registry";
  import * as templates from "$lib/graph-templates";

  const memNodeRegistry = new MemoryNodeRegistry();
  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res = 0;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  function handleResult(event) {
    console.log("Res", event);
    res = runtimeExecutor.execute(event.detail);
    console.log(res);
  }

  function handleSave(event) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }
</script>

<div class="wrapper">
  <header>header</header>
  <Grid.Row>
    <Grid.Cell>
      {res}
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <Graph
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

  .details-wrapper {
    position: fixed;
    z-index: 100;
    bottom: 10px;
    right: 10px;
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
