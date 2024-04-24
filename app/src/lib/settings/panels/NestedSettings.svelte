<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import type { NodeInput } from "@nodes/types";
  import Input from "@nodes/ui";
  import type { Writable } from "svelte/store";

  type Button = { type: "button"; label?: string; callback: () => void };

  type Input = NodeInput | Button;

  interface Nested {
    [key: string]: (Nested & { __title?: string }) | Input;
  }

  export let id: string;

  $: expandedDetails = localStore<Record<string, boolean>>(
    `nodes.settings.expanded.${id}`,
    {},
  );

  export let settings: Nested;
  export let store: Writable<Record<string, any>>;
  export let depth = 0;

  const keys = Object.keys(settings).filter((key) => key !== "__title");
  function isNodeInput(v: Input | Nested): v is Input {
    return v && "type" in v;
  }
  console.log({ settings, store });
</script>

{#if $store}
  {#each keys as key}
    {@const value = settings[key]}
    <div class="wrapper" class:first-level={depth === 0}>
      {#if value !== undefined && isNodeInput(value)}
        <div class="input input-{settings[key].type}">
          {#if value.type === "button"}
            <button on:click={() => value?.callback?.()}
              >{value.label || key}</button
            >
          {:else if "setting" in value && value.setting !== undefined}
            <label for={key}>{settings[key].label || key}</label>
            <Input id={key} input={value} bind:value={$store[value?.setting]} />
          {:else}
            <label for={key}>{settings[key].label || key}</label>
            <Input id={key} input={value} bind:value={$store[key]} />
          {/if}
        </div>
      {:else}
        {#if depth > 0}
          <hr />
        {/if}

        <details bind:open={$expandedDetails[key]}>
          <summary>{settings[key]?.__title || key}</summary>
          <div class="content">
            <svelte:self settings={settings[key]} {store} depth={depth + 1} />
          </div>
        </details>
      {/if}
    </div>
  {/each}
{/if}

<style>
  summary {
    cursor: pointer;
    user-select: none;
    margin-bottom: 1em;
  }
  details {
    padding: 1em;
    padding-bottom: 0;
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
    align-items: center;
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
  hr {
    position: absolute;
    margin: 0;
    left: 0;
    right: 0;
    border: none;
    border-bottom: solid thin var(--outline);
  }
</style>
