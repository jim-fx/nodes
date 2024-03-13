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
  import type { Socket } from "$lib/types";
  import {
    activeNodeId,
    activeSocket,
    hoveredSocket,
    possibleSockets,
    possibleSocketIds,
    selectedNodes,
  } from "./stores";

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

  $: cameraBounds = [
    cameraPosition[0] - width / cameraPosition[2] / 2,
    cameraPosition[0] + width / cameraPosition[2] / 2,
    cameraPosition[1] - height / cameraPosition[2] / 2,
    cameraPosition[1] + height / cameraPosition[2] / 2,
  ];

  export let debug = {};
  $: debug = {
    activeNodeId: $activeNodeId,
    activeSocket: $activeSocket
      ? `${$activeSocket?.node.id}-${$activeSocket?.index}`
      : null,
    hoveredSocket: $hoveredSocket
      ? `${$hoveredSocket?.node.id}-${$hoveredSocket?.index}`
      : null,
    selectedNodes: [...($selectedNodes?.values() || [])],
  };

  function updateNodePosition(node: NodeType) {
    node.tmp = node.tmp || {};
    if (node?.tmp?.ref) {
      node.tmp.ref.style.setProperty("--nx", `${node.position.x * 10}px`);
      node.tmp.ref.style.setProperty("--ny", `${node.position.y * 10}px`);
    }
  }

  const nodeHeightCache: Record<string, number> = {};
  function getNodeHeight(nodeTypeId: string) {
    if (nodeTypeId in nodeHeightCache) {
      return nodeHeightCache[nodeTypeId];
    }
    const node = graph.getNodeType(nodeTypeId);
    if (!node?.inputs) {
      return 1.25;
    }
    const height = 1.25 + 2.5 * Object.keys(node.inputs).length;
    nodeHeightCache[nodeTypeId] = height;
    return height;
  }

  setContext("isNodeInView", (node: NodeType) => {
    const height = getNodeHeight(node.type);
    const width = 5;
    return (
      // check x-axis
      node.position.x > cameraBounds[0] - width &&
      node.position.x < cameraBounds[1] &&
      // check y-axis
      node.position.y > cameraBounds[2] - height &&
      node.position.y < cameraBounds[3]
    );
  });

  setContext("setDownSocket", (socket: Socket) => {
    $activeSocket = socket;

    let { node, index, position } = socket;

    // remove existing edge
    if (typeof index === "string") {
      const edges = graph.getEdgesToNode(node);
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
    $activeSocket = {
      node,
      index,
      position,
    };

    $possibleSockets = graph
      .getPossibleSockets($activeSocket)
      .map(([node, index]) => {
        return {
          node,
          index,
          position: getSocketPosition({ node, index }),
        };
      });
    $possibleSocketIds = new Set(
      $possibleSockets.map((s) => `${s.node.id}-${s.index}`),
    );
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

    // we are creating a new edge here
    if ($possibleSockets?.length) {
      let smallestDist = 1000;
      let _socket;
      for (const socket of $possibleSockets) {
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
        $hoveredSocket = _socket;
      } else {
        $hoveredSocket = null;
      }
    }

    if ($activeNodeId === -1) return;

    const node = graph.getNode($activeNodeId);
    if (!node || event.buttons !== 1) return;

    node.tmp = node.tmp || {};

    const oldX = node.tmp.downX || 0;
    const oldY = node.tmp.downY || 0;

    let newX = oldX + (event.clientX - mouseDown[0]) / cameraPosition[2];
    let newY = oldY + (event.clientY - mouseDown[1]) / cameraPosition[2];

    if (event.ctrlKey) {
      const snapLevel = getSnapLevel();
      newX = snapToGrid(newX, 5 / snapLevel);
      newY = snapToGrid(newY, 5 / snapLevel);
    }

    if (!node.tmp.isMoving) {
      const dist = Math.sqrt((oldX - newX) ** 2 + (oldY - newY) ** 2);
      if (dist > 0.2) {
        node.tmp.isMoving = true;
      }
    }

    const vecX = oldX - newX;
    const vecY = oldY - newY;

    if ($selectedNodes?.size) {
      for (const nodeId of $selectedNodes) {
        const n = graph.getNode(nodeId);
        if (!n) continue;
        n.position.x = (n?.tmp?.downX || 0) - vecX;
        n.position.y = (n?.tmp?.downY || 0) - vecY;
        updateNodePosition(n);
      }
    }

    node.position.x = newX;
    node.position.y = newY;
    node.position = node.position;

    updateNodePosition(node);

    $edges = $edges;
  }

  function handleMouseDown(event: MouseEvent) {
    if (mouseDown) return;
    mouseDown = [event.clientX, event.clientY];

    if (event.target instanceof HTMLElement && event.buttons === 1) {
      const nodeElement = event.target.closest(".node");
      const _activeNodeId = nodeElement?.getAttribute?.("data-node-id");
      if (_activeNodeId) {
        const nodeId = parseInt(_activeNodeId, 10);
        if ($activeNodeId !== -1) {
          // if the selected node is the same as the clicked node
          if ($activeNodeId === nodeId) {
            //$activeNodeId = -1;
            // if the clicked node is different from the selected node and secondary
          } else if (event.ctrlKey) {
            $selectedNodes = $selectedNodes || new Set();
            $selectedNodes.add($activeNodeId);
            $selectedNodes.delete(nodeId);
            $activeNodeId = nodeId;
            // select the node
          } else if (event.shiftKey) {
            const activeNode = graph.getNode($activeNodeId);
            const newNode = graph.getNode(nodeId);
            if (activeNode && newNode) {
              const edge = graph.getNodesBetween(activeNode, newNode);
              if (edge) {
                $selectedNodes = new Set(edge.map((n) => n.id));
              }
              $activeNodeId = nodeId;
            }
          } else if (!$selectedNodes?.has(nodeId)) {
            $activeNodeId = nodeId;
          }
        } else {
          $activeNodeId = nodeId;
        }
      } else {
        $activeNodeId = -1;
        $selectedNodes?.clear();
        $selectedNodes = $selectedNodes;
      }
    }

    const node = graph.getNode($activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
    if ($selectedNodes) {
      for (const nodeId of $selectedNodes) {
        const n = graph.getNode(nodeId);
        if (!n) continue;
        n.tmp = n.tmp || {};
        n.tmp.downX = n.position.x;
        n.tmp.downY = n.position.y;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Delete") {
      if ($activeNodeId !== -1) {
        const node = graph.getNode($activeNodeId);
        if (node) {
          graph.removeNode(node);
          $activeNodeId = -1;
        }
      }
      if ($selectedNodes) {
        for (const nodeId of $selectedNodes) {
          const node = graph.getNode(nodeId);
          if (node) {
            graph.removeNode(node);
          }
        }
        $selectedNodes.clear();
        $selectedNodes = $selectedNodes;
      }
    }
  }

  function handleMouseUp(event: MouseEvent) {
    const activeNode = graph.getNode($activeNodeId);

    if (event.target instanceof HTMLElement && event.button === 0) {
      const nodeElement = event.target.closest(".node");
      const _activeNodeId = nodeElement?.getAttribute?.("data-node-id");
      if (_activeNodeId) {
        const nodeId = parseInt(_activeNodeId, 10);
        if (activeNode) {
          if (!activeNode?.tmp?.isMoving && !event.ctrlKey && !event.shiftKey) {
            $selectedNodes?.clear();
            $selectedNodes = $selectedNodes;
            $activeNodeId = nodeId;
          }
        }
      }
    }

    if (activeNode?.tmp?.isMoving) {
      activeNode.tmp = activeNode.tmp || {};
      activeNode.tmp.isMoving = false;
      const snapLevel = getSnapLevel();
      const fx = snapToGrid(activeNode.position.x, 5 / snapLevel);
      const fy = snapToGrid(activeNode.position.y, 5 / snapLevel);
      if ($selectedNodes) {
        for (const nodeId of $selectedNodes) {
          const node = graph.getNode(nodeId);
          if (!node) continue;
          node.tmp = node.tmp || {};
          node.tmp.snapX = node.position.x - (activeNode.position.x - fx);
          node.tmp.snapY = node.position.y - (activeNode.position.y - fy);
        }
      }
      animate(500, (a: number) => {
        activeNode.position.x = lerp(activeNode.position.x, fx, a);
        activeNode.position.y = lerp(activeNode.position.y, fy, a);
        updateNodePosition(activeNode);

        if ($selectedNodes) {
          for (const nodeId of $selectedNodes) {
            const node = graph.getNode(nodeId);
            if (!node) continue;
            node.position.x = lerp(node.position.x, node?.tmp?.snapX || 0, a);
            node.position.y = lerp(node.position.y, node?.tmp?.snapY || 0, a);
            updateNodePosition(node);
          }
        }

        if (activeNode?.tmp?.isMoving) {
          return false;
        }

        $edges = $edges;
      });
    } else if ($hoveredSocket && $activeSocket) {
      if (
        typeof $hoveredSocket.index === "number" &&
        typeof $activeSocket.index === "string"
      ) {
        graph.createEdge(
          $hoveredSocket.node,
          $hoveredSocket.index || 0,
          $activeSocket.node,
          $activeSocket.index,
        );
      } else if (
        typeof $activeSocket.index == "number" &&
        typeof $hoveredSocket.index === "string"
      ) {
        graph.createEdge(
          $activeSocket.node,
          $activeSocket.index || 0,
          $hoveredSocket.node,
          $hoveredSocket.index,
        );
      }
    }

    mouseDown = null;
    $activeSocket = null;
    $possibleSockets = [];
    $possibleSocketIds = null;
    $hoveredSocket = null;
  }
</script>

<svelte:window
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
  on:keydown={handleKeyDown}
  bind:innerWidth={width}
  bind:innerHeight={height}
/>

<Debug />

<Camera bind:camera {maxZoom} {minZoom} bind:position={cameraPosition} />

<Background {cameraPosition} {maxZoom} {minZoom} {width} {height} />

{#if $status === "idle"}
  {#if $activeSocket}
    <FloatingEdge
      from={{ x: $activeSocket.position[0], y: $activeSocket.position[1] }}
      to={{ x: mousePosition[0], y: mousePosition[1] }}
    />
  {/if}
  <GraphView {nodes} {edges} {cameraPosition} />
{:else if $status === "loading"}
  <span>Loading</span>
{:else if $status === "error"}
  <span>Error</span>
{/if}
