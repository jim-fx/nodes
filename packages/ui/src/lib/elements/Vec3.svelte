<script lang="ts">
  import Float from "./Float.svelte";

  export let value = [0, 0, 0];
  export let id = "";
</script>

<Float id={`${id}-x`} bind:value={value[0]} />
<Float id={`${id}-y`} bind:value={value[1]} />
<Float id={`${id}-z`} bind:value={value[2]} />
