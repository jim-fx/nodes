<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  let index = -1;
  let wrapper: HTMLDivElement;

  $: if (index === -1) {
    index = getContext<() => number>("registerCell")();
  }

  const sizes = getContext<Writable<string[]>>("sizes");

  let downSizes: string[] = [];
  let downWidth = 0;
  let mouseDown = false;
  let startX = 0;

  function handleMouseDown(event: MouseEvent) {
    downSizes = [...$sizes];
    mouseDown = true;
    startX = event.clientX;
    downWidth = wrapper.getBoundingClientRect().width;
  }

  function handleMouseMove(event: MouseEvent) {
    if (mouseDown) {
      const width = downWidth + startX - event.clientX;
      $sizes[index] = `${width}px`;
      $sizes = $sizes;
    }
  }
</script>

<svelte:window
  on:mouseup={() => (mouseDown = false)}
  on:mousemove={handleMouseMove}
/>

{#if index > 0}
  <div
    class="seperator"
    role="button"
    tabindex="0"
    on:mousedown={handleMouseDown}
  ></div>
{/if}

<div class="cell" bind:this={wrapper}>
  <slot />
</div>

<style>
  .cell {
    display: block;
    position: relative;
    overflow: hidden;
  }
  .seperator {
    position: relative;
    cursor: ew-resize;
    height: 100%;
    width: 1px;
    background: var(--outline);
  }
  .seperator::before {
    content: "";
    cursor: ew-resize;
    position: absolute;
    pointer-events: all;
    height: 100%;
    width: 14px;
    z-index: 2;
    left: -7px;
  }
</style>
