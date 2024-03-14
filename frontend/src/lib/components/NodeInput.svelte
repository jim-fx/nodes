<script lang="ts">
  import Checkbox from "$lib/elements/Checkbox.svelte";
  import Float from "$lib/elements/Float.svelte";
  import Integer from "$lib/elements/Integer.svelte";
  import Select from "$lib/elements/Select.svelte";
  import type { Node, NodeInput } from "$lib/types";

  export let node: Node;
  export let input: NodeInput;
  export let id: string;

  let value = node?.props?.[id] ?? input.value;

  $: if (value) {
    node.props = node.props || {};
    node.props.value = value;
  }
</script>

{#if input.type === "float"}
  <Float bind:value />
{:else if input.type === "integer"}
  <Integer bind:value />
{:else if input.type === "boolean"}
  <Checkbox bind:value />
{:else if input.type === "select"}
  <Select options={input.options} bind:value />
{/if}
