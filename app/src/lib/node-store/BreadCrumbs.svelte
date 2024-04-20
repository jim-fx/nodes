<script lang="ts">
  import type { Writable } from "svelte/store";

  export let activeId: Writable<string>;
  $: [activeUser, activeCollection, activeNode] = $activeId.split(`/`);
</script>

<div class="breadcrumbs">
  {#if activeUser}
    <button
      on:click={() => {
        $activeId = "";
      }}
    >
      root
    </button>
    {#if activeCollection}
      <button
        on:click={() => {
          $activeId = activeUser;
        }}
      >
        {activeUser}
      </button>
      {#if activeNode}
        <button
          on:click={() => {
            $activeId = `${activeUser}/${activeCollection}`;
          }}
        >
          {activeCollection}
        </button>
        <span>{activeNode}</span>
      {:else}
        <span>{activeCollection}</span>
      {/if}
    {:else}
      <span>{activeUser}</span>
    {/if}
  {:else}
    <span>root</span>
  {/if}
</div>

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    padding: 0.4em;
    gap: 0.8em;
    height: 1em;
    border-bottom: solid thin var(--outline);
  }
  .breadcrumbs > button {
    position: relative;
    background: none;
    font-family: var(--font-family);
    border: none;
    font-size: 1em;
    padding: 0px;
    cursor: pointer;
  }

  .breadcrumbs > button::after {
    content: "/";
    position: absolute;
    right: -11px;
    opacity: 0.5;
    white-space: pre;
    text-decoration: none !important;
  }

  .breadcrumbs > button:hover {
    text-decoration: underline;
  }

  .breadcrumbs > span {
    font-size: 1em;
    opacity: 0.5;
  }
</style>
