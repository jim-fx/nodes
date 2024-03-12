<script lang="ts">
  import Edge from "./Edge.svelte";

  export let from: { x: number; y: number };
  export let to: { x: number; y: number };
</script>

<Edge {from} {to} />
