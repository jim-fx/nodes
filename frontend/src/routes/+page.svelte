<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";
  import { PerfMonitor } from "@threlte/extras";

  import { Canvas } from "@threlte/core";
  import Scene from "$lib/components/Scene.svelte";
  import { GraphManager } from "$lib/graph-manager";

  const graph = GraphManager.createEmptyGraph();
  graph.load();

  onMount(async () => {
    try {
      const res = await invoke("greet", { name: "Dude" });
      console.log({ res });
    } catch (error) {
      console.log(error);
    }

    try {
      const res2 = await invoke("run_nodes", {});
      console.log({ res2 });
    } catch (error) {
      console.log(error);
    }
  });
</script>

<div>
  <Canvas shadows={false} renderMode="on-demand">
    <PerfMonitor />
    <Scene {graph} />
  </Canvas>
</div>

<style>
  div {
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
