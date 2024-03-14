<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Checkbox from "./Checkbox.svelte";
</script>

<Hst.Story>
  <div>
    <Checkbox checked={false} />
  </div>
</Hst.Story>

<style>
  div {
    padding: 1em;
  }
</style>
