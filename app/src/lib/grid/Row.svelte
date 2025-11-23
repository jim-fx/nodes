<script lang="ts">
  import { setContext, getContext } from "svelte";
  import { localState } from "$lib/helpers/localState.svelte";

  const gridId = getContext<string>("grid-id") || "grid-0";
  let sizes = localState<string[]>(gridId, []);

  const { children } = $props();

  let registerIndex = 0;
  setContext("registerCell", function () {
    let index = registerIndex;
    registerIndex++;
    if (registerIndex > sizes.length) {
      sizes = [...sizes, "1fr"];
    }
    return index;
  });

  setContext("sizes", sizes);

  const cols = $derived(
    sizes.map((size, i) => `${i > 0 ? "1px " : ""}` + size).join(" "),
  );
</script>

<div class="wrapper" style={`grid-template-columns: ${cols};`}>
  {@render children()}
</div>

<style>
  .wrapper {
    display: grid;
    height: 100%;
  }
</style>
