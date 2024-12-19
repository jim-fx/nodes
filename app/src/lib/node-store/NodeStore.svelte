<script lang="ts">
  import { writable } from "svelte/store";
  import BreadCrumbs from "./BreadCrumbs.svelte";
  import DraggableNode from "./DraggableNode.svelte";
  import type { RemoteNodeRegistry } from "@nodes/registry";

  export let registry: RemoteNodeRegistry;

  const activeId = writable("max/plantarium");
  let showBreadCrumbs = false;

  // const activeId = localStore<
  //   `${string}` | `${string}/${string}` | `${string}/${string}/${string}`
  // >("nodes.store.activeId", "");

  $: [activeUser, activeCollection, activeNode] = $activeId.split(`/`);
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
      <div>Loading User...</div>
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
