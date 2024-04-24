<script lang="ts">
  import type { PerformanceStore } from ".";

  export let store: PerformanceStore;

  function getPerformanceData() {
    return Object.entries($store.total).sort((a, b) => b[1] - a[1]);
  }
</script>

{#if $store.runs.length !== 0}
  {#each getPerformanceData() as [key, value]}
    <p>{key}: {Math.floor(value * 100) / 100}ms</p>
  {/each}
{:else}
  <p>No runs available</p>
{/if}
