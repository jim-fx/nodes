<script lang="ts">
  import { animate, lerp, snapToGrid } from "$lib/helpers";
  import Debug from "../debug/Debug.svelte";
  import { OrthographicCamera } from "three";
  import Background from "../background/Background.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { setContext } from "svelte";
  import Camera from "../Camera.svelte";
  import GraphView from "./GraphView.svelte";
  import type { Node as NodeType } from "$lib/types";
  import FloatingEdge from "../edges/FloatingEdge.svelte";
  import * as debug from "../debug";
  import type { Socket } from "$lib/types";

  export let graph: GraphManager;
  setContext("graphManager", graph);
  const status = graph.status;
  const nodes = graph.nodes;
  const edges = graph.edges;

  let camera: OrthographicCamera;
  const minZoom = 4;
  const maxZoom = 150;
  let mousePosition = [0, 0];
  let mouseDown: null | [number, number] = null;
  let cameraPosition: [number, number, number] = [0, 1, 0];
  let width = 100;
  let height = 100;

  let activeNodeId = -1;
  let downSocket: null | Socket = null;
  let possibleSockets: Socket[] = [];
  $: possibleSocketIds = possibleSockets?.length
    ? new Set(possibleSockets.map((s) => `${s.node.id}-${s.index}`))
    : null;
  let hoveredSocket: Socket | null = null;

  $: cameraBounds = [
    cameraPosition[0] - width / cameraPosition[2],
    cameraPosition[0] + width / cameraPosition[2],
    cameraPosition[1] - height / cameraPosition[2],
    cameraPosition[1] + height / cameraPosition[2],
  ];

  setContext("isNodeInView", (node: NodeType) => {
    return (
      node.position.x > cameraBounds[0] &&
      node.position.x < cameraBounds[1] &&
      node.position.y > cameraBounds[2] &&
      node.position.y < cameraBounds[3]
    );
  });

  setContext("setDownSocket", (socket: Socket) => {
    downSocket = socket;

    let { node, index, position } = socket;

    // remove existing edge
    if (typeof index === "string") {
      const edges = graph.getEdgesToNode(node);
      console.log({ edges });
      for (const edge of edges) {
        if (edge[3] === index) {
          node = edge[0];
          index = edge[1];
          position = getSocketPosition({ node, index });
          graph.removeEdge(edge);
          break;
        }
      }
    }

    mouseDown = position;
    downSocket = {
      node,
      index,
      position,
    };

    possibleSockets = graph
      .getPossibleSockets(downSocket)
      .map(([node, index]) => {
        return {
          node,
          index,
          position: getSocketPosition({ node, index }),
        };
      });
  });

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

  function getSocketPosition(
    socket: Omit<Socket, "position">,
  ): [number, number] {
    if (typeof socket.index === "number") {
      return [
        socket.node.position.x + 5,
        socket.node.position.y + 0.625 + 2.5 * socket.index,
      ];
    } else {
      const _index = Object.keys(socket.node.tmp?.type?.inputs || {}).indexOf(
        socket.index,
      );
      return [
        socket.node.position.x,
        socket.node.position.y + 2.5 + 2.5 * _index,
      ];
    }
  }

  function setMouseFromEvent(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;

    mousePosition = [
      cameraPosition[0] + (x - width / 2) / cameraPosition[2],
      cameraPosition[1] + (y - height / 2) / cameraPosition[2],
    ];
  }

  function handleMouseMove(event: MouseEvent) {
    setMouseFromEvent(event);

    if (!mouseDown) return;

    if (possibleSockets?.length) {
      let smallestDist = 1000;
      let _socket;
      for (const socket of possibleSockets) {
        const dist = Math.sqrt(
          (socket.position[0] - mousePosition[0]) ** 2 +
            (socket.position[1] - mousePosition[1]) ** 2,
        );
        if (dist < smallestDist) {
          smallestDist = dist;
          _socket = socket;
        }
      }

      if (_socket && smallestDist < 0.3) {
        mousePosition = _socket.position;
        hoveredSocket = _socket;
      } else {
        hoveredSocket = null;
      }
    }

    if (activeNodeId === -1) return;

    const node = graph.getNode(activeNodeId);
    if (!node) return;

    node.tmp = node.tmp || {};
    node.tmp.isMoving = true;

    let newX =
      (node?.tmp?.downX || 0) +
      (event.clientX - mouseDown[0]) / cameraPosition[2];
    let newY =
      (node?.tmp?.downY || 0) +
      (event.clientY - mouseDown[1]) / cameraPosition[2];

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

  function handleMouseDown(event: MouseEvent) {
    if (mouseDown) return;

    for (const node of event.composedPath()) {
      let _activeNodeId = (node as unknown as HTMLElement)?.getAttribute?.(
        "data-node-id",
      )!;
      if (_activeNodeId) {
        activeNodeId = parseInt(_activeNodeId, 10);
        break;
      }
    }
    if (activeNodeId < 0) return;

    mouseDown = [event.clientX, event.clientY];
    const node = graph.getNode(activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
  }

  function handleMouseUp(event: MouseEvent) {
    if (event.button !== 0) return;

    const node = graph.getNode(activeNodeId);
    if (node) {
      node.tmp = node.tmp || {};
      node.tmp.isMoving = false;
      const snapLevel = getSnapLevel();
      const fx = snapToGrid(node.position.x, 5 / snapLevel);
      const fy = snapToGrid(node.position.y, 5 / snapLevel);
      animate(500, (a: number) => {
        node.position.x = lerp(node.position.x, fx, a);
        node.position.y = lerp(node.position.y, fy, a);
        nodes.set($nodes);
        edges.set($edges);
        if (node?.tmp?.isMoving) {
          return false;
        }
      });
    } else if (hoveredSocket && downSocket) {
      console.log({ hoveredSocket, downSocket });
      if (
        typeof hoveredSocket.index === "number" &&
        typeof downSocket.index === "string"
      ) {
        graph.createEdge(
          hoveredSocket.node,
          hoveredSocket.index || 0,
          downSocket.node,
          downSocket.index,
        );
      } else {
        graph.createEdge(
          downSocket.node,
          downSocket.index || 0,
          hoveredSocket.node,
          hoveredSocket.index,
        );
      }
    }

    mouseDown = null;
    downSocket = null;
    possibleSockets = [];
    hoveredSocket = null;
    activeNodeId = -1;
  }
</script>

<svelte:document
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
/>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<Debug />

<Camera bind:camera {maxZoom} {minZoom} bind:position={cameraPosition} />

<Background {cameraPosition} {maxZoom} {minZoom} {width} {height} />

{#if $status === "idle"}
  {#if downSocket}
    <FloatingEdge
      from={{ x: downSocket.position[0], y: downSocket.position[1] }}
      to={{ x: mousePosition[0], y: mousePosition[1] }}
    />
  {/if}
  <GraphView
    {nodes}
    {edges}
    {cameraPosition}
    {possibleSocketIds}
    {downSocket}
  />
{:else if $status === "loading"}
  <span>Loading</span>
{:else if $status === "error"}
  <span>Error</span>
{/if}
