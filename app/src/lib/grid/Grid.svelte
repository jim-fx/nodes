<script lang="ts">
  import { setContext, type Snippet } from "svelte";

  const { children, id } = $props<{ children?: Snippet; id?: string }>();

  setContext("grid-id", id);
</script>

{@render children({ id })}
