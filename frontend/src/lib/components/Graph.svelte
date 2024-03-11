<script lang="ts">
  import Edge from "./Edge.svelte";

  import { HTML } from "@threlte/extras";
  import Node from "./Node.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { snapToGrid } from "$lib/helpers";
  import { writable, type Writable } from "svelte/store";

  export let graph: GraphManager;

  export let width = globalThis?.innerWidth || 100;
  export let height = globalThis?.innerHeight || 100;

  let edges = graph?.getEdges() || [];

  export let cameraPosition: [number, number, number] = [0, 1, 0];
  let cameraBounds = [-Infinity, Infinity, -Infinity, Infinity];

  $: if (cameraPosition[0]) {
    cameraBounds[0] = cameraPosition[0] - width / cameraPosition[2];
    cameraBounds[1] = cameraPosition[0] + width / cameraPosition[2];
    cameraBounds[2] = cameraPosition[1] - height / cameraPosition[2];
    cameraBounds[3] = cameraPosition[1] + height / cameraPosition[2];
  }

  let mouseX = 0;
  let mouseY = 0;

  let mouseDown: Writable<false | { x: number; y: number; socket: any }> =
    writable(false);

  let activeNodeId: string;

  function handleMouseMove(event: MouseEvent) {
    if (!$mouseDown) return;

    mouseX =
      cameraPosition[0] + (event.clientX - width / 2) / cameraPosition[2];
    mouseY =
      cameraPosition[1] + (event.clientY - height / 2) / cameraPosition[2];

    if (!activeNodeId) return;

    const node = graph.getNode(activeNodeId);

    if (!node) return;

    if (!node.tmp) node.tmp = {};
    node.tmp.isMoving = true;

    let newX =
      (node?.tmp?.downX || 0) +
      (event.clientX - $mouseDown.x) / cameraPosition[2];
    let newY =
      (node?.tmp?.downY || 0) +
      (event.clientY - $mouseDown.y) / cameraPosition[2];

    if (event.ctrlKey) {
      const snapLevel = getSnapLevel();
      newX = snapToGrid(newX, 5 / snapLevel);
      newY = snapToGrid(newY, 5 / snapLevel);
    }
    node.position.x = newX;
    node.position.y = newY;
    node.position = node.position;
    edges = [...edges];
    graph.nodes = [...graph.nodes];
  }

  function handleMouseDown(ev: MouseEvent) {
    for (const node of ev.composedPath()) {
      activeNodeId = (node as unknown as HTMLElement)?.getAttribute?.(
        "data-node-id",
      )!;
      if (activeNodeId) break;
    }
    if (!activeNodeId) return;

    $mouseDown = { x: ev.clientX, y: ev.clientY, socket: null };
    const node = graph.nodes.find((node) => node.id === activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
  }

  function getSnapLevel() {
    const z = cameraPosition[2];
    if (z > 66) {
      return 8;
    } else if (z > 55) {
      return 4;
    } else if (z > 11) {
      return 2;
    } else {
    }
    return 1;
  }

  function isNodeInView(node: any) {
    return (
      node.position.x > cameraBounds[0] &&
      node.position.x < cameraBounds[1] &&
      node.position.y > cameraBounds[2] &&
      node.position.y < cameraBounds[3]
    );
  }

  function handleMouseUp() {
    $mouseDown = false;

    const node = graph.getNode(activeNodeId);

    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.isMoving = false;
    const snapLevel = getSnapLevel();
    node.position.x = snapToGrid(node.position.x, 5 / snapLevel);
    node.position.y = snapToGrid(node.position.y, 5 / snapLevel);

    graph.nodes = [...graph.nodes];
    edges = [...edges];
  }
</script>

<svelte:document
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
/>

{#each edges as edge}
  <Edge from={edge[0]} to={edge[1]} />
{/each}

{#if $mouseDown && $mouseDown?.socket}
  <Edge
    from={{ position: $mouseDown.socket }}
    to={{ position: { x: mouseX, y: mouseY } }}
  />
{/if}

<HTML transform={false}>
  <div
    role="tree"
    tabindex="0"
    class="wrapper"
    class:zoom-small={cameraPosition[2] < 10}
    style={`--cz: ${cameraPosition[2]}`}
  >
    {#each graph.nodes as node}
      <Node
        {node}
        {graph}
        inView={cameraPosition && isNodeInView(node)}
        {mouseDown}
      />
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
