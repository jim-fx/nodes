<script lang="ts">
  import { animate, lerp, snapToGrid } from "$lib/helpers";
  import type { OrthographicCamera } from "three";
  import Background from "../background/Background.svelte";
  import type { GraphManager } from "$lib/graph-manager";
  import { onMount, setContext } from "svelte";
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
  import BoxSelection from "../BoxSelection.svelte";

  export let graph: GraphManager;
  setContext("graphManager", graph);
  const status = graph.status;
  const nodes = graph.nodes;
  const edges = graph.edges;

  let camera: OrthographicCamera;
  const minZoom = 1;
  const maxZoom = 40;
  let mousePosition = [0, 0];
  let mouseDown: null | [number, number] = null;
  let boxSelection = false;
  let loaded = false;
  const cameraDown = [0, 0];
  let cameraPosition: [number, number, number] = [0, 0, 4];

  $: if (cameraPosition && loaded) {
    localStorage.setItem("cameraPosition", JSON.stringify(cameraPosition));
  }

  let width = globalThis?.innerWidth ?? 100;
  let height = globalThis?.innerHeight ?? 100;

  let cameraBounds = [-1000, 1000, -1000, 1000];
  $: cameraBounds = [
    cameraPosition[0] - width / cameraPosition[2] / 2,
    cameraPosition[0] + width / cameraPosition[2] / 2,
    cameraPosition[1] - height / cameraPosition[2] / 2,
    cameraPosition[1] + height / cameraPosition[2] / 2,
  ];
  function setCameraTransform(x: number, y: number, z: number) {
    if (!camera) return;
    camera.position.x = x;
    camera.position.z = y;
    camera.zoom = z;
    cameraPosition = [x, y, z];
  }

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
    cameraPosition,
  };

  function updateNodePosition(node: NodeType) {
    if (node?.tmp?.ref) {
      if (node.tmp["x"] !== undefined && node.tmp["y"] !== undefined) {
        node.tmp.ref.style.setProperty("--nx", `${node.tmp.x * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.tmp.y * 10}px`);
        node.tmp.mesh.position.x = node.tmp.x + 10;
        node.tmp.mesh.position.z = node.tmp.y + getNodeHeight(node.type) / 2;
        if (node.tmp.x === node.position.x && node.tmp.y === node.position.y) {
          delete node.tmp.x;
          delete node.tmp.y;
        }
      } else {
        node.tmp.ref.style.setProperty("--nx", `${node.position.x * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.position.y * 10}px`);
        node.tmp.mesh.position.x = node.position.x + 10;
        node.tmp.mesh.position.z =
          node.position.y + getNodeHeight(node.type) / 2;
      }
    }
  }
  setContext("updateNodePosition", updateNodePosition);

  const nodeHeightCache: Record<string, number> = {};
  function getNodeHeight(nodeTypeId: string) {
    if (nodeTypeId in nodeHeightCache) {
      return nodeHeightCache[nodeTypeId];
    }
    const node = graph.getNodeType(nodeTypeId);
    if (!node?.inputs) {
      return 5;
    }
    const height = 5 + 10 * Object.keys(node.inputs).length;
    nodeHeightCache[nodeTypeId] = height;
    console.log(node, height);
    return height;
  }
  setContext("getNodeHeight", getNodeHeight);

  setContext("isNodeInView", (node: NodeType) => {
    const height = getNodeHeight(node.type);
    const width = 20;
    return (
      node.position.x > cameraBounds[0] - width &&
      node.position.x < cameraBounds[1] &&
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
          position = getSocketPosition(node, index);
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
          position: getSocketPosition(node, index),
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
    node: NodeType,
    index: string | number,
  ): [number, number] {
    if (typeof index === "number") {
      return [
        (node?.tmp?.x ?? node.position.x) + 20,
        (node?.tmp?.y ?? node.position.y) + 2.5 + 10 * index,
      ];
    } else {
      const _index = Object.keys(node.tmp?.type?.inputs || {}).indexOf(index);
      return [
        node?.tmp?.x ?? node.position.x,
        (node?.tmp?.y ?? node.position.y) + 10 + 10 * _index,
      ];
    }
  }
  setContext("getSocketPosition", getSocketPosition);

  function projectScreenToWorld(x: number, y: number): [number, number] {
    return [
      cameraPosition[0] + (x - width / 2) / cameraPosition[2],
      cameraPosition[1] + (y - height / 2) / cameraPosition[2],
    ];
  }

  function handleMouseMove(event: MouseEvent) {
    mousePosition = projectScreenToWorld(event.clientX, event.clientY);

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

      if (_socket && smallestDist < 0.9) {
        mousePosition = _socket.position;
        $hoveredSocket = _socket;
      } else {
        $hoveredSocket = null;
      }
      return;
    }

    // handle box selection
    if (boxSelection) {
      event.preventDefault();
      event.stopPropagation();
      const mouseD = projectScreenToWorld(mouseDown[0], mouseDown[1]);
      const x1 = Math.min(mouseD[0], mousePosition[0]);
      const x2 = Math.max(mouseD[0], mousePosition[0]);
      const y1 = Math.min(mouseD[1], mousePosition[1]);
      const y2 = Math.max(mouseD[1], mousePosition[1]);
      for (const node of $nodes.values()) {
        if (!node?.tmp) continue;
        const x = node.position.x;
        const y = node.position.y;
        const height = getNodeHeight(node.type);
        if (x > x1 - 20 && x < x2 && y > y1 - height && y < y2) {
          $selectedNodes?.add(node.id);
        } else {
          $selectedNodes?.delete(node.id);
        }
      }
      $selectedNodes = $selectedNodes;
      return;
    }

    // here we are handling dragging of nodes
    if ($activeNodeId !== -1) {
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
          if (!n?.tmp) continue;
          n.tmp.x = (n?.tmp?.downX || 0) - vecX;
          n.tmp.y = (n?.tmp?.downY || 0) - vecY;
          updateNodePosition(n);
        }
      }

      node.tmp.x = newX;
      node.tmp.y = newY;

      updateNodePosition(node);

      $edges = $edges;
      return;
    }

    // here we are handling panning of camera
    let newX =
      cameraDown[0] - (event.clientX - mouseDown[0]) / cameraPosition[2];
    let newY =
      cameraDown[1] - (event.clientY - mouseDown[1]) / cameraPosition[2];

    setCameraTransform(newX, newY, cameraPosition[2]);
  }

  const zoomSpeed = 2;
  function handleMouseScroll(event: WheelEvent) {
    const bodyIsFocused = document.activeElement === document.body;
    if (!bodyIsFocused) return;

    // Define zoom speed and clamp it between -1 and 1
    const isNegative = event.deltaY < 0;
    const normalizedDelta = Math.abs(event.deltaY * 0.01);
    const delta = Math.pow(0.95, zoomSpeed * normalizedDelta);

    // Calculate new zoom level and clamp it between minZoom and maxZoom
    const newZoom = Math.max(
      minZoom,
      Math.min(
        maxZoom,
        isNegative ? cameraPosition[2] / delta : cameraPosition[2] * delta,
      ),
    );

    // Calculate the ratio of the new zoom to the original zoom
    const zoomRatio = newZoom / cameraPosition[2];

    // Update camera position and zoom level
    setCameraTransform(
      mousePosition[0] - (mousePosition[0] - cameraPosition[0]) / zoomRatio,
      mousePosition[1] - (mousePosition[1] - cameraPosition[1]) / zoomRatio,
      newZoom,
    );
  }

  function handleMouseDown(event: MouseEvent) {
    if (mouseDown) return;
    mouseDown = [event.clientX, event.clientY];
    cameraDown[0] = cameraPosition[0];
    cameraDown[1] = cameraPosition[1];

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
                const selected = new Set(edge.map((n) => n.id));
                selected.delete(nodeId);
                $selectedNodes = selected;
              }
              $activeNodeId = nodeId;
            }
          } else if (!$selectedNodes?.has(nodeId)) {
            $activeNodeId = nodeId;
          }
        } else {
          $activeNodeId = nodeId;
        }
      } else if (event.ctrlKey) {
        boxSelection = true;
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
    const bodyIsFocused = document.activeElement === document.body;

    if (event.key === "Escape") {
      $activeNodeId = -1;
      $selectedNodes?.clear();
      $selectedNodes = $selectedNodes;
      document?.activeElement.blur();
    }

    if (event.key === "a" && event.ctrlKey) {
      $selectedNodes = new Set($nodes.keys());
    }

    if (event.key === "c" && event.ctrlKey) {
    }

    if (event.key === "v" && event.ctrlKey) {
    }

    if (event.key === "z" && event.ctrlKey) {
      graph.history.undo();
      for (const node of $nodes.values()) {
        updateNodePosition(node);
      }
    }

    if (event.key === "y" && event.ctrlKey) {
      graph.history.redo();
      for (const node of $nodes.values()) {
        updateNodePosition(node);
      }
    }

    if (
      (event.key === "Delete" ||
        event.key === "Backspace" ||
        event.key === "x") &&
      bodyIsFocused
    ) {
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
      activeNode.position.x = snapToGrid(
        activeNode?.tmp?.x ?? activeNode.position.x,
        5 / snapLevel,
      );
      activeNode.position.y = snapToGrid(
        activeNode?.tmp?.y ?? activeNode.position.y,
        5 / snapLevel,
      );
      const nodes = [
        ...[...($selectedNodes?.values() || [])].map((id) => graph.getNode(id)),
      ] as NodeType[];

      const vec = [
        activeNode.position.x - (activeNode?.tmp.x || 0),
        activeNode.position.y - (activeNode?.tmp.y || 0),
      ];

      for (const node of nodes) {
        if (!node) continue;
        node.tmp = node.tmp || {};
        const { x, y } = node.tmp;
        if (x !== undefined && y !== undefined) {
          node.position.x = x + vec[0];
          node.position.y = y + vec[1];
        }
      }
      nodes.push(activeNode);
      animate(500, (a: number) => {
        for (const node of nodes) {
          if (
            node?.tmp &&
            node.tmp["x"] !== undefined &&
            node.tmp["y"] !== undefined
          ) {
            node.tmp.x = lerp(node.tmp.x, node.position.x, a);
            node.tmp.y = lerp(node.tmp.y, node.position.y, a);
            updateNodePosition(node);
            if (node?.tmp?.isMoving) {
              return false;
            }
          }
        }

        $edges = $edges;
      });
      graph.save();
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
      graph.save();
    }

    mouseDown = null;
    boxSelection = false;
    $activeSocket = null;
    $possibleSockets = [];
    $possibleSocketIds = null;
    $hoveredSocket = null;
  }

  onMount(() => {
    if (localStorage.getItem("cameraPosition")) {
      const cPosition = JSON.parse(localStorage.getItem("cameraPosition")!);
      if (Array.isArray(cPosition)) {
        setCameraTransform(cPosition[0], cPosition[1], cPosition[2]);
      }
    }
    loaded = true;
  });
</script>

<svelte:document
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mousedown={handleMouseDown}
  on:keydown={handleKeyDown}
/>

<svelte:window
  on:wheel={handleMouseScroll}
  bind:innerWidth={width}
  bind:innerHeight={height}
/>

<Camera bind:camera position={cameraPosition} />

<Background {cameraPosition} {maxZoom} {minZoom} {width} {height} />

{#if boxSelection && mouseDown}
  <BoxSelection
    {cameraPosition}
    p1={{
      x: cameraPosition[0] + (mouseDown[0] - width / 2) / cameraPosition[2],
      y: cameraPosition[1] + (mouseDown[1] - height / 2) / cameraPosition[2],
    }}
    p2={{ x: mousePosition[0], y: mousePosition[1] }}
  />
{/if}

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
