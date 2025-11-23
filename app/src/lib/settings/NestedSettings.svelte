<script lang="ts">
  import NestedSettings from "./NestedSettings.svelte";
  import { localState } from "$lib/helpers/localState.svelte";
  import type { NodeInput } from "@nodes/types";
  import Input from "@nodes/ui";

  type Button = { type: "button"; label?: string };

  type InputType = NodeInput | Button;

  type SettingsNode = InputType | SettingsGroup;

  interface SettingsGroup {
    title?: string;
    [key: string]: any;
  }

  type SettingsType = Record<string, SettingsNode>;

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

  // Local persistent state for <details> sections
  const openSections = localState<Record<string, boolean>>("open-details", {});

  let { id, key = "", value = $bindable(), type, depth = 0 }: Props = $props();

  function isNodeInput(v: SettingsNode | undefined): v is InputType {
    return !!v && typeof v === "object" && "type" in v;
  }

  function getDefaultValue(): unknown {
    if (key === "" || key === "title") return;

    const node = type[key];

    if (!isNodeInput(node)) return;

    const anyNode = node as any;

    // select input: use index into options
    if (Array.isArray(anyNode.options)) {
      if (value?.[key] !== undefined) {
        return anyNode.options.indexOf(value[key]);
      }
      return 0;
    }

    if (value?.[key] !== undefined) return value[key];

    if ("value" in node && anyNode.value !== undefined) {
      return anyNode.value;
    }

    switch (node.type) {
      case "boolean":
        return 0;
      case "float":
        return 0.5;
      case "integer":
      case "select":
        return 0;
      default:
        return 0;
    }
  }

  let internalValue = $state(getDefaultValue());

  let open = $state(openSections[id]);

  // Persist <details> open/closed state for groups
  if (depth > 0 && !isNodeInput(type[key!])) {
    $effect(() => {
      if (open !== undefined) {
        openSections[id] = open;
      }
    });
  }

  // Sync internalValue back into `value`
  $effect(() => {
    if (key === "" || internalValue === undefined) return;

    const node = type[key];

    if (
      isNodeInput(node) &&
      Array.isArray((node as any).options) &&
      typeof internalValue === "number"
    ) {
      value[key] = (node as any).options[internalValue] as any;
    } else {
      value[key] = internalValue as any;
    }
  });
</script>

{#if key && isNodeInput(type?.[key])}
  <!-- Leaf input -->
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
  <!-- Root: iterate over top-level keys -->
  {#each Object.keys(type ?? {}).filter((k) => k !== "title") as childKey}
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
  <!-- Group -->
  {#if depth > 0}
    <hr />
  {/if}
  <details bind:open>
    <summary><p>{(type[key] as SettingsGroup).title || key}</p></summary>
    <div class="content">
      {#each Object.keys(type[key] as SettingsGroup).filter((k) => k !== "title") as childKey}
        <NestedSettings
          id={`${id}.${childKey}`}
          key={childKey}
          value={value[key] as SettingsValue}
          type={type[key] as unknown as SettingsType}
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
