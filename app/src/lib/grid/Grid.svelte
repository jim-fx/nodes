<script lang="ts">
  import { setContext } from "svelte";

  export let id = "grid-0";

  setContext("grid-id", id);
</script>

<slot {id} />
