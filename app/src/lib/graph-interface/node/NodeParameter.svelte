<script lang="ts">
  import type {
    NodeInput as NodeInputType,
    Socket,
    Node as NodeType,
  } from "@nodes/types";
  import { getContext } from "svelte";
  import { createNodePath } from "../helpers/index.js";
  import { getGraphManager } from "../graph/context.js";
  import NodeInput from "./NodeInput.svelte";
  import { getGraphState } from "../graph/state.svelte.js";

  type Props = {
    node: NodeType;
    input: NodeInputType;
    id: string;
    isLast?: boolean;
  };

  const { node = $bindable(), input, id, isLast }: Props = $props();

  const inputType = node?.tmp?.type?.inputs?.[id]!;

  const socketId = `${node.id}-${id}`;

  const graph = getGraphManager();
  const graphState = getGraphState();
  const graphId = graph?.id;
  const inputSockets = graph?.inputSockets;

  const elementId = `input-${Math.random().toString(36).substring(7)}`;

  const setDownSocket = getContext<(socket: Socket) => void>("setDownSocket");
  const getSocketPosition =
    getContext<(node: NodeType, index: string) => [number, number]>(
      "getSocketPosition",
    );

  function handleMouseDown(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    setDownSocket?.({
      node,
      index: id,
      position: getSocketPosition?.(node, id),
    });
  }

  const leftBump = node.tmp?.type?.inputs?.[id].internal !== true;
  const cornerBottom = isLast ? 5 : 0;
  const aspectRatio = 0.5;

  const path = createNodePath({
    depth: 7,
    height: 20,
    y: 50.5,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
  const pathDisabled = createNodePath({
    depth: 6,
    height: 18,
    y: 50.5,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
  const pathHover = createNodePath({
    depth: 8,
    height: 25,
    y: 50.5,
    cornerBottom,
    leftBump,
    aspectRatio,
  });
</script>

<div
  class="wrapper"
  data-node-type={node.type}
  data-node-input={id}
  class:disabled={!graphState?.possibleSocketIds.has(socketId)}
>
  {#key id && graphId}
    <div class="content" class:disabled={$inputSockets?.has(socketId)}>
      {#if inputType.label !== ""}
        <label for={elementId}>{input.label || id}</label>
      {/if}
      {#if inputType.external !== true}
        <NodeInput {elementId} {node} {input} {id} />
      {/if}
    </div>

    {#if node?.tmp?.type?.inputs?.[id]?.internal !== true}
      <div
        data-node-socket
        class="large target"
        onmousedown={handleMouseDown}
        role="button"
        tabindex="0"
      ></div>
      <div
        data-node-socket
        class="small target"
        onmousedown={handleMouseDown}
        role="button"
        tabindex="0"
      ></div>
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
    width: calc(100% - 2px);
    height: 100%;
    overflow: visible;
    top: 0;
    left: 1px;
    z-index: -1;
  }

  svg path {
    transition:
      d 0.3s ease,
      fill 0.3s ease;
    fill: var(--layer-1);
    stroke: var(--stroke);
    stroke-width: var(--stroke-width);
    d: var(--path);
  }

  :global {
    .hovering-sockets .large:hover ~ svg path {
      d: var(--hover-path);
    }
  }

  .content.disabled {
    opacity: 0.2;
  }
  .content.disabled > * {
    pointer-events: none;
  }

  .disabled svg path {
    d: var(--hover-path-disabled) !important;
  }
</style>
