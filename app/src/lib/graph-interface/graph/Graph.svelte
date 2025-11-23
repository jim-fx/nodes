<script lang="ts">
  import type { Node, NodeType, Socket } from "@nodes/types";
  import { GraphSchema } from "@nodes/types";
  import { getContext, onMount, setContext } from "svelte";
  import type { OrthographicCamera } from "three";
  import { createKeyMap } from "../../helpers/createKeyMap";
  import AddMenu from "../AddMenu.svelte";
  import Background from "../background/Background.svelte";
  import BoxSelection from "../BoxSelection.svelte";
  import Camera from "../Camera.svelte";
  import FloatingEdge from "../edges/FloatingEdge.svelte";
  import {
    animate,
    lerp,
    snapToGrid as snapPointToGrid,
  } from "../helpers/index.js";
  import GraphView from "./GraphView.svelte";
  import { getGraphState } from "./state.svelte";

  import { Canvas } from "@threlte/core";
  import FileSaver from "file-saver";
  import HelpView from "../HelpView.svelte";
  import { getGraphManager } from "./context";

  const graph = getGraphManager();
  const graphState = getGraphState();

  const {
    snapToGrid = $bindable(true),
    showGrid = $bindable(true),
    showHelp = $bindable(false),
  } = $props();

  const keymap = getContext<ReturnType<typeof createKeyMap>>("keymap");

  let wrapper = $state<HTMLDivElement>(null!);

  const rect: DOMRect = $derived(
    wrapper ? wrapper.getBoundingClientRect() : new DOMRect(0, 0, 0, 0),
  );
  let width = $derived(rect?.width ?? 100);
  let height = $derived(rect?.height ?? 100);

  let camera = $state<OrthographicCamera>(null!);
  const minZoom = 1;
  const maxZoom = 40;
  let mousePosition = $state([0, 0]);
  let mouseDown = $state<[number, number] | null>(null);
  let mouseDownId = -1;
  let boxSelection = $state(false);
  const cameraDown = [0, 0];
  let cameraPosition: [number, number, number] = $state([0, 0, 4]);
  let addMenuPosition = $state<[number, number] | null>(null);
  let clipboard: null | {
    nodes: Node[];
    edges: [number, number, number, string][];
  } = null;

  const cameraBounds = $derived([
    cameraPosition[0] - width / cameraPosition[2] / 2,
    cameraPosition[0] + width / cameraPosition[2] / 2,
    cameraPosition[1] - height / cameraPosition[2] / 2,
    cameraPosition[1] + height / cameraPosition[2] / 2,
  ]);
  function setCameraTransform(
    x = cameraPosition[0],
    y = cameraPosition[1],
    z = cameraPosition[2],
  ) {
    if (camera) {
      camera.position.x = x;
      camera.position.z = y;
      camera.zoom = z;
    }
    cameraPosition = [x, y, z];
    localStorage.setItem("cameraPosition", JSON.stringify(cameraPosition));
  }

  function updateNodePosition(node: Node) {
    if (node?.tmp?.ref && node?.tmp?.mesh) {
      if (node.tmp["x"] !== undefined && node.tmp["y"] !== undefined) {
        node.tmp.ref.style.setProperty("--nx", `${node.tmp.x * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.tmp.y * 10}px`);
        node.tmp.mesh.position.x = node.tmp.x + 10;
        node.tmp.mesh.position.z = node.tmp.y + getNodeHeight(node.type) / 2;
        if (
          node.tmp.x === node.position[0] &&
          node.tmp.y === node.position[1]
        ) {
          delete node.tmp.x;
          delete node.tmp.y;
        }
        graph.edges = [...graph.edges];
      } else {
        node.tmp.ref.style.setProperty("--nx", `${node.position[0] * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.position[1] * 10}px`);
        node.tmp.mesh.position.x = node.position[0] + 10;
        node.tmp.mesh.position.z =
          node.position[1] + getNodeHeight(node.type) / 2;
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
    const height =
      5 +
      10 *
        Object.keys(node.inputs).filter(
          (p) =>
            p !== "seed" &&
            node?.inputs &&
            !("setting" in node?.inputs?.[p]) &&
            node.inputs[p].hidden !== true,
        ).length;
    nodeHeightCache[nodeTypeId] = height;
    return height;
  }
  setContext("getNodeHeight", getNodeHeight);

  setContext("isNodeInView", (node: Node) => {
    const height = getNodeHeight(node.type);
    const width = 20;
    return (
      node.position[0] > cameraBounds[0] - width &&
      node.position[0] < cameraBounds[1] &&
      node.position[1] > cameraBounds[2] - height &&
      node.position[1] < cameraBounds[3]
    );
  });

  function getNodeIdFromEvent(event: MouseEvent) {
    let clickedNodeId = -1;

    let mx = event.clientX - rect.x;
    let my = event.clientY - rect.y;

    if (event.button === 0) {
      // check if the clicked element is a node
      if (event.target instanceof HTMLElement) {
        const nodeElement = event.target.closest(".node");
        const nodeId = nodeElement?.getAttribute?.("data-node-id");
        if (nodeId) {
          clickedNodeId = parseInt(nodeId, 10);
        }
      }

      // if we do not have an active node,
      // we are going to check if we clicked on a node by coordinates
      if (clickedNodeId === -1) {
        const [downX, downY] = projectScreenToWorld(mx, my);
        for (const node of graph.nodes.values()) {
          const x = node.position[0];
          const y = node.position[1];
          const height = getNodeHeight(node.type);
          if (downX > x && downX < x + 20 && downY > y && downY < y + height) {
            clickedNodeId = node.id;
            break;
          }
        }
      }
    }
    return clickedNodeId;
  }

  setContext("setDownSocket", (socket: Socket) => {
    graphState.activeSocket = socket;

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
    graphState.activeSocket = {
      node,
      index,
      position,
    };

    graphState.possibleSockets = graph
      .getPossibleSockets(graphState.activeSocket)
      .map(([node, index]) => {
        return {
          node,
          index,
          position: getSocketPosition(node, index),
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
    node: Node,
    index: string | number,
  ): [number, number] {
    if (typeof index === "number") {
      return [
        (node?.tmp?.x ?? node.position[0]) + 20,
        (node?.tmp?.y ?? node.position[1]) + 2.5 + 10 * index,
      ];
    } else {
      const _index = Object.keys(node.tmp?.type?.inputs || {}).indexOf(index);
      return [
        node?.tmp?.x ?? node.position[0],
        (node?.tmp?.y ?? node.position[1]) + 10 + 10 * _index,
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
    let mx = event.clientX - rect.x;
    let my = event.clientY - rect.y;

    mousePosition = projectScreenToWorld(mx, my);
    hoveredNodeId = getNodeIdFromEvent(event);

    if (!mouseDown) return;

    // we are creating a new edge here
    if (graphState.activeSocket || graphState.possibleSockets?.length) {
      let smallestDist = 1000;
      let _socket;
      for (const socket of graphState.possibleSockets) {
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
        graphState.hoveredSocket = _socket;
      } else {
        graphState.hoveredSocket = null;
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
      for (const node of graph.nodes.values()) {
        if (!node?.tmp) continue;
        const x = node.position[0];
        const y = node.position[1];
        const height = getNodeHeight(node.type);
        if (x > x1 - 20 && x < x2 && y > y1 - height && y < y2) {
          graphState.selectedNodes?.add(node.id);
        } else {
          graphState.selectedNodes?.delete(node.id);
        }
      }
      return;
    }

    // here we are handling dragging of nodes
    if (graphState.activeNodeId !== -1 && mouseDownId !== -1) {
      const node = graph.getNode(graphState.activeNodeId);
      if (!node || event.buttons !== 1) return;

      node.tmp = node.tmp || {};

      const oldX = node.tmp.downX || 0;
      const oldY = node.tmp.downY || 0;

      let newX = oldX + (mx - mouseDown[0]) / cameraPosition[2];
      let newY = oldY + (my - mouseDown[1]) / cameraPosition[2];

      if (event.ctrlKey) {
        const snapLevel = getSnapLevel();
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
          updateNodePosition(n);
        }
      }

      node.tmp.x = newX;
      node.tmp.y = newY;

      updateNodePosition(node);

      return;
    }

    // here we are handling panning of camera
    isPanning = true;
    let newX = cameraDown[0] - (mx - mouseDown[0]) / cameraPosition[2];
    let newY = cameraDown[1] - (my - mouseDown[1]) / cameraPosition[2];

    setCameraTransform(newX, newY, cameraPosition[2]);
  }

  const zoomSpeed = 2;
  function handleMouseScroll(event: WheelEvent) {
    const bodyIsFocused =
      document.activeElement === document.body ||
      document.activeElement === wrapper ||
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

    if (event.target instanceof HTMLElement) {
      if (
        event.target.nodeName !== "CANVAS" &&
        !event.target.classList.contains("node") &&
        !event.target.classList.contains("content")
      ) {
        return;
      }
    }

    let mx = event.clientX - rect.x;
    let my = event.clientY - rect.y;

    mouseDown = [mx, my];
    cameraDown[0] = cameraPosition[0];
    cameraDown[1] = cameraPosition[1];

    const clickedNodeId = getNodeIdFromEvent(event);
    mouseDownId = clickedNodeId;

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
      boxSelection = true;
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
  }

  function copyNodes() {
    if (graphState.activeNodeId === -1 && !graphState.selectedNodes?.size)
      return;
    let _nodes = [
      graphState.activeNodeId,
      ...(graphState.selectedNodes?.values() || []),
    ]
      .map((id) => graph.getNode(id))
      .filter(Boolean) as Node[];

    const _edges = graph.getEdgesBetweenNodes(_nodes);

    _nodes = _nodes.map((_node) => {
      const node = globalThis.structuredClone({
        ..._node,
        tmp: {
          downX: mousePosition[0] - _node.position[0],
          downY: mousePosition[1] - _node.position[1],
        },
      });
      return node;
    });

    clipboard = {
      nodes: _nodes,
      edges: _edges,
    };
  }

  function pasteNodes() {
    if (!clipboard) return;

    const _nodes = clipboard.nodes
      .map((node) => {
        node.tmp = node.tmp || {};
        node.position[0] = mousePosition[0] - (node?.tmp?.downX || 0);
        node.position[1] = mousePosition[1] - (node?.tmp?.downY || 0);
        return node;
      })
      .filter(Boolean) as Node[];

    const newNodes = graph.createGraph(_nodes, clipboard.edges);
    graphState.selectedNodes.clear();
    for (const node of newNodes) {
      graphState.selectedNodes.add(node.id);
    }
  }

  const isBodyFocused = () => document?.activeElement?.nodeName !== "INPUT";

  keymap.addShortcut({
    key: "l",
    description: "Select linked nodes",
    callback: () => {
      const activeNode = graph.getNode(graphState.activeNodeId);
      if (activeNode) {
        const nodes = graph.getLinkedNodes(activeNode);
        graphState.selectedNodes.clear();
        for (const node of nodes) {
          graphState.selectedNodes.add(node.id);
        }
      }
    },
  });

  keymap.addShortcut({
    key: "?",
    description: "Toggle Help",
    callback: () => {
      // TODO: fix this
      // showHelp = !showHelp;
    },
  });

  keymap.addShortcut({
    key: "c",
    ctrl: true,
    description: "Copy active nodes",
    callback: copyNodes,
  });

  keymap.addShortcut({
    key: "v",
    ctrl: true,
    description: "Paste nodes",
    callback: pasteNodes,
  });

  keymap.addShortcut({
    key: "Escape",
    description: "Deselect nodes",
    callback: () => {
      graphState.activeNodeId = -1;
      graphState.clearSelection();
      (document.activeElement as HTMLElement)?.blur();
    },
  });

  keymap.addShortcut({
    key: "A",
    shift: true,
    description: "Add new Node",
    callback: () => {
      addMenuPosition = [mousePosition[0], mousePosition[1]];
    },
  });

  keymap.addShortcut({
    key: ".",
    description: "Center camera",
    callback: () => {
      if (!isBodyFocused()) return;

      const average = [0, 0];
      for (const node of graph.nodes.values()) {
        average[0] += node.position[0];
        average[1] += node.position[1];
      }
      average[0] = average[0] ? average[0] / graph.nodes.size : 0;
      average[1] = average[1] ? average[1] / graph.nodes.size : 0;

      const camX = cameraPosition[0];
      const camY = cameraPosition[1];
      const camZ = cameraPosition[2];

      const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      animate(500, (a: number) => {
        setCameraTransform(
          lerp(camX, average[0], ease(a)),
          lerp(camY, average[1], ease(a)),
          lerp(camZ, 2, ease(a)),
        );
        if (mouseDown) return false;
      });
    },
  });

  keymap.addShortcut({
    key: "a",
    ctrl: true,
    preventDefault: true,
    description: "Select all nodes",
    callback: () => {
      if (!isBodyFocused()) return;
      for (const node of graph.nodes.keys()) {
        graphState.selectedNodes.add(node);
      }
    },
  });

  keymap.addShortcut({
    key: "z",
    ctrl: true,
    description: "Undo",
    callback: () => {
      if (!isBodyFocused()) return;
      graph.undo();
      for (const node of graph.nodes.values()) {
        updateNodePosition(node);
      }
    },
  });

  keymap.addShortcut({
    key: "y",
    ctrl: true,
    description: "Redo",
    callback: () => {
      graph.redo();
      for (const node of graph.nodes.values()) {
        updateNodePosition(node);
      }
    },
  });

  keymap.addShortcut({
    key: "s",
    ctrl: true,
    description: "Save",
    preventDefault: true,
    callback: () => {
      const state = graph.serialize();
      const blob = new Blob([JSON.stringify(state)], {
        type: "application/json;charset=utf-8",
      });
      FileSaver.saveAs(blob, "nodarium-graph.json");
    },
  });

  keymap.addShortcut({
    key: ["Delete", "Backspace", "x"],
    description: "Delete selected nodes",
    callback: (event) => {
      if (!isBodyFocused()) return;
      graph.startUndoGroup();
      if (graphState.activeNodeId !== -1) {
        const node = graph.getNode(graphState.activeNodeId);
        if (node) {
          graph.removeNode(node, { restoreEdges: event.ctrlKey });
          graphState.activeNodeId = -1;
        }
      }
      if (graphState.selectedNodes) {
        for (const nodeId of graphState.selectedNodes) {
          const node = graph.getNode(nodeId);
          if (node) {
            graph.removeNode(node, { restoreEdges: event.ctrlKey });
          }
        }
        graphState.clearSelection();
      }
      graph.saveUndoGroup();
    },
  });

  function handleMouseUp(event: MouseEvent) {
    isPanning = false;
    if (!mouseDown) return;

    const activeNode = graph.getNode(graphState.activeNodeId);

    const clickedNodeId = getNodeIdFromEvent(event);

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
        const snapLevel = getSnapLevel();
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
            updateNodePosition(node);
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
    }

    // check if camera moved
    if (
      clickedNodeId === -1 &&
      !boxSelection &&
      cameraDown[0] === cameraPosition[0] &&
      cameraDown[1] === cameraPosition[1] &&
      isBodyFocused()
    ) {
      graphState.activeNodeId = -1;
      graphState.clearSelection();
    }

    mouseDown = null;
    boxSelection = false;
    graphState.activeSocket = null;
    graphState.possibleSockets = [];
    graphState.hoveredSocket = null;
    addMenuPosition = null;
  }

  let isPanning = $state(false);
  let isDragging = $state(false);
  let hoveredNodeId = $state(-1);

  function handleMouseLeave() {
    isDragging = false;
    isPanning = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    if (!event.dataTransfer) return;
    const nodeId = event.dataTransfer.getData("data/node-id") as NodeType;
    let mx = event.clientX - rect.x;
    let my = event.clientY - rect.y;

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

      const pos = projectScreenToWorld(mx, my);
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
              position: projectScreenToWorld(mx, my),
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
        setCameraTransform(cPosition[0], cPosition[1], cPosition[2]);
      }
    }
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
  onwheel={handleMouseScroll}
  bind:this={wrapper}
  class="graph-wrapper"
  class:is-panning={isPanning}
  class:is-hovering={hoveredNodeId !== -1}
  aria-label="Graph"
  role="button"
  tabindex="0"
  bind:clientWidth={width}
  bind:clientHeight={height}
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
    <Camera bind:camera position={cameraPosition} />

    {#if showGrid !== false}
      <Background {cameraPosition} {maxZoom} {minZoom} {width} {height} />
    {/if}

    {#if boxSelection && mouseDown}
      <BoxSelection
        {cameraPosition}
        p1={{
          x: cameraPosition[0] + (mouseDown[0] - width / 2) / cameraPosition[2],
          y:
            cameraPosition[1] + (mouseDown[1] - height / 2) / cameraPosition[2],
        }}
        p2={{ x: mousePosition[0], y: mousePosition[1] }}
      />
    {/if}

    {#if graph.status === "idle"}
      {#if addMenuPosition}
        <AddMenu bind:position={addMenuPosition} {graph} />
      {/if}

      {#if graphState.activeSocket}
        <FloatingEdge
          z={cameraPosition[2]}
          from={{
            x: graphState.activeSocket.position[0],
            y: graphState.activeSocket.position[1],
          }}
          to={{ x: mousePosition[0], y: mousePosition[1] }}
        />
      {/if}

      <GraphView nodes={graph.nodes} edges={graph.edges} {cameraPosition} />
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
