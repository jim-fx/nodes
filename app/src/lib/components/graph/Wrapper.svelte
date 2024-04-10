<script lang="ts">
  import type { GraphManager } from "$lib/graph-manager";
  export let manager: GraphManager;

  import Graph from "$lib/components/graph/Graph.svelte";
  export let debug: any;
</script>

<!-- <PerfMonitor /> -->
<Graph graph={manager} bind:debug />
