<script lang="ts">
  import type { Node } from "$lib/types";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";

  export let node: Node;
  export let inView = true;

  export let possibleSocketIds: null | Set<string> = null;

  const type = node?.tmp?.type;

  const parameters = Object.entries(type?.inputs || {});
</script>

<div
  class="node"
  class:in-view={inView}
  data-node-id={node.id}
  style={`--nx:${node.position.x * 10}px;
          --ny: ${node.position.y * 10}px`}
>
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      {node}
      {possibleSocketIds}
      id={key}
      index={i}
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
