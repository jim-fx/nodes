<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import Input, { Details } from "@nodes/ui";
  import type { Writable } from "svelte/store";

  interface Nested {
    [key: string]: Nested | NodeInput;
  }

  export let settings: Nested;
  export let store: Writable<Record<string, any>>;
  export let depth = 0;

  console.log(settings);
  const keys = Object.keys(settings);
  function isNodeInput(v: NodeInput | Nested): v is NodeInput {
    return "type" in v;
  }
</script>

{#each keys as key}
  {@const value = settings[key]}
  <div class="wrapper" class:first-level={depth === 0}>
    {#if isNodeInput(value)}
      <div class="input input-{settings[key].type}">
        <label for={key}>{settings[key].label || key}</label>
        <Input
          id={key}
          input={value}
          bind:value={$store[value?.setting || key]}
        />
      </div>
    {:else}
      <details>
        <summary>{key}</summary>
        <div class="content">
          <svelte:self settings={settings[key]} {store} depth={depth + 1} />
        </div>
      </details>
    {/if}
  </div>
{/each}

<style>
  summary {
    cursor: pointer;
    user-select: none;
  }
  details {
    padding: 1rem;
    border-bottom: solid thin var(--outline);
  }

  .input {
    margin-top: 15px;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 14px;
  }

  .input-boolean {
    display: flex;
    flex-direction: row;
  }
  .input-boolean > label {
    order: 2;
  }

  .first-level > .input {
    padding-right: 1rem;
  }

  .first-level {
    border-bottom: solid thin var(--outline);
  }
  .first-level > details {
    border: none;
  }
</style>
