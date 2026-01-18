<script lang="ts">
  import "@nodarium/ui/app.css";
  import "../app.css";
  import type { Snippet } from "svelte";
  const { children } = $props<{ children?: Snippet }>();
</script>

{@render children?.()}
