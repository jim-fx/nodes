<script lang="ts">
  import type { Edge, Node, NodeType } from "@nodarium/types";
  import { GraphSchema } from "@nodarium/types";
  import { onMount } from "svelte";
  import { createKeyMap } from "../../helpers/createKeyMap";
  import AddMenu from "../components/AddMenu.svelte";
  import Background from "../background/Background.svelte";
  import BoxSelection from "../components/BoxSelection.svelte";
  import EdgeEl from "../edges/Edge.svelte";
  import NodeEl from "../node/Node.svelte";
  import Camera from "../components/Camera.svelte";
  import FloatingEdge from "../edges/FloatingEdge.svelte";
  import {
    animate,
    lerp,
    snapToGrid as snapPointToGrid,
  } from "../helpers/index.js";
  import { Canvas } from "@threlte/core";
  import HelpView from "../components/HelpView.svelte";
  import { getGraphManager, getGraphState } from "./state.svelte";
  import { HTML } from "@threlte/extras";

  const {
    snapToGrid = $bindable(true),
    showGrid = $bindable(true),
    showHelp = $bindable(false),
    keymap,
  }: {
    snapToGrid: boolean;
    showGrid: boolean;
    showHelp: boolean;
    keymap: ReturnType<typeof createKeyMap>;
  } = $props();

  const minZoom = 1;
  const maxZoom = 40;
  let mouseDownNodeId = -1;
  const cameraDown = [0, 0];

  let isPanning = $state(false);
  let isDragging = $state(false);
  let hoveredNodeId = $state(-1);

  const graph = getGraphManager();
  const graphState = getGraphState();

  function getEdgeId(edge: Edge) {
    return `${edge[0].id}-${edge[1]}-${edge[2].id}-${edge[3]}`;
  }

  function getEdgePosition(edge: Edge) {
    const fromNode = graph.nodes.get(edge[0].id);
    const toNode = graph.nodes.get(edge[2].id);

    // This check is important because nodes might not be there during some transitions.
    if (!fromNode || !toNode) {
      return [0, 0, 0, 0];
    }

    const pos1 = graphState.getSocketPosition(fromNode, edge[1]);
    const pos2 = graphState.getSocketPosition(toNode, edge[3]);
    return [pos1[0], pos1[1], pos2[0], pos2[1]];
  }

  function handleMouseMove(event: MouseEvent) {
    let mx = event.clientX - graphState.rect.x;
    let my = event.clientY - graphState.rect.y;

    graphState.mousePosition = graphState.projectScreenToWorld(mx, my);
    hoveredNodeId = graphState.getNodeIdFromEvent(event);

    if (!graphState.mouseDown) return;

    // we are creating a new edge here
    if (graphState.activeSocket || graphState.possibleSockets?.length) {
      let smallestDist = 1000;
      let _socket;
      for (const socket of graphState.possibleSockets) {
        const dist = Math.sqrt(
          (socket.position[0] - graphState.mousePosition[0]) ** 2 +
            (socket.position[1] - graphState.mousePosition[1]) ** 2,
        );
        if (dist < smallestDist) {
          smallestDist = dist;
          _socket = socket;
        }
      }

      if (_socket && smallestDist < 0.9) {
        graphState.mousePosition = _socket.position;
        graphState.hoveredSocket = _socket;
      } else {
        graphState.hoveredSocket = null;
      }
      return;
    }

    // handle box selection
    if (graphState.boxSelection) {
      event.preventDefault();
      event.stopPropagation();
      const mouseD = graphState.projectScreenToWorld(
        graphState.mouseDown[0],
        graphState.mouseDown[1],
      );
      const x1 = Math.min(mouseD[0], graphState.mousePosition[0]);
      const x2 = Math.max(mouseD[0], graphState.mousePosition[0]);
      const y1 = Math.min(mouseD[1], graphState.mousePosition[1]);
      const y2 = Math.max(mouseD[1], graphState.mousePosition[1]);
      for (const node of graph.nodes.values()) {
        if (!node?.tmp) continue;
        const x = node.position[0];
        const y = node.position[1];
        const height = graphState.getNodeHeight(node.type);
        if (x > x1 - 20 && x < x2 && y > y1 - height && y < y2) {
          graphState.selectedNodes?.add(node.id);
        } else {
          graphState.selectedNodes?.delete(node.id);
        }
      }
      return;
    }

    // here we are handling dragging of nodes
    if (graphState.activeNodeId !== -1 && mouseDownNodeId !== -1) {
      const node = graph.getNode(graphState.activeNodeId);
      if (!node || event.buttons !== 1) return;

      node.tmp = node.tmp || {};

      const oldX = node.tmp.downX || 0;
      const oldY = node.tmp.downY || 0;

      let newX =
        oldX + (mx - graphState.mouseDown[0]) / graphState.cameraPosition[2];
      let newY =
        oldY + (my - graphState.mouseDown[1]) / graphState.cameraPosition[2];

      if (event.ctrlKey) {
        const snapLevel = graphState.getSnapLevel();
        if (snapToGrid) {
          newX = snapPointToGrid(newX, 5 / snapLevel);
          newY = snapPointToGrid(newY, 5 / snapLevel);
        }
      }

      if (!node.tmp.isMoving) {
        const dist = Math.sqrt((oldX - newX) ** 2 + (oldY - newY) ** 2);
        if (dist > 0.2) {
          node.tmp.isMoving = true;
        }
      }

      const vecX = oldX - newX;
      const vecY = oldY - newY;

      if (graphState.selectedNodes?.size) {
        for (const nodeId of graphState.selectedNodes) {
          const n = graph.getNode(nodeId);
          if (!n?.tmp) continue;
          n.tmp.x = (n?.tmp?.downX || 0) - vecX;
          n.tmp.y = (n?.tmp?.downY || 0) - vecY;
          graphState.updateNodePosition(n);
        }
      }

      node.tmp.x = newX;
      node.tmp.y = newY;

      graphState.updateNodePosition(node);

      return;
    }

    // here we are handling panning of camera
    isPanning = true;
    let newX =
      cameraDown[0] -
      (mx - graphState.mouseDown[0]) / graphState.cameraPosition[2];
    let newY =
      cameraDown[1] -
      (my - graphState.mouseDown[1]) / graphState.cameraPosition[2];

    graphState.setCameraTransform(newX, newY);
  }

  const zoomSpeed = 2;
  function handleMouseScroll(event: WheelEvent) {
    const bodyIsFocused =
      document.activeElement === document.body ||
      document.activeElement === graphState.wrapper ||
      document?.activeElement?.id === "graph";
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
        isNegative
          ? graphState.cameraPosition[2] / delta
          : graphState.cameraPosition[2] * delta,
      ),
    );

    // Calculate the ratio of the new zoom to the original zoom
    const zoomRatio = newZoom / graphState.cameraPosition[2];

    // Update camera position and zoom level
    graphState.setCameraTransform(
      graphState.mousePosition[0] -
        (graphState.mousePosition[0] - graphState.cameraPosition[0]) /
          zoomRatio,
      graphState.mousePosition[1] -
        (graphState.mousePosition[1] - graphState.cameraPosition[1]) /
          zoomRatio,
      newZoom,
    );
  }

  function handleMouseDown(event: MouseEvent) {
    if (graphState.mouseDown) return;
    graphState.edgeEndPosition = null;

    if (event.target instanceof HTMLElement) {
      if (
        event.target.nodeName !== "CANVAS" &&
        !event.target.classList.contains("node") &&
        !event.target.classList.contains("content")
      ) {
        return;
      }
    }

    let mx = event.clientX - graphState.rect.x;
    let my = event.clientY - graphState.rect.y;

    graphState.mouseDown = [mx, my];
    cameraDown[0] = graphState.cameraPosition[0];
    cameraDown[1] = graphState.cameraPosition[1];

    const clickedNodeId = graphState.getNodeIdFromEvent(event);
    mouseDownNodeId = clickedNodeId;

    // if we clicked on a node
    if (clickedNodeId !== -1) {
      if (graphState.activeNodeId === -1) {
        graphState.activeNodeId = clickedNodeId;
        // if the selected node is the same as the clicked node
      } else if (graphState.activeNodeId === clickedNodeId) {
        //$activeNodeId = -1;
        // if the clicked node is different from the selected node and secondary
      } else if (event.ctrlKey) {
        graphState.selectedNodes.add(graphState.activeNodeId);
        graphState.selectedNodes.delete(clickedNodeId);
        graphState.activeNodeId = clickedNodeId;
        // select the node
      } else if (event.shiftKey) {
        const activeNode = graph.getNode(graphState.activeNodeId);
        const newNode = graph.getNode(clickedNodeId);
        if (activeNode && newNode) {
          const edge = graph.getNodesBetween(activeNode, newNode);
          if (edge) {
            graphState.selectedNodes.clear();
            for (const node of edge) {
              graphState.selectedNodes.add(node.id);
            }
            graphState.selectedNodes.add(clickedNodeId);
          }
        }
      } else if (!graphState.selectedNodes.has(clickedNodeId)) {
        graphState.activeNodeId = clickedNodeId;
        graphState.clearSelection();
      }
    } else if (event.ctrlKey) {
      graphState.boxSelection = true;
    }

    const node = graph.getNode(graphState.activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position[0];
    node.tmp.downY = node.position[1];

    if (graphState.selectedNodes) {
      for (const nodeId of graphState.selectedNodes) {
        const n = graph.getNode(nodeId);
        if (!n) continue;
        n.tmp = n.tmp || {};
        n.tmp.downX = n.position[0];
        n.tmp.downY = n.position[1];
      }
    }

    graphState.edgeEndPosition = null;
  }

  function handleMouseUp(event: MouseEvent) {
    isPanning = false;
    if (!graphState.mouseDown) return;

    const activeNode = graph.getNode(graphState.activeNodeId);

    const clickedNodeId = graphState.getNodeIdFromEvent(event);

    if (clickedNodeId !== -1) {
      if (activeNode) {
        if (!activeNode?.tmp?.isMoving && !event.ctrlKey && !event.shiftKey) {
          graphState.activeNodeId = clickedNodeId;
          graphState.clearSelection();
        }
      }
    }

    if (activeNode?.tmp?.isMoving) {
      activeNode.tmp = activeNode.tmp || {};
      activeNode.tmp.isMoving = false;
      if (snapToGrid) {
        const snapLevel = graphState.getSnapLevel();
        activeNode.position[0] = snapPointToGrid(
          activeNode?.tmp?.x ?? activeNode.position[0],
          5 / snapLevel,
        );
        activeNode.position[1] = snapPointToGrid(
          activeNode?.tmp?.y ?? activeNode.position[1],
          5 / snapLevel,
        );
      } else {
        activeNode.position[0] = activeNode?.tmp?.x ?? activeNode.position[0];
        activeNode.position[1] = activeNode?.tmp?.y ?? activeNode.position[1];
      }
      const nodes = [
        ...[...(graphState.selectedNodes?.values() || [])].map((id) =>
          graph.getNode(id),
        ),
      ] as Node[];

      const vec = [
        activeNode.position[0] - (activeNode?.tmp.x || 0),
        activeNode.position[1] - (activeNode?.tmp.y || 0),
      ];

      for (const node of nodes) {
        if (!node) continue;
        node.tmp = node.tmp || {};
        const { x, y } = node.tmp;
        if (x !== undefined && y !== undefined) {
          node.position[0] = x + vec[0];
          node.position[1] = y + vec[1];
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
            node.tmp.x = lerp(node.tmp.x, node.position[0], a);
            node.tmp.y = lerp(node.tmp.y, node.position[1], a);
            graphState.updateNodePosition(node);
            if (node?.tmp?.isMoving) {
              return false;
            }
          }
        }
      });
      graph.save();
    } else if (graphState.hoveredSocket && graphState.activeSocket) {
      if (
        typeof graphState.hoveredSocket.index === "number" &&
        typeof graphState.activeSocket.index === "string"
      ) {
        graph.createEdge(
          graphState.hoveredSocket.node,
          graphState.hoveredSocket.index || 0,
          graphState.activeSocket.node,
          graphState.activeSocket.index,
        );
      } else if (
        typeof graphState.activeSocket.index == "number" &&
        typeof graphState.hoveredSocket.index === "string"
      ) {
        graph.createEdge(
          graphState.activeSocket.node,
          graphState.activeSocket.index || 0,
          graphState.hoveredSocket.node,
          graphState.hoveredSocket.index,
        );
      }
      graph.save();
    } else if (graphState.activeSocket && event.ctrlKey) {
      // Handle automatic adding of nodes on ctrl+mouseUp
      graphState.edgeEndPosition = [
        graphState.mousePosition[0],
        graphState.mousePosition[1],
      ];

      if (typeof graphState.activeSocket.index === "number") {
        graphState.addMenuPosition = [
          graphState.mousePosition[0],
          graphState.mousePosition[1] - 25 / graphState.cameraPosition[2],
        ];
      } else {
        graphState.addMenuPosition = [
          graphState.mousePosition[0] - 155 / graphState.cameraPosition[2],
          graphState.mousePosition[1] - 25 / graphState.cameraPosition[2],
        ];
      }
      return;
    }

    // check if camera moved
    if (
      clickedNodeId === -1 &&
      !graphState.boxSelection &&
      cameraDown[0] === graphState.cameraPosition[0] &&
      cameraDown[1] === graphState.cameraPosition[1] &&
      graphState.isBodyFocused()
    ) {
      graphState.activeNodeId = -1;
      graphState.clearSelection();
    }

    graphState.mouseDown = null;
    graphState.boxSelection = false;
    graphState.activeSocket = null;
    graphState.possibleSockets = [];
    graphState.hoveredSocket = null;
    graphState.addMenuPosition = null;
  }

  function handleMouseLeave() {
    isDragging = false;
    isPanning = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    if (!event.dataTransfer) return;
    const nodeId = event.dataTransfer.getData("data/node-id") as NodeType;
    let mx = event.clientX - graphState.rect.x;
    let my = event.clientY - graphState.rect.y;

    if (nodeId) {
      let nodeOffsetX = event.dataTransfer.getData("data/node-offset-x");
      let nodeOffsetY = event.dataTransfer.getData("data/node-offset-y");
      if (nodeOffsetX && nodeOffsetY) {
        mx += parseInt(nodeOffsetX);
        my += parseInt(nodeOffsetY);
      }

      let props = {};
      let rawNodeProps = event.dataTransfer.getData("data/node-props");
      if (rawNodeProps) {
        try {
          props = JSON.parse(rawNodeProps);
        } catch (e) {}
      }

      const pos = graphState.projectScreenToWorld(mx, my);
      graph.registry.load([nodeId]).then(() => {
        graph.createNode({
          type: nodeId,
          props,
          position: pos,
        });
      });
    } else if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];

      if (file.type === "application/wasm") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const buffer = e.target?.result;
          if (buffer?.constructor === ArrayBuffer) {
            const nodeType = await graph.registry.register(buffer);

            graph.createNode({
              type: nodeType.id,
              props: {},
              position: graphState.projectScreenToWorld(mx, my),
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          if (buffer) {
            const state = GraphSchema.parse(JSON.parse(buffer.toString()));
            graph.load(state);
          }
        };
        reader.readAsText(file);
      }
    }
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
    isPanning = false;
  }

  function handlerDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
    isPanning = false;
  }

  function handleDragEnd(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
    isPanning = false;
  }

  onMount(() => {
    if (localStorage.getItem("cameraPosition")) {
      const cPosition = JSON.parse(localStorage.getItem("cameraPosition")!);
      if (Array.isArray(cPosition)) {
        graphState.setCameraTransform(cPosition[0], cPosition[1], cPosition[2]);
      }
    }
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
  onwheel={handleMouseScroll}
  bind:this={graphState.wrapper}
  class="graph-wrapper"
  class:is-panning={isPanning}
  class:is-hovering={hoveredNodeId !== -1}
  aria-label="Graph"
  role="button"
  tabindex="0"
  bind:clientWidth={graphState.width}
  bind:clientHeight={graphState.height}
  ondragenter={handleDragEnter}
  ondragover={handlerDragOver}
  ondragexit={handleDragEnd}
  ondrop={handleDrop}
  onmouseleave={handleMouseLeave}
  onkeydown={keymap.handleKeyboardEvent}
  onmousedown={handleMouseDown}
>
  <input
    type="file"
    accept="application/wasm,application/json"
    id="drop-zone"
    disabled={!isDragging}
    ondragend={handleDragEnd}
    ondragleave={handleDragEnd}
  />
  <label for="drop-zone"></label>

  <Canvas shadows={false} renderMode="on-demand" colorManagementEnabled={false}>
    <Camera
      bind:camera={graphState.camera}
      position={graphState.cameraPosition}
    />

    {#if showGrid !== false}
      <Background
        cameraPosition={graphState.cameraPosition}
        {maxZoom}
        {minZoom}
        width={graphState.width}
        height={graphState.height}
      />
    {/if}

    {#if graphState.boxSelection && graphState.mouseDown}
      <BoxSelection
        cameraPosition={graphState.cameraPosition}
        p1={{
          x:
            graphState.cameraPosition[0] +
            (graphState.mouseDown[0] - graphState.width / 2) /
              graphState.cameraPosition[2],
          y:
            graphState.cameraPosition[1] +
            (graphState.mouseDown[1] - graphState.height / 2) /
              graphState.cameraPosition[2],
        }}
        p2={{ x: graphState.mousePosition[0], y: graphState.mousePosition[1] }}
      />
    {/if}

    {#if graph.status === "idle"}
      {#if graphState.addMenuPosition}
        <AddMenu />
      {/if}

      {#if graphState.activeSocket}
        <FloatingEdge
          z={graphState.cameraPosition[2]}
          from={{
            x: graphState.activeSocket.position[0],
            y: graphState.activeSocket.position[1],
          }}
          to={{
            x: graphState.edgeEndPosition?.[0] ?? graphState.mousePosition[0],
            y: graphState.edgeEndPosition?.[1] ?? graphState.mousePosition[1],
          }}
        />
      {/if}

      {#each graph.edges as edge (getEdgeId(edge))}
        {@const [x1, y1, x2, y2] = getEdgePosition(edge)}
        <EdgeEl
          z={graphState.cameraPosition[2]}
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

      <HTML transform={false}>
        <div
          role="tree"
          id="graph"
          tabindex="0"
          class="wrapper"
          style:transform={`scale(${graphState.cameraPosition[2] * 0.1})`}
          class:hovering-sockets={graphState.activeSocket}
        >
          {#each graph.nodes.values() as node (node.id)}
            <NodeEl
              {node}
              inView={graphState.isNodeInView(node)}
              z={graphState.cameraPosition[2]}
            />
          {/each}
        </div>
      </HTML>
    {:else if graph.status === "loading"}
      <span>Loading</span>
    {:else if graph.status === "error"}
      <span>Error</span>
    {/if}
  </Canvas>
</div>

{#if showHelp}
  <HelpView registry={graph.registry} />
{/if}

<style>
  .graph-wrapper {
    position: relative;
    z-index: 0;
    transition: opacity 0.3s ease;
    height: 100%;
  }

  .wrapper {
    position: absolute;
    z-index: 100;
    width: 0px;
    height: 0px;
  }

  .is-hovering {
    cursor: pointer;
  }

  .is-panning {
    cursor: grab;
  }

  input {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: var(--layer-2);
    opacity: 0;
  }
  input:disabled {
    opacity: 0;
    pointer-events: none;
  }
  input:disabled + label {
    opacity: 0;
    pointer-events: none;
  }

  label {
    position: absolute;
    z-index: 1;
    top: 10px;
    left: 10px;
    border-radius: 5px;
    width: calc(100% - 20px);
    height: calc(100% - 25px);
    border: dashed 4px var(--layer-2);
    background: var(--layer-1);
    opacity: 0.5;
  }
</style>
