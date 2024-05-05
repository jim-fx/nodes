<script lang="ts">
  import { humanizeDuration, humanizeNumber } from "$lib/helpers";
  import localStore from "$lib/helpers/localStore";
  import SmallGraph from "./SmallGraph.svelte";
  import type { PerformanceData, PerformanceStore } from "@nodes/utils";

  export let store: PerformanceStore;

  const open = localStore("node.performance.small.open", {
    runtime: false,
    fps: false,
  });

  $: vertices = $store?.at(-1)?.["total-vertices"][0] || 0;
  $: faces = $store?.at(-1)?.["total-faces"][0] || 0;
  $: runtime = $store?.at(-1)?.["runtime"][0] || 0;

  function getPoints(data: PerformanceData, key: string) {
    return data?.map((run) => run[key]?.[0] || 0) || [];
  }

  export let fps: number[] = [];
</script>

<div class="wrapper">
  <table>
    <tr on:click={() => ($open.runtime = !$open.runtime)}>
      <td>{$open.runtime ? "-" : "+"} runtime </td>
      <td>{humanizeDuration(runtime || 1000)}</td>
    </tr>
    {#if $open.runtime}
      <tr>
        <td colspan="2">
          <SmallGraph points={getPoints($store, "runtime")} />
        </td>
      </tr>
    {/if}

    <tr on:click={() => ($open.fps = !$open.fps)}>
      <td>{$open.fps ? "-" : "+"} fps </td>
      <td>
        {#if fps[fps.length - 1] > 5}
          {Math.floor(1000 / fps[fps.length - 1])}fps
        {/if}
      </td>
    </tr>
    {#if $open.fps}
      <tr>
        <td colspan="2">
          <SmallGraph points={fps} />
        </td>
      </tr>
    {/if}

    <tr>
      <td>vertices </td>
      <td>{humanizeNumber(vertices || 0)}</td>
    </tr>

    <tr>
      <td>faces </td>
      <td>{humanizeNumber(faces || 0)}</td>
    </tr>
  </table>
</div>

<style>
  table {
    position: absolute;
    top: 10px;
    left: 10px;
    background: var(--layer-0);
    border: solid thin var(--outline);
    border-collapse: collapse;
  }
  tr {
    cursor: pointer;
  }
  td {
    padding: 4px;
    padding-inline: 8px;
    font-size: 0.8em;
    border: solid thin var(--outline);
  }
</style>
