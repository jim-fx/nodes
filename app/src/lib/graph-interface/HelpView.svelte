<script lang="ts">
  import type { Node, NodeRegistry } from "@nodes/types";
  import { onMount } from "svelte";

  let mx = 0;
  let my = 0;

  let node: Node | undefined = undefined;
  let input: string | undefined = undefined;

  let wrapper: HTMLDivElement;

  export let registry: NodeRegistry;

  function handleMouseOver(ev: MouseEvent) {
    let target = ev.target as HTMLElement | null;
    mx = ev.clientX;
    my = ev.clientY;
    if (!target) return;

    const closest = target.closest("[data-node-type]");

    if (!closest) {
      node = undefined;
      return;
    }

    let nodeType = closest.getAttribute("data-node-type");
    let nodeInput = closest.getAttribute("data-node-input");

    if (!nodeType) {
      node = undefined;
      return;
    }
    node = registry.getNode(nodeType);
    input = nodeInput;
  }

  onMount(() => {
    wrapper?.parentElement?.setAttribute("style", "cursor:help !important");
    return () => {
      wrapper?.parentElement?.style.removeProperty("cursor");
    };
  });
</script>

<svelte:window on:mousemove={handleMouseOver} />

<div
  class="help-wrapper"
  class:visible={node}
  style="--my:{my}px; --mx:{mx}px;"
  bind:this={wrapper}
>
  {#if node}
    {#if input}
      {input}
    {:else}
      {node.id}
    {/if}
  {/if}
</div>

<style>
  .help-wrapper {
    position: fixed;
    pointer-events: none;
    transform: translate(var(--mx), var(--my));
    background: red;
    padding: 10px;
    top: 0px;
    left: 0px;
    width: 50px;
    height: 50px;
    border: 1px solid black;
    z-index: 1000;
    display: none;
  }

  .visible {
    display: block;
  }
</style>
