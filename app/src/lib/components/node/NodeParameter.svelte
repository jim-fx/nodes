<script lang="ts">
  import type { NodeInput as NodeInputType, Socket, Node } from "@nodes/types";
  import { getContext } from "svelte";
  import { createNodePath } from "$lib/helpers";
  import { possibleSocketIds } from "../graph/stores";
  import { getGraphManager } from "../graph/context";
  import NodeInput from "./NodeInput.svelte";
  import Node from "./Node.svelte";

  export let node: Node;
  export let input: NodeInputType;
  export let id: string;
  export let isLast = false;

  const socketId = `${node.id}-${id}`;

  const graph = getGraphManager();
  const graphId = graph.id;
  const inputSockets = graph.inputSockets;

  const setDownSocket = getContext<(socket: Socket) => void>("setDownSocket");
  const getSocketPosition =
    getContext<(node: Node, index: string) => [number, number]>(
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
    {#if node?.tmp?.type?.inputs?.[id]?.external !== true}
      <div class="content" class:disabled={$inputSockets.has(socketId)}>
        <NodeInput {node} {input} {id} label={input.title} />
      </div>
    {/if}

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

  :global(.zoom-small) .content {
    display: none;
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
    /* fill: #131313; */
  }

  :global(.hovering-sockets) .small:hover ~ svg path {
    /* fill: #161616; */
  }

  .content.disabled {
    opacity: 0.2;
    pointer-events: none;
  }

  .disabled svg path {
    d: var(--hover-path-disabled) !important;
    /* fill: #060606 !important; */
  }
</style>
