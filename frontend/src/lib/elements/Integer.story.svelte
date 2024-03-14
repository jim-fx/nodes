<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Integer from "./Integer.svelte";
</script>

<Hst.Story>
  <div>
    <Integer value={5} min={0} max={42} />
  </div>
</Hst.Story>

<style>
  div {
    padding: 1em;
  }
</style>
