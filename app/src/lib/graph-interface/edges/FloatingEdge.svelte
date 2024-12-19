<script lang="ts">
  import Edge from "./Edge.svelte";

  type Props = {
    from: { x: number; y: number };
    to: { x: number; y: number };
    z: number;
  };
  const { from, to, z }: Props = $props();
</script>

<Edge {from} {to} {z} />
