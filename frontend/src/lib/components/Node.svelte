<script lang="ts">
  import type { GraphManager } from "$lib/graph-manager";
  import type { Node } from "$lib/types";
  import type { Writable } from "svelte/store";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";

  export let node: Node;
  export let graph: GraphManager;

  export let inView = true;

  export let mouseDown: Writable<false | { x: number; y: number; socket: any }>;

  const type = graph.getNodeType(node.type);

  const parameters = Object.entries(type?.inputs || {});
</script>

<div
  class="node"
  class:in-view={inView}
  class:is-moving={node?.tmp?.isMoving}
  data-node-id={node.id}
  style={`--nx:${node.position.x * 10}px;
          --ny: ${node.position.y * 10}px`}
>
  <NodeHeader {node} {mouseDown} />

  {#each parameters as [key, value], i}
    <NodeParameter
      value={node?.props?.[key]}
      input={value}
      label={key}
      isLast={i == parameters.length - 1}
    />
  {/each}
</div>

<style>
  .node {
    position: absolute;
    box-sizing: border-box;
    user-select: none !important;
    cursor: pointer;
    width: 50px;
    color: white;
    transform: translate3d(var(--nx), var(--ny), 0);
    z-index: 1;
    font-weight: 300;
    font-size: 0.5em;
    display: none;
    transition: transform 0.2s ease;
  }

  .node.is-moving {
    z-index: 100;
    transition: none !important;
  }

  .node.in-view {
    display: unset;
  }
</style>
