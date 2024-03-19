<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { GraphManager } from "$lib/graph-manager";
  import Graph from "$lib/components/graph/Graph.svelte";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { MemoryNodeRegistry } from "$lib/node-registry";

  const nodeRegistry = new MemoryNodeRegistry();
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  const graphManager = new GraphManager(nodeRegistry, runtimeExecutor);

  let graph = localStorage.getItem("graph");
  if (graph) {
    graphManager.load(JSON.parse(graph));
  } else {
    graphManager.load(graphManager.createTemplate("grid", 10, 10));
  }

  graphManager.on("save", (graph) => {
    localStorage.setItem("graph", JSON.stringify(graph));
  });

  let debug: undefined;

  // onMount(async () => {
  //   try {
  //     const res = await invoke("greet", { name: "Dude" });
  //     console.log({ res });
  //   } catch (error) {
  //     console.log(error);
  //   }
  //
  //   try {
  //     const res2 = await invoke("run_nodes", {});
  //     console.log({ res2 });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
</script>

<!-- <div class="wrapper"> -->
<!--   <Details> -->
<!--     <JsonView json={debug} /> -->
<!--   </Details> -->
<!-- </div> -->

<div id="canvas-wrapper">
  <Canvas shadows={false} renderMode="on-demand" colorManagementEnabled={false}>
    <!-- <PerfMonitor /> -->
    <Graph graph={graphManager} bind:debug />
  </Canvas>
</div>

<style>
  #canvas-wrapper {
    height: 100vh;
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
