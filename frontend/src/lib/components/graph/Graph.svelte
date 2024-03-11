<script lang="ts">
  import Edge from "../Edge.svelte";
  import { HTML } from "@threlte/extras";
  import Node from "../Node.svelte";
  import { snapToGrid } from "$lib/helpers";
  import Debug from "../debug/Debug.svelte";
  import { OrthographicCamera } from "three";
  import Background from "../background/Background.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { setContext } from "svelte";
  import { GraphState } from "./graph-state";
  import Camera from "../Camera.svelte";
  import { event } from "@tauri-apps/api";

  export let graph: GraphManager;
  setContext("graphManager", graph);
  const status = graph.status;

  const state = new GraphState(graph);
  setContext("graphState", state);
  const mouse = state.mouse;
  const dimensions = state.dimensions;
  const mouseDown = state.mouseDown;
  const cameraPosition = state.cameraPosition;
  const cameraBounds = state.cameraBounds;
  const activeNodeId = state.activeNodeId;
  const hoveredSocket = state.hoveredSocket;

  let camera: OrthographicCamera;

  const minZoom = 4;
  const maxZoom = 150;

  let edges = graph?.getEdges() || [];

  function handleMouseMove(event: MouseEvent) {
    state.setMouseFromEvent(event);

    if (!$mouseDown) return;
    if (state?.possibleSockets?.length) {
      let smallestDist = 1000;
      let _socket;
      for (const socket of state.possibleSockets) {
        const posX = socket.position[0];
        const posY = socket.position[1];

        const dist = Math.sqrt(
          (posX - $mouse[0]) ** 2 + (posY - $mouse[1]) ** 2,
        );
        if (dist < smallestDist) {
          smallestDist = dist;
          _socket = socket;
        }
      }

      if (_socket && smallestDist < 0.3) {
        state.setMouse(_socket.position[0], _socket.position[1]);
        state.hoveredSocket.set(_socket);
      }
    }

    if ($activeNodeId === -1) return;

    const node = graph.getNode($activeNodeId);

    if (!node) return;

    if (!node.tmp) node.tmp = {};
    node.tmp.isMoving = true;

    let newX =
      (node?.tmp?.downX || 0) +
      (event.clientX - $mouseDown.x) / $cameraPosition[2];
    let newY =
      (node?.tmp?.downY || 0) +
      (event.clientY - $mouseDown.y) / $cameraPosition[2];

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
    if ($mouseDown) return;

    for (const node of ev.composedPath()) {
      let _activeNodeId = (node as unknown as HTMLElement)?.getAttribute?.(
        "data-node-id",
      )!;
      if (_activeNodeId) {
        $activeNodeId = parseInt(_activeNodeId, 10);
        break;
      }
    }
    if ($activeNodeId < 0) return;

    $mouseDown = { x: ev.clientX, y: ev.clientY };
    const node = graph.nodes.find((node) => node.id === $activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
  }

  function getSnapLevel() {
    const z = $cameraPosition[2];
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
      node.position.x > $cameraBounds[0] &&
      node.position.x < $cameraBounds[1] &&
      node.position.y > $cameraBounds[2] &&
      node.position.y < $cameraBounds[3]
    );
  }

  function handleMouseUp(ev: MouseEvent) {
    if (ev.button !== 0) return;

    const node = graph.getNode($activeNodeId);
    if (node) {
      node.tmp = node.tmp || {};
      node.tmp.isMoving = false;
      const snapLevel = getSnapLevel();
      node.position.x = snapToGrid(node.position.x, 5 / snapLevel);
      node.position.y = snapToGrid(node.position.y, 5 / snapLevel);
    } else if ($hoveredSocket && $mouseDown && $mouseDown?.node) {
      const newEdge = [
        $mouseDown.node,
        $mouseDown.socketIndex,
        $hoveredSocket.node,
        $hoveredSocket.index,
      ];
      edges.push(newEdge);
    }

    $mouseDown = false;
    $hoveredSocket = null;
    $activeNodeId = -1;
    graph.nodes = [...graph.nodes];
    edges = [...edges];
  }
</script>

<svelte:document
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
/>

<Debug />

<Camera bind:camera {maxZoom} {minZoom} bind:position={$cameraPosition} />

<Background
  cx={$cameraPosition[0]}
  cy={$cameraPosition[1]}
  cz={$cameraPosition[2]}
  {maxZoom}
  {minZoom}
  width={$dimensions[0]}
  height={$dimensions[1]}
/>

{#if $status === "idle"}
  {#each edges as edge}
    <Edge
      from={{
        x: edge[0].position.x + 5,
        y: edge[0].position.y + 0.625 + edge[1] * 2.5,
      }}
      to={{
        x: edge[2].position.x,
        y: edge[2].position.y + 2.5 + edge[3] * 2.5,
      }}
    />
  {/each}

  {#if $mouseDown && $mouseDown?.node}
    <Edge from={$mouseDown} to={{ x: $mouse[0], y: $mouse[1] }} />
  {/if}

  <HTML transform={false}>
    <div
      role="tree"
      tabindex="0"
      class="wrapper"
      class:zoom-small={$cameraPosition[2] < 10}
      style={`--cz: ${$cameraPosition[2]}`}
    >
      {#each graph.nodes as node}
        <Node {node} inView={$cameraPosition && isNodeInView(node)} />
      {/each}
    </div>
  </HTML>
{:else if $status === "loading"}
  <span>Loading</span>
{:else if $status === "error"}
  <span>Error</span>
{/if}

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
