<script lang="ts">
  import type { GraphManager } from "$lib/graph-manager";
  import type { Node } from "$lib/types";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";

  export let node: Node;
  export let graph: GraphManager;

  const type = graph.getNodeType(node.type);

  const parameters = Object.entries(type?.inputs || {});
</script>

<div
  class="node"
  data-node-id={node.id}
  style={`--nx:${node.position.x * 10}px;
          --ny: ${node.position.y * 10}px`}
>
  <NodeHeader {node} />

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
    transform: translate(var(--nx), var(--ny));
    z-index: 1;
    font-weight: 300;
    font-size: 0.5em;
  }
</style>
