<script lang="ts">
  import { setContext, getContext } from "svelte";
  import localStore from "$lib/helpers/localStore";

  const gridId = getContext<string>("grid-id") || "grid-0";
  let sizes = localStore<string[]>(gridId, []);

  let registerIndex = 0;
  setContext("registerCell", function () {
    let index = registerIndex;
    registerIndex++;
    if (registerIndex > $sizes.length) {
      $sizes = [...$sizes, "1fr"];
    }
    console.log("registering cell", registerIndex);
    return index;
  });

  setContext("sizes", sizes);

  $: cols = $sizes.map((size, i) => `${i > 0 ? "5px " : ""}` + size).join(" ");
</script>

<div class="wrapper" style={`grid-template-columns: ${cols};`}>
  <slot />
</div>

<style>
  .wrapper {
    display: grid;
    height: 100%;
  }
</style>
