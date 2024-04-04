<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Float from "./Float.svelte";
</script>

<Hst.Story>
  <div>
    <Float value={0} min={0} max={6.9} />
  </div>
</Hst.Story>

<style>
  div {
    padding: 1em;
  }
</style>
