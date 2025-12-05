<script lang="ts">
  import BreadCrumbs from "./BreadCrumbs.svelte";
  import DraggableNode from "./DraggableNode.svelte";
  import type { RemoteNodeRegistry } from "@nodarium/registry";

  const { registry }: { registry: RemoteNodeRegistry } = $props();

  let activeId = $state("max/plantarium");
  let showBreadCrumbs = false;

  const [activeUser, activeCollection, activeNode] = $derived(
    activeId.split(`/`),
  );
</script>

{#if showBreadCrumbs}
  <BreadCrumbs {activeId} />
{/if}

<div class="wrapper">
  {#if !activeUser}
    {#await registry.fetchUsers()}
      <div>Loading Users...</div>
    {:then users}
      {#each users as user}
        <button
          onclick={() => {
            activeId = user.id;
          }}>{user.id}</button
        >
      {/each}
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {:else if !activeCollection}
    {#await registry.fetchUser(activeUser)}
      <div>Loading User...</div>
    {:then user}
      {#each user.collections as collection}
        <button
          onclick={() => {
            activeId = collection.id;
          }}
        >
          {collection.id.split(`/`)[1]}
        </button>
      {/each}
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {:else if !activeNode}
    {#await registry.fetchCollection(`${activeUser}/${activeCollection}`)}
      <div>Loading Collection...</div>
    {:then collection}
      {#each collection.nodes as node}
        {#await registry.fetchNodeDefinition(node.id)}
          <div>Loading Node... {node.id}</div>
        {:then node}
          {#if node}
            <DraggableNode {node} />
          {/if}
        {:catch error}
          <div>{error.message}</div>
        {/await}
      {/each}
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {/if}
</div>

<style>
  .wrapper {
    padding: 0.8em;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
