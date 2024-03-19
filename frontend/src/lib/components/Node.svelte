<script lang="ts">
  import type { Node } from "$lib/types";
  import { getContext, onMount } from "svelte";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { activeNodeId, selectedNodes } from "./graph/stores";
  import { getGraphManager } from "./graph/context";

  export let node: Node;
  export let inView = true;

  const updateNodePosition =
    getContext<(n: Node) => void>("updateNodePosition");

  const type = node?.tmp?.type;

  const parameters = Object.entries(type?.inputs || {});

  let ref: HTMLDivElement;

  $: if (node) {
  }

  onMount(() => {
    if (ref) {
      node.tmp = node.tmp || {};
      node.tmp.ref = ref;
      updateNodePosition(node);
    }
  });
</script>

<div
  class="node"
  class:active={$activeNodeId === node.id}
  class:selected={!!$selectedNodes?.has(node.id)}
  class:in-view={inView}
  data-node-id={node.id}
  bind:this={ref}
>
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      bind:node
      id={key}
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
    width: 200px;
    color: var(--text-color);
    transform: translate3d(var(--nx), var(--ny), 0);
    z-index: 1;
    font-weight: 300;
    display: none;
    --stroke: var(--background-color-lighter);
    --stroke-width: 2px;
  }

  .node.active {
    --stroke: white;
    --stroke-width: 1px;
  }

  .node.selected {
    --stroke: #f2be90;
    --stroke-width: 1px;
  }

  .node.in-view {
    display: unset;
  }
</style>
