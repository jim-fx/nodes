<script lang="ts">
  import { getGraphState } from "../graph/state.svelte.js";
  import { createNodePath } from "../helpers/index.js";
  import type { Node } from "@nodarium/types";

  const graphState = getGraphState();

  const { node }: { node: Node } = $props();

  function handleMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    graphState.setDownSocket?.({
      node,
      index: 0,
      position: graphState.getSocketPosition?.(node, 0),
    });
  }

  const cornerTop = 10;
  const rightBump = !!node?.tmp?.type?.outputs?.length;
  const aspectRatio = 0.25;

  const path = createNodePath({
    depth: 5.5,
    height: 34,
    y: 49,
    cornerTop,
    rightBump,
    aspectRatio,
  });
  // const pathDisabled = createNodePath({
  //   depth: 0,
  //   height: 15,
  //   y: 50,
  //   cornerTop,
  //   rightBump,
  //   aspectRatio,
  // });
  const pathHover = createNodePath({
    depth: 8.5,
    height: 50,
    y: 49,
    cornerTop,
    rightBump,
    aspectRatio,
  });
</script>

<div class="wrapper" data-node-id={node.id} data-node-type={node.type}>
  <div class="content">
    {node.type.split("/").pop()}
  </div>
  <div
    class="click-target"
    role="button"
    tabindex="0"
    onmousedown={handleMouseDown}
  ></div>
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
    <path vector-effect="non-scaling-stroke" stroke="white" stroke-width="0.1"
    ></path>
  </svg>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    height: 50px;
  }

  .click-target {
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateX(50%) translateY(-50%);
    height: 30px;
    width: 30px;
    z-index: 100;
    border-radius: 50%;
    /* background: red; */
    /* opacity: 0.2; */
  }

  .click-target:hover + svg path {
    d: var(--hover-path);
  }

  svg {
    position: absolute;
    top: 1px;
    left: 1px;
    z-index: -1;
    box-sizing: border-box;
    width: calc(100% - 2px);
    height: calc(100% - 1px);
    overflow: visible;
  }

  svg path {
    stroke-width: 0.2px;
    transition:
      d 0.3s ease,
      fill 0.3s ease;
    fill: var(--layer-2);
    stroke: var(--stroke);
    stroke-width: var(--stroke-width);
    d: var(--path);
  }

  .content {
    font-size: 1em;
    display: flex;
    align-items: center;
    padding-left: 20px;
    height: 100%;
  }

  svg:hover path {
    d: var(--hover-path) !important;
  }
</style>
