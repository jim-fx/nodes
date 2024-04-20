<script lang="ts">
  import type { GraphManager } from "$lib/graph-interface/graph-manager";
  import Node from "$lib/graph-interface/node/Node.svelte";
  import localStore from "$lib/helpers/localStore";
  import type { RemoteNodeRegistry } from "$lib/node-registry-client";
  import { Canvas } from "@threlte/core";
  import BreadCrumbs from "./BreadCrumbs.svelte";
  import NodeHtml from "$lib/graph-interface/node/NodeHTML.svelte";
  import DraggableNode from "./DraggableNode.svelte";

  export let nodeRegistry: RemoteNodeRegistry;
  export let manager: GraphManager;

  function handleImport() {
    nodeRegistry.load([$activeId]);
  }

  const activeId = localStore<
    `${string}` | `${string}/${string}` | `${string}/${string}/${string}`
  >("nodes.store.activeId", "");

  $: [activeUser, activeCollection, activeNode] = $activeId.split(`/`);
</script>

<BreadCrumbs {activeId} />

<div class="wrapper">
  {#if !activeUser}
    <h3>Users</h3>
    {#await nodeRegistry.fetchUsers()}
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
    {#await nodeRegistry.fetchUser(activeUser)}
      <div>Loading...</div>
    {:then user}
      <h3>Collections</h3>
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
    <h3>Nodes</h3>
    {#await nodeRegistry.fetchCollection(`${activeUser}/${activeCollection}`)}
      <div>Loading...</div>
    {:then collection}
      {#each collection.nodes as node}
        <button
          on:click={() => {
            $activeId = node.id;
          }}
        >
          {node.id.split(`/`)[2]}
        </button>
      {/each}
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {:else}
    {#await nodeRegistry.fetchNodeDefinition(`${activeUser}/${activeCollection}/${activeNode}`)}
      <div>Loading...</div>
    {:then node}
      <DraggableNode {node} />
    {:catch error}
      <div>{error.message}</div>
    {/await}
  {/if}
</div>

<style>
  .wrapper {
    padding: 1em;
  }
</style>
