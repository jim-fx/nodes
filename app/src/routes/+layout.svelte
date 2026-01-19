<script lang="ts">
  import "@nodarium/ui/app.css";
  import "../app.css";
  import type { Snippet } from "svelte";
  import * as config from "$lib/config";
  const { children } = $props<{ children?: Snippet }>();
</script>

{@render children?.()}

<svelte:head>
  {#if config.ANALYTIC_SCRIPT}
    {@html config.ANALYTIC_SCRIPT}
  {/if}
</svelte:head>
