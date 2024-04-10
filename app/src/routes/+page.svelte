<script lang="ts">
  import Grid from "$lib/grid";
  import Graph from "$lib/components/graph";
  import { GraphManager } from "$lib/graph-manager";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { MemoryNodeRegistry, RemoteNodeRegistry } from "$lib/node-registry";
  import Details from "$lib/components/Details.svelte";
  import { JsonView } from "@zerodevx/svelte-json-view";

  const memNodeRegistry = new MemoryNodeRegistry();
  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");

  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  const graphManager = new GraphManager(nodeRegistry, runtimeExecutor);

  let graph = localStorage.getItem("graph");
  if (graph) {
    graphManager.load(JSON.parse(graph));
  } else {
    graphManager.load(graphManager.createTemplate("tree", 5));
  }

  graphManager.on("save", (graph) => {
    localStorage.setItem("graph", JSON.stringify(graph));
  });

  let debug: undefined;
</script>

<div class="details-wrapper">
  <Details>
    <button
      on:click={() => graphManager.load(graphManager.createTemplate("tree", 5))}
      >load tree</button
    >
    <br />
    <br />
    <button
      on:click={() =>
        graphManager.load(graphManager.createTemplate("grid", 10, 10))}
      >load grid</button
    >
    <button
      on:click={() =>
        graphManager.load(graphManager.createTemplate("grid", 2, 2))}
      >load small grid</button
    >
    <br />
    <br />
    <JsonView json={debug} />
  </Details>
</div>

<div class="wrapper">
  <header>header</header>
  <Grid.Row>
    <Grid.Cell></Grid.Cell>
    <Grid.Cell>
      <Graph manager={graphManager} />
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
    position: absolute;
    z-index: 100;
    top: 10px;
    left: 10px;
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
