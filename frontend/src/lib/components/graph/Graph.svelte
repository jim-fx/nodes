<script lang="ts">
  import Edge from "../Edge.svelte";
  import { HTML } from "@threlte/extras";
  import Node from "../Node.svelte";
  import { animate, lerp, snapToGrid } from "$lib/helpers";
  import Debug from "../debug/Debug.svelte";
  import { OrthographicCamera } from "three";
  import Background from "../background/Background.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { setContext } from "svelte";
  import { GraphState } from "./state";
  import Camera from "../Camera.svelte";
  import type { Node as NodeType } from "$lib/types";

  export let graph: GraphManager;
  setContext("graphManager", graph);
  const status = graph.status;
  const nodes = graph.nodes;
  const edges = graph.edges;

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

  $: edgePositions = $edges.map((edge) => {
    const index = Object.keys(edge[2].tmp?.type?.inputs || {}).indexOf(edge[3]);
    return [
      edge[0].position.x + 5,
      edge[0].position.y + 0.625 + edge[1] * 2.5,
      edge[2].position.x,
      edge[2].position.y + 2.5 + index * 2.5,
    ];
  });

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
      } else {
        state.hoveredSocket.set(null);
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

    nodes.set($nodes);
    edges.set($edges);
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
    const node = graph.getNode($activeNodeId);
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
      const fx = snapToGrid(node.position.x, 5 / snapLevel);
      const fy = snapToGrid(node.position.y, 5 / snapLevel);
      animate(500, (a: number) => {
        node.position.x = lerp(node.position.x, fx, a);
        node.position.y = lerp(node.position.y, fy, a);
        if (node?.tmp?.isMoving) {
          return false;
        }
        nodes.set($nodes);
        edges.set($edges);
      });
      nodes.set($nodes);
      edges.set($edges);
    } else if ($hoveredSocket && $mouseDown && $mouseDown?.node) {
      if ($hoveredSocket.isInput) {
        const newEdge: [NodeType, number, NodeType, string] = [
          $hoveredSocket.node,
          $hoveredSocket.index || 0,
          $mouseDown.node,
          Object.keys($mouseDown?.node?.tmp?.type?.inputs || {})[
            $mouseDown?.index || 0
          ],
        ];
        $edges = [...$edges, newEdge];
      } else {
        const newEdge: [NodeType, number, NodeType, string] = [
          $mouseDown.node,
          $mouseDown?.index || 0,
          $hoveredSocket.node,
          Object.keys($hoveredSocket.node?.tmp?.type?.inputs || {})[
            $hoveredSocket.index
          ],
        ];
        $edges = [...$edges, newEdge];
      }
    }

    $mouseDown = false;
    $hoveredSocket = null;
    $activeNodeId = -1;
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
  {#each edgePositions as [x1, y1, x2, y2]}
    <Edge
      from={{
        x: x1,
        y: y1,
      }}
      to={{
        x: x2,
        y: y2,
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
      style={`--cz: ${$cameraPosition[2]}; ${$mouseDown ? `--node-hovered-${$mouseDown.isInput ? "out" : "in"}-${$mouseDown.type}: red;` : ""}`}
    >
      {#each $nodes as node}
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
