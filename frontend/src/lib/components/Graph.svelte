<script lang="ts">
  import Edge from "./Edge.svelte";

  import { HTML } from "@threlte/extras";
  import Node from "./Node.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { onMount } from "svelte";
  import { snapToGrid } from "$lib/helpers";

  export let graph: GraphManager;

  let edges = graph?.getEdges() || [];

  export let cameraPosition: [number, number, number] = [0, 1, 0];

  export let width = globalThis?.innerWidth || 100;
  export let height = globalThis?.innerHeight || 100;

  let mouseX = 0;
  let mouseY = 0;

  let mouseDown = false;
  let mouseDownX = 0;
  let mouseDownY = 0;

  let activeNodeId: string;

  function handleMouseMove(event: MouseEvent) {
    if (!mouseDown) return;

    mouseX =
      cameraPosition[0] + (event.clientX - width / 2) / cameraPosition[2];
    mouseY =
      cameraPosition[1] + (event.clientY - height / 2) / cameraPosition[2];

    if (!activeNodeId) return;

    const node = graph.getNode(activeNodeId);

    if (!node) return;

    let newX =
      (node?.tmp?.downX || 0) +
      (event.clientX - mouseDownX) / cameraPosition[2];
    let newY =
      (node?.tmp?.downY || 0) +
      (event.clientY - mouseDownY) / cameraPosition[2];

    if (event.ctrlKey) {
      newX = snapToGrid(newX, 2.5);
      newY = snapToGrid(newY, 2.5);
    }
    node.position.x = newX;
    node.position.y = newY;
    node.position = node.position;
    edges = [...edges];
    graph.nodes = [...graph.nodes];
  }

  function handleMouseDown(ev: MouseEvent) {
    activeNodeId = (ev?.target as HTMLElement)?.getAttribute("data-node-id")!;

    mouseDown = true;
    mouseDownX = ev.clientX;
    mouseDownY = ev.clientY;
    const node = graph.nodes.find((node) => node.id === activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
  }

  function handleMouseUp() {
    mouseDown = false;
  }
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

{#each edges as edge}
  <Edge from={edge[0]} to={edge[1]} />
{/each}

<HTML transform={false}>
  <div
    role="tree"
    tabindex="0"
    class="wrapper"
    style={`--cz: ${cameraPosition[2]}`}
    on:mousedown={handleMouseDown}
  >
    {#each graph.nodes as node}
      <Node {node} {graph} />
    {/each}
  </div>
</HTML>

<style>
  :global(body) {
    overflow: hidden;
  }

  .wrapper {
    position: absolute;
    z-index: 100;
    width: 0px;
    height: 0px;
    transform: scale(calc(var(--cz) * 0.1));
  }
</style>
