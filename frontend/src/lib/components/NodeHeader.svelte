<script lang="ts">
  import type { Node } from "$lib/types";
  import { getGraphManager, getGraphState } from "./graph/context";

  export let node: Node;

  const graph = getGraphManager();
  const state = getGraphState();

  function createPath({ depth = 8, height = 20, y = 50 } = {}) {
    let corner = 10;

    let right_bump = true;

    return `M0,100
      ${
        corner
          ? ` V${corner}
              Q0,0 ${corner / 4},0
              H${100 - corner / 4}
              Q100,0  100,${corner}
            `
          : ` V0
              H100
            `
      }
      V${y - height / 2}
      ${
        right_bump
          ? ` C${100 - depth},${y - height / 2} ${100 - depth},${y + height / 2} 100,${y + height / 2}`
          : ` H100`
      }
      V100
      Z`.replace(/\s+/g, " ");
  }

  function handleMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    state.setMouseDown({
      x: node.position.x + 5,
      y: node.position.y + 0.625,
      node,
      socketIndex: 0,
      isInput: false,
    });
  }
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
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    preserveAspectRatio="none"
    style={`
      --path: path("${createPath({ depth: 5, height: 27, y: 46 })}");
      --hover-path: path("${createPath({ depth: 6, height: 33, y: 46 })}");
    `}
  >
    <!-- <ellipse -->
    <!--   cx="100" -->
    <!--   cy="48" -->
    <!--   rx="5.4" -->
    <!--   ry="20" -->
    <!--   fill="rgba(255,0,0,0.3)" -->
    <!--   id="one" -->
    <!-- /> -->
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
  .wrapper > * {
    /* pointer-events: none; */
  }

  .click-target {
    position: absolute;
    right: -2.5px;
    top: 4px;
    height: 5px;
    width: 5px;
    z-index: 100;
    border-radius: 50%;
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
    height: calc(100% + 1px);
    overflow: visible;
  }

  ellipse {
    z-index: 99;
  }

  svg path {
    stroke-width: 0.2px;
    transition: 0.2s;
    fill: #060606;
    stroke: #777;
    stroke-width: 0.1;
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
