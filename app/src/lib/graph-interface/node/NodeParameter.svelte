<script lang="ts">
  import type {
    NodeInput as NodeInputType,
    Socket,
    Node as NodeType,
  } from "@nodes/types";
  import { getContext } from "svelte";
  import { createNodePath } from "../helpers/index.js";
  import { possibleSocketIds } from "../graph/stores.js";
  import { getGraphManager } from "../graph/context.js";
  import NodeInput from "./NodeInput.svelte";

  export let node: NodeType;
  export let input: NodeInputType;
  export let id: string;
  export let isLast = false;

  const inputType = node?.tmp?.type?.inputs?.[id]!;

  const socketId = `${node.id}-${id}`;

  const graph = getGraphManager();
  const graphId = graph.id;
  const inputSockets = graph.inputSockets;

  const elementId = `input-${Math.random().toString(36).substring(7)}`;

  const setDownSocket = getContext<(socket: Socket) => void>("setDownSocket");
  const getSocketPosition =
    getContext<(node: NodeType, index: string) => [number, number]>(
      "getSocketPosition",
    );

  function handleMouseDown(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    setDownSocket({
      node,
      index: id,
      position: getSocketPosition(node, id),
    });
  }

  const leftBump = node.tmp?.type?.inputs?.[id].internal !== true;
  const cornerBottom = isLast ? 5 : 0;
  const aspectRatio = 0.5;

  const path = createNodePath({
    depth: 4,
    height: 12,
    y: 51,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
  const pathDisabled = createNodePath({
    depth: 0,
    height: 15,
    y: 50,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
  const pathHover = createNodePath({
    depth: 6,
    height: 18,
    y: 50.5,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
</script>

<div
  class="wrapper"
  class:disabled={$possibleSocketIds && !$possibleSocketIds.has(socketId)}
>
  {#key id && graphId}
    <div class="content" class:disabled={$inputSockets.has(socketId)}>
      {#if inputType.label !== false}
        <label for={elementId}>{input.label || id}</label>
      {/if}
      {#if inputType.external !== true}
        <NodeInput {elementId} {node} {input} {id} />
      {/if}
    </div>

    {#if node?.tmp?.type?.inputs?.[id]?.internal !== true}
      <div
        class="large target"
        on:mousedown={handleMouseDown}
        role="button"
        tabindex="0"
      />
      <div
        class="small target"
        on:mousedown={handleMouseDown}
        role="button"
        tabindex="0"
      />
    {/if}
  {/key}

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    preserveAspectRatio="none"
    style={`
      --path: path("${path}");
      --hover-path: path("${pathHover}");
      --hover-path-disabled: path("${pathDisabled}");
    `}
  >
    <path vector-effect="non-scaling-stroke"></path>
  </svg>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    height: 100px;
    transform: translateY(-0.5px);
  }

  .target {
    position: absolute;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    /* background: red; */
    /* opacity: 0.1; */
  }

  .small.target {
    width: 30px;
    height: 30px;
  }

  .large.target {
    width: 60px;
    height: 60px;
    cursor: unset;
    pointer-events: none;
  }

  :global(.hovering-sockets) .large.target {
    pointer-events: all;
  }

  .content {
    position: relative;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-around;
    box-sizing: border-box;
  }

  svg {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: visible;
    top: 0;
    left: 0;
    z-index: -1;
  }

  svg path {
    transition:
      d 0.3s ease,
      fill 0.3s ease;
    fill: var(--background-color);
    stroke: var(--stroke);
    stroke-width: var(--stroke-width);
    d: var(--path);
  }

  :global(.hovering-sockets) .large:hover ~ svg path {
    d: var(--hover-path);
  }

  .content.disabled {
    opacity: 0.2;
    pointer-events: none;
  }

  .disabled svg path {
    d: var(--hover-path-disabled) !important;
  }
</style>
