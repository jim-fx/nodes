<script lang="ts">
  import {
    animate,
    lerp,
    snapToGrid as snapPointToGrid,
  } from "../helpers/index.js";
  import { Canvas } from "@threlte/core";
  import type { OrthographicCamera } from "three";
  import Background from "../background/Background.svelte";
  import type { GraphManager } from "../graph-manager.js";
  import { getContext, onMount, setContext } from "svelte";
  import Camera from "../Camera.svelte";
  import GraphView from "./GraphView.svelte";
  import type { Node, NodeId, Node as NodeType, Socket } from "@nodes/types";
  import { GraphSchema, NodeDefinitionSchema } from "@nodes/types";
  import FloatingEdge from "../edges/FloatingEdge.svelte";
  import {
    activeNodeId,
    activeSocket,
    hoveredSocket,
    possibleSockets,
    possibleSocketIds,
    selectedNodes,
  } from "./stores.js";
  import { createKeyMap } from "../../helpers/createKeyMap";
  import BoxSelection from "../BoxSelection.svelte";
  import AddMenu from "../AddMenu.svelte";
  import { createWasmWrapper } from "@nodes/utils";

  import HelpView from "../HelpView.svelte";
  import FileSaver from "file-saver";

  export let manager: GraphManager;

  export let snapToGrid = true;
  export let showGrid = true;
  export let showHelp = false;

  let keymap =
    getContext<ReturnType<typeof createKeyMap>>("keymap") || createKeyMap([]);

  setContext("graphManager", manager);
  const status = manager.status;
  const nodes = manager.nodes;
  const edges = manager.edges;

  let wrapper: HTMLDivElement;
  let rect: DOMRect;
  $: rect =
    wrapper && width
      ? wrapper.getBoundingClientRect()
      : ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

  let camera: OrthographicCamera;
  const minZoom = 1;
  const maxZoom = 40;
  let mousePosition = [0, 0];
  let mouseDown: null | [number, number] = null;
  let mouseDownId = -1;
  let boxSelection = false;
  const cameraDown = [0, 0];
  let cameraPosition: [number, number, number] = [0, 0, 4];
  let addMenuPosition: [number, number] | null = null;
  let clipboard: null | {
    nodes: Node[];
    edges: [number, number, number, string][];
  } = null;

  let width = rect?.width ?? 100;
  let height = rect?.height ?? 100;

  let cameraBounds = [-1000, 1000, -1000, 1000];
  $: cameraBounds = [
    cameraPosition[0] - width / cameraPosition[2] / 2,
    cameraPosition[0] + width / cameraPosition[2] / 2,
    cameraPosition[1] - height / cameraPosition[2] / 2,
    cameraPosition[1] + height / cameraPosition[2] / 2,
  ];
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

  function updateNodePosition(node: NodeType) {
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
    const node = manager.getNodeType(nodeTypeId);
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

  setContext("isNodeInView", (node: NodeType) => {
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
        for (const node of $nodes.values()) {
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
    $activeSocket = socket;

    let { node, index, position } = socket;

    // remove existing edge
    if (typeof index === "string") {
      const edges = manager.getEdgesToNode(node);
      for (const edge of edges) {
        if (edge[3] === index) {
          node = edge[0];
          index = edge[1];
          position = getSocketPosition(node, index);
          manager.removeEdge(edge);
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

    $possibleSockets = manager
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

    if (!mouseDown) return;

    // we are creating a new edge here
    if ($activeSocket || $possibleSockets?.length) {
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
        const x = node.position[0];
        const y = node.position[1];
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
    if ($activeNodeId !== -1 && mouseDownId !== -1) {
      const node = manager.getNode($activeNodeId);
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

      if ($selectedNodes?.size) {
        for (const nodeId of $selectedNodes) {
          const n = manager.getNode(nodeId);
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
      if ($activeNodeId === -1) {
        $activeNodeId = clickedNodeId;
        // if the selected node is the same as the clicked node
      } else if ($activeNodeId === clickedNodeId) {
        //$activeNodeId = -1;
        // if the clicked node is different from the selected node and secondary
      } else if (event.ctrlKey) {
        $selectedNodes = $selectedNodes || new Set();
        $selectedNodes.add($activeNodeId);
        $selectedNodes.delete(clickedNodeId);
        $activeNodeId = clickedNodeId;
        // select the node
      } else if (event.shiftKey) {
        const activeNode = manager.getNode($activeNodeId);
        const newNode = manager.getNode(clickedNodeId);
        if (activeNode && newNode) {
          const edge = manager.getNodesBetween(activeNode, newNode);
          if (edge) {
            const selected = new Set(edge.map((n) => n.id));
            selected.add(clickedNodeId);
            $selectedNodes = selected;
          }
        }
      } else if (!$selectedNodes?.has(clickedNodeId)) {
        $activeNodeId = clickedNodeId;
        $selectedNodes?.clear();
        $selectedNodes = $selectedNodes;
      }
    } else if (event.ctrlKey) {
      boxSelection = true;
    }
    const node = manager.getNode($activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position[0];
    node.tmp.downY = node.position[1];
    if ($selectedNodes) {
      for (const nodeId of $selectedNodes) {
        const n = manager.getNode(nodeId);
        if (!n) continue;
        n.tmp = n.tmp || {};
        n.tmp.downX = n.position[0];
        n.tmp.downY = n.position[1];
      }
    }
  }

  function copyNodes() {
    if ($activeNodeId === -1 && !$selectedNodes?.size) return;
    let _nodes = [$activeNodeId, ...($selectedNodes?.values() || [])]
      .map((id) => manager.getNode(id))
      .filter(Boolean) as Node[];

    const _edges = manager.getEdgesBetweenNodes(_nodes);

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

    const newNodes = manager.createGraph(_nodes, clipboard.edges);
    $selectedNodes = new Set(newNodes.map((n) => n.id));
  }

  const isBodyFocused = () => document?.activeElement?.nodeName !== "INPUT";

  keymap.addShortcut({
    key: "l",
    description: "Select linked nodes",
    callback: () => {
      const activeNode = manager.getNode($activeNodeId);
      if (activeNode) {
        const nodes = manager.getLinkedNodes(activeNode);
        $selectedNodes = new Set(nodes.map((n) => n.id));
      }
      console.log(activeNode);
    },
  });

  keymap.addShortcut({
    key: "?",
    description: "Toggle Help",
    callback: () => {
      showHelp = !showHelp;
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
      $activeNodeId = -1;
      $selectedNodes?.clear();
      $selectedNodes = $selectedNodes;
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
      for (const node of $nodes.values()) {
        average[0] += node.position[0];
        average[1] += node.position[1];
      }
      average[0] = average[0] ? average[0] / $nodes.size : 0;
      average[1] = average[1] ? average[1] / $nodes.size : 0;

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
      $selectedNodes = new Set($nodes.keys());
    },
  });

  keymap.addShortcut({
    key: "z",
    ctrl: true,
    description: "Undo",
    callback: () => {
      if (!isBodyFocused()) return;
      manager.undo();
      for (const node of $nodes.values()) {
        updateNodePosition(node);
      }
    },
  });

  keymap.addShortcut({
    key: "y",
    ctrl: true,
    description: "Redo",
    callback: () => {
      manager.redo();
      for (const node of $nodes.values()) {
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
      const state = manager.serialize();
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
      manager.startUndoGroup();
      if ($activeNodeId !== -1) {
        const node = manager.getNode($activeNodeId);
        if (node) {
          manager.removeNode(node, { restoreEdges: event.ctrlKey });
          $activeNodeId = -1;
        }
      }
      if ($selectedNodes) {
        for (const nodeId of $selectedNodes) {
          const node = manager.getNode(nodeId);
          if (node) {
            manager.removeNode(node, { restoreEdges: event.ctrlKey });
          }
        }
        $selectedNodes.clear();
        $selectedNodes = $selectedNodes;
      }
      manager.saveUndoGroup();
    },
  });

  function handleMouseUp(event: MouseEvent) {
    if (!mouseDown) return;

    const activeNode = manager.getNode($activeNodeId);

    const clickedNodeId = getNodeIdFromEvent(event);

    if (clickedNodeId !== -1) {
      if (activeNode) {
        if (!activeNode?.tmp?.isMoving && !event.ctrlKey && !event.shiftKey) {
          $selectedNodes?.clear();
          $selectedNodes = $selectedNodes;
          $activeNodeId = clickedNodeId;
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
        ...[...($selectedNodes?.values() || [])].map((id) =>
          manager.getNode(id),
        ),
      ] as NodeType[];

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

        $edges = $edges;
      });
      manager.save();
    } else if ($hoveredSocket && $activeSocket) {
      if (
        typeof $hoveredSocket.index === "number" &&
        typeof $activeSocket.index === "string"
      ) {
        manager.createEdge(
          $hoveredSocket.node,
          $hoveredSocket.index || 0,
          $activeSocket.node,
          $activeSocket.index,
        );
      } else if (
        typeof $activeSocket.index == "number" &&
        typeof $hoveredSocket.index === "string"
      ) {
        manager.createEdge(
          $activeSocket.node,
          $activeSocket.index || 0,
          $hoveredSocket.node,
          $hoveredSocket.index,
        );
      }
      manager.save();
    }

    // check if camera moved
    if (
      clickedNodeId === -1 &&
      !boxSelection &&
      cameraDown[0] === cameraPosition[0] &&
      cameraDown[1] === cameraPosition[1] &&
      isBodyFocused()
    ) {
      $activeNodeId = -1;
      $selectedNodes?.clear();
      $selectedNodes = $selectedNodes;
    }

    mouseDown = null;
    boxSelection = false;
    $activeSocket = null;
    $possibleSockets = [];
    $possibleSocketIds = null;
    $hoveredSocket = null;
    addMenuPosition = null;
  }

  let isDragging = false;

  function handleMouseLeave() {
    isDragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    if (!event.dataTransfer) return;
    const nodeId = event.dataTransfer.getData("data/node-id") as NodeId;

    if (nodeId) {
      let mx = event.clientX - rect.x;
      let my = event.clientY - rect.y;

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
      manager.registry.load([nodeId]).then(() => {
        manager.createNode({
          type: nodeId,
          props,
          position: pos,
        });
      });
    } else if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];

      if (file.type === "application/wasm") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as Buffer;
          if (buffer) {
            const wrapper = createWasmWrapper(buffer);
            const definition = wrapper.get_definition();
            const res = NodeDefinitionSchema.parse(definition);
            console.log(res);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as Buffer;
          if (buffer) {
            const state = GraphSchema.parse(JSON.parse(buffer.toString()));
            manager.load(state);
          }
        };
        reader.readAsText(file);
      }
    }
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handlerDragOver(e: DragEvent) {
    isDragging = true;
    e.preventDefault();
  }

  function handleDragEnd(e: DragEvent) {
    isDragging = false;
    e.preventDefault();
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

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
  on:wheel={handleMouseScroll}
  bind:this={wrapper}
  class="graph-wrapper"
  aria-label="Graph"
  role="button"
  tabindex="0"
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:dragenter={handleDragEnter}
  on:dragover={handlerDragOver}
  on:dragexit={handleDragEnd}
  on:drop={handleDrop}
  on:mouseleave={handleMouseLeave}
  on:keydown={keymap.handleKeyboardEvent}
  on:mousedown={handleMouseDown}
>
  <input
    type="file"
    accept="application/wasm,application/json"
    id="drop-zone"
    disabled={!isDragging}
    on:dragend={handleDragEnd}
    on:dragleave={handleDragEnd}
  />
  <label for="drop-zone"></label>

  {#if showHelp}
    <HelpView registry={manager.registry} />
  {/if}
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

    {#if $status === "idle"}
      {#if addMenuPosition}
        <AddMenu bind:position={addMenuPosition} graph={manager} />
      {/if}

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
  </Canvas>
</div>

<style>
  .graph-wrapper {
    position: relative;
    transition: opacity 0.3s ease;
    height: 100%;
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
