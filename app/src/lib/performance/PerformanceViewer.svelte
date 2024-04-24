<script lang="ts">
  import type { PerformanceData } from ".";

  export let data: PerformanceData;

  function getPerformanceData() {
    return Object.entries(data.total).sort((a, b) => b[1] - a[1]);
  }
</script>

{#if data.runs.length !== 0}
  {#each getPerformanceData() as [key, value]}
    <p>{key}: {Math.floor(value * 100) / 100}ms</p>
  {/each}
{:else}
  <p>No runs available</p>
{/if}
