<script lang="ts">
  import type { Node } from "@nodes/types";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { getContext, onMount } from "svelte";

  let ref: HTMLDivElement;

  type Props = {
    node: Node;
    position?: "absolute" | "fixed" | "relative";
    isActive?: boolean;
    isSelected?: boolean;
    inView?: boolean;
    z?: number;
  };

  let {
    node = $bindable(),
    position = "absolute",
    isActive = false,
    isSelected = false,
    inView = true,
    z = 2,
  }: Props = $props();

  const zOffset = (node.tmp?.random || 0) * 0.5;
  const zLimit = 2 - zOffset;

  const type = node?.tmp?.type;

  const parameters = Object.entries(type?.inputs || {}).filter(
    (p) =>
      p[1].type !== "seed" && !("setting" in p[1]) && p[1]?.hidden !== true,
  );

  const updateNodePosition =
    getContext<(n: Node) => void>("updateNodePosition");

  onMount(() => {
    node.tmp = node.tmp || {};
    node.tmp.ref = ref;
    updateNodePosition?.(node);
  });
</script>

<div
  class="node {position}"
  class:active={isActive}
  style:--cz={z + zOffset}
  style:display={inView && z > zLimit ? "block" : "none"}
  class:selected={isSelected}
  class:out-of-view={!inView}
  data-node-id={node.id}
  data-node-type={node.type}
  bind:this={ref}
>
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      {node}
      id={key}
      input={value}
      isLast={i == parameters.length - 1}
    />
  {/each}
</div>

<style>
  .node {
    box-sizing: border-box;
    user-select: none !important;
    cursor: pointer;
    width: 200px;
    color: var(--text-color);
    transform: translate3d(var(--nx), var(--ny), 0);
    z-index: 1;
    opacity: calc((var(--cz) - 2.5) / 3.5);
    font-weight: 300;
    --stroke: var(--outline);
    --stroke-width: 2px;
  }

  .node.active {
    --stroke: var(--active);
    --stroke-width: 2px;
  }

  .node.selected {
    --stroke: var(--selected);
    --stroke-width: 2px;
  }
</style>
