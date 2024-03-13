<script lang="ts">
  import type { Node } from "$lib/types";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { activeNodeId, selectedNodes } from "./graph/stores";

  export let node: Node;
  export let inView = true;

  const type = node?.tmp?.type;

  const parameters = Object.entries(type?.inputs || {});
</script>

<div
  class="node"
  class:active={$activeNodeId === node.id}
  class:selected={!!$selectedNodes?.has(node.id)}
  class:in-view={inView}
  data-node-id={node.id}
  bind:this={node.tmp.ref}
>
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      {node}
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
    --stroke: #777;
    --stroke-width: 0.1px;
  }

  .node.active {
    --stroke: white;
    --stroke-width: 0.3px;
  }

  .node.selected {
    --stroke: #f2be90;
    --stroke-width: 0.2px;
  }

  .node.in-view {
    display: unset;
  }
</style>
