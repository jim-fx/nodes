<script lang="ts">
  import type { Node } from "$lib/types";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { getGraphManager } from "./graph/context";

  export let node: Node;

  const graph = getGraphManager();

  export let inView = true;

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
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      {node}
      id={key}
      index={i}
      value={node?.props?.[key]}
      input={value}
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
  }

  .node.in-view {
    display: unset;
  }
</style>
