<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Background from "./Background.svelte";
  import { Canvas } from "@threlte/core";
  import Camera from "./Camera.svelte";
  let width = globalThis.innerWidth || 100;
  let height = globalThis.innerHeight || 100;

  let cameraPosition: [number, number, number] = [0, 1, 0];
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<Hst.Story>
  <Canvas shadows={false}>
    <Camera bind:position={cameraPosition} />

    <Background
      cx={cameraPosition[0]}
      cy={cameraPosition[1]}
      cz={cameraPosition[2]}
      {width}
      {height}
    />
  </Canvas>
</Hst.Story>

