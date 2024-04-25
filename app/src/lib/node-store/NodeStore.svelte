<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import type { RemoteNodeRegistry } from "$lib/node-registry-client";
  import BreadCrumbs from "./BreadCrumbs.svelte";
  import DraggableNode from "./DraggableNode.svelte";

  export let registry: RemoteNodeRegistry;

  const activeId = localStore<
    `${string}` | `${string}/${string}` | `${string}/${string}/${string}`
  >("nodes.store.activeId", "");

  $: [activeUser, activeCollection, activeNode] = $activeId.split(`/`);
</script>

<BreadCrumbs {activeId} />

<div class="wrapper">
  {#if !activeUser}
    {#await registry.fetchUsers()}
      <div>Loading...</div>
    {:then users}
      {#each users as user}
        <button
          on:click={() => {
            $activeId = user.id;
          }}>{user.id}</button
        >
      {/each}
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {:else if !activeCollection}
    {#await registry.fetchUser(activeUser)}
      <div>Loading...</div>
    {:then user}
      {#each user.collections as collection}
        <button
          on:click={() => {
            $activeId = collection.id;
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
      <div>Loading...</div>
    {:then collection}
      {#each collection.nodes as node}
        {#await registry.fetchNodeDefinition(node.id)}
          <div>Loading...</div>
        {:then node}
          <DraggableNode {node} />
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
    max-height: calc(100vh - 170px);
    overflow-y: auto;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin-bottom: 0.5em;
  }
  h3 {
    margin: 0;
  }
</style>
