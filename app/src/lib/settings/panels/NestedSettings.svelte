<script lang="ts">
  import NestedSettings from "./NestedSettings.svelte";
  import {localState} from "$lib/helpers/localState.svelte";
  import type { NodeInput } from "@nodes/types";
  import Input from "@nodes/ui";

  type Button = { type: "button"; label?: string };

  type InputType = NodeInput | Button;

  interface Nested {
    [key: string]: (Nested & { title?: string }) | InputType;
  }

  type Props = {
    id: string;
    key?: string;
    value: Record<string, unknown> | string | number | boolean;
    type: Nested;
    depth?: number;
  };

  let { id, key = "", value = $bindable(), type, depth = 0 }: Props = $props();

  function isNodeInput(v: InputType | Nested): v is InputType {
    return v && "type" in v;
  }

  let internalValue = $state(Array.isArray(type?.[key]?.options) ? type[key]?.options?.indexOf(value?.[key]) : value?.[key]);

  let openSections = localState("open-details", {});
  let open = $state(openSections[id]);
  if(depth > 0 && !isNodeInput(type[key])){
    $effect(() => {
      if(open !== undefined){}
      openSections[id] = open;
      });
    }
  

  $effect(() => {
    if(key === "" || internalValue === undefined) return;
    if(isNodeInput(type[key]) && Array.isArray(type[key]?.options) && typeof internalValue === "number"){
       value[key] = type[key].options?.[internalValue];
    }else{
       value[key] = internalValue;
    }
  })
</script>

{#if key && isNodeInput(type?.[key]) }
  <div class="input input-{type[key].type}">
    {#if type[key].type === "button"}
      <button onclick={() => console.log(type[key])}>
        {type[key].label || key}
      </button>
    {:else}
      <label for={id}>{type[key].label || key}</label>
      <Input id={id} input={type[key]} bind:value={internalValue} />
    {/if}
  </div>
{:else}
  {#if depth === 0}
    {#each Object.keys(type).filter((key) => key !== "title") as childKey}
      <NestedSettings
        id={`${id}.${childKey}`}
        key={childKey}
        value={value as Record<string, unknown>}
        type={type as Nested}
        depth={depth + 1}
      />
    {/each}
  {#if depth > 0}
    <hr />
  {/if}
  {:else if key && type?.[key]}
  {#if depth > 0}
    <hr />
  {/if}
    <details bind:open>
      <summary>{type[key]?.title||key}</summary>
      <div class="content">
        {#each Object.keys(type[key]).filter((key) => key !== "title") as childKey}
          <NestedSettings
            id={`${id}.${childKey}`}
            key={childKey}
            value={value[key] as Record<string, unknown>}
            type={type[key] as Nested}
            depth={depth + 1}
          />
        {/each}
      </div>
    </details>


  {/if}

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
