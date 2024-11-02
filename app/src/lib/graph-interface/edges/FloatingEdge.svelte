<script lang="ts">
  import Edge from "./Edge.svelte";

  type Props = { from: { x: number; y: number }; to: { x: number; y: number } };
  const { from, to }: Props = $props();
</script>

<Edge {from} {to} />
