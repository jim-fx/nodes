<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Select from "./Select.svelte";
</script>

<Hst.Story>
  <div>
    <Select value={"banana"} options={["strawberry", "apple", "banana"]} />
  </div>
</Hst.Story>

<style>
  div {
    padding: 1em;
  }
</style>
