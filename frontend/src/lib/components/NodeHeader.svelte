<script lang="ts">
  import type { Node } from "$lib/types";
  import { getContext } from "svelte";
  import { getGraphManager, getGraphState } from "./graph/context";

  export let node: Node;

  const graph = getGraphManager();
  const state = getGraphState();

  function createPath({ depth = 8, height = 20, y = 50 } = {}) {
    let corner = 10;

    let right_bump = node.tmp.type.outputs.length > 0;

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

  const setDownSocket = getContext("setDownSocket");

  function handleMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    setDownSocket({
      node,
      index: 0,
      position: [node.position.x + 5, node.position.y + 0.625],
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
    style={`background: var(--node-hovered-out-${node.tmp?.type?.outputs?.[0]}`}
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    preserveAspectRatio="none"
    style={`
      --path: path("${createPath({ depth: 5, height: 27, y: 50 })}");
      --hover-path: path("${createPath({ depth: 6, height: 33, y: 50 })}");
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
