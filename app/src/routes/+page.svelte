<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { GraphManager } from "$lib/graph-manager";
  import Graph from "$lib/components/graph/Graph.svelte";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { MemoryNodeRegistry, RemoteNodeRegistry } from "$lib/node-registry";
  import { LinearSRGBColorSpace } from "three";
  import Details from "$lib/components/Details.svelte";
  import { JsonView } from "@zerodevx/svelte-json-view";

  const memNodeRegistry = new MemoryNodeRegistry();
  const nodeRegistry = new RemoteNodeRegistry("http://localhost:5174");

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

<div class="wrapper">
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

<div id="canvas-wrapper">
  <Canvas
    shadows={false}
    renderMode="on-demand"
    colorManagementEnabled={false}
    colorSpace={LinearSRGBColorSpace}
  >
    <!-- <PerfMonitor /> -->
    <Graph graph={graphManager} bind:debug />
  </Canvas>
</div>

<style>
  #canvas-wrapper {
    height: 100vh;
  }

  .wrapper {
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
    width: 100vw;
    height: 100vh;
  }
</style>
