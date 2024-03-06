<script lang="ts">
  import type { OrthographicCamera } from "three";
  import Camera from "./Camera.svelte";
  import Background from "./Background.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import Graph from "./Graph.svelte";

  export let graph: GraphManager;

  const status = graph.status;

  let camera: OrthographicCamera;
  let cameraPosition: [number, number, number] = [0, 1, 0];

  const minZoom = 4;
  const maxZoom = 150;

  let width = globalThis?.innerWidth || 100;
  let height = globalThis?.innerHeight || 100;
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<Camera bind:camera {maxZoom} {minZoom} bind:position={cameraPosition} />

<Background
  cx={cameraPosition[0]}
  cy={cameraPosition[1]}
  cz={cameraPosition[2]}
  {maxZoom}
  {minZoom}
  {width}
  {height}
/>

{#if $status === "idle"}
  <Graph {graph} {cameraPosition} />
{:else if $status === "loading"}
  <a href="/graph">Loading...</a>
{:else if $status === "error"}
  <a href="/graph">Error</a>
{/if}
