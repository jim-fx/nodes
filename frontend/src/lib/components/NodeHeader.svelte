<script lang="ts">
  import { createNodePath } from "$lib/helpers";
  import type { Node, Socket } from "$lib/types";
  import { getContext } from "svelte";

  export let node: Node;

  const setDownSocket = getContext<(socket: Socket) => void>("setDownSocket");

  function handleMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    setDownSocket({
      node,
      index: 0,
      position: [node.position.x + 5, node.position.y + 0.625],
    });
  }

  const cornerTop = 10;
  const rightBump = !!node?.tmp?.type?.outputs?.length;
  const aspectRatio = 0.25;

  const path = createNodePath({
    depth: 4.5,
    height: 24,
    y: 50,
    cornerTop,
    rightBump,
    aspectRatio,
  });
  const pathDisabled = createNodePath({
    depth: 0,
    height: 15,
    y: 50,
    cornerTop,
    rightBump,
    aspectRatio,
  });
  const pathHover = createNodePath({
    depth: 6,
    height: 30,
    y: 50,
    cornerTop,
    rightBump,
    aspectRatio,
  });
</script>

<div class="wrapper" data-node-id={node.id}>
  <div class="content">
    {node.type} / {node.id}
  </div>
  <div
    class="click-target"
    role="button"
    tabindex="0"
    on:mousedown={handleMouseDown}
    style={`background: var(--node-hovered-out-${node.tmp?.type?.outputs?.[0]}`}
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    preserveAspectRatio="none"
    style={`
      --path: path("${path}");
      --hover-path: path("${pathHover}");
    `}
  >
    <path
      vector-effect="non-scaling-stroke"
      fill="none"
      stroke="white"
      stroke-width="0.1"
    ></path>
  </svg>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    height: 12.5px;
  }

  .click-target {
    position: absolute;
    right: -2.5px;
    top: 3.8px;
    height: 5px;
    width: 5px;
    z-index: 100;
    border-radius: 50%;
    opacity: 0.1;
  }

  .click-target:hover + svg path {
    d: var(--hover-path);
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  svg path {
    stroke-width: 0.2px;
    transition: 0.2s;
    fill: #131313;
    stroke: var(--stroke);
    stroke-width: var(--stroke-width);
    d: var(--path);
  }

  .content {
    font-size: 0.5em;
    display: flex;
    align-items: center;
    padding-left: 5px;
    height: 100%;
  }

  svg:hover path {
    d: var(--hover-path) !important;
  }
</style>
