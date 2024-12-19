<script module lang="ts">
  let openSections = localState<Record<string, boolean>>("open-details", {});
</script>

<script lang="ts">
  import NestedSettings from "./NestedSettings.svelte";
  import { localState } from "$lib/helpers/localState.svelte";
  import type { NodeInput } from "@nodes/types";
  import Input from "@nodes/ui";

  type Button = { type: "button"; label?: string };

  type InputType = NodeInput | Button;

  interface Nested {
    [key: string]: (Nested & { title?: string }) | InputType;
  }
  type SettingsType = Record<string, Nested>;
  type SettingsValue = Record<
    string,
    Record<string, unknown> | string | number | boolean | number[]
  >;

  type Props = {
    id: string;
    key?: string;
    value: SettingsValue;
    type: SettingsType;
    depth?: number;
  };

  let { id, key = "", value = $bindable(), type, depth = 0 }: Props = $props();

  function isNodeInput(v: InputType | Nested): v is InputType {
    return v && "type" in v;
  }

  function getDefaultValue() {
    if (key === "") return;
    if (key === "title") return;
    if (Array.isArray(type[key]?.options)) {
      if (value?.[key] !== undefined) {
        return type[key]?.options?.indexOf(value?.[key]);
      } else {
        return 0;
      }
    }
    if (value?.[key] !== undefined) return value?.[key];
    if (type[key]?.value !== undefined) return type[key]?.value;

    if (isNodeInput(type[key])) {
      if (type[key].type === "boolean") return 0;
      if (type[key].type === "float") return 0.5;
      if (type[key].type === "integer") return 0;
      if (type[key].type === "select") return 0;
    }
    return 0;
  }

  let internalValue = $state(getDefaultValue());

  let open = $state(openSections[id]);
  if (depth > 0 && !isNodeInput(type[key])) {
    $effect(() => {
      if (open !== undefined) {
        openSections[id] = open;
      }
    });
  }

  $effect(() => {
    if (key === "" || internalValue === undefined) return;
    if (
      isNodeInput(type[key]) &&
      Array.isArray(type[key]?.options) &&
      typeof internalValue === "number"
    ) {
      value[key] = type[key].options?.[internalValue];
    } else {
      value[key] = internalValue;
    }
  });
</script>

{#if key && isNodeInput(type?.[key])}
  <div class="input input-{type[key].type}" class:first-level={depth === 1}>
    {#if type[key].type === "button"}
      <button onclick={() => console.log(type[key])}>
        {type[key].label || key}
      </button>
    {:else}
      <label for={id}>{type[key].label || key}</label>
      <Input {id} input={type[key]} bind:value={internalValue} />
    {/if}
  </div>
{:else if depth === 0}
  {#each Object.keys(type ?? {}).filter((key) => key !== "title") as childKey}
    <NestedSettings
      id={`${id}.${childKey}`}
      key={childKey}
      {value}
      {type}
      depth={depth + 1}
    />
  {/each}
  <hr />
{:else if key && type?.[key]}
  {#if depth > 0}
    <hr />
  {/if}
  <details bind:open>
    <summary><p>{type[key]?.title || key}</p></summary>
    <div class="content">
      {#each Object.keys(type[key]).filter((key) => key !== "title") as childKey}
        <NestedSettings
          id={`${id}.${childKey}`}
          key={childKey}
          value={value[key] as SettingsValue}
          type={type[key] as SettingsType}
          depth={depth + 1}
        />
      {/each}
    </div>
  </details>
{/if}

<style>
  summary {
    cursor: pointer;
    user-select: none;
    margin-bottom: 1em;
  }

  summary > p {
    display: inline;
    padding-left: 6px;
  }

  details {
    padding: 1em;
    padding-bottom: 0;
    padding-left: 21px;
  }

  .input {
    margin-top: 15px;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 20px;
  }

  .input-boolean {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .input-boolean > label {
    order: 2;
  }

  .first-level.input {
    padding-left: 1em;
    padding-right: 1em;
    padding-bottom: 1px;
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
