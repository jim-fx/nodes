<script lang="ts">
  import type { NodeInstance } from "@nodarium/types";
  import type { GraphManager } from "$lib/graph-interface/graph-manager.svelte";
  import ActiveNodeSelected from "./ActiveNodeSelected.svelte";

  type Props = {
    manager: GraphManager;
    node: NodeInstance | undefined;
  };

  const { manager, node }: Props = $props();
</script>

{#if node}
  {#key node.id}
    {#if node}
      <ActiveNodeSelected {manager} {node} />
    {:else}
      <p class="mx-4">Active Node has no Settings</p>
    {/if}
  {/key}
{:else}
  <p class="mx-4">No node selected</p>
{/if}
