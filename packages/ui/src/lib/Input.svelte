<script lang="ts">
  import Checkbox from "$lib/elements/Checkbox.svelte";
  import Float from "$lib/elements/Float.svelte";
  import Integer from "$lib/elements/Integer.svelte";
  import Select from "$lib/elements/Select.svelte";

  import type { NodeInput } from "@nodes/types";

  export let input: NodeInput;
  export let value: any;
</script>

{#if input.type === "float"}
  <Float bind:value />
{:else if input.type === "integer"}
  <Integer bind:value />
{:else if input.type === "boolean"}
  <Checkbox bind:value />
{:else if input.type === "select"}
  <Select bind:value labels={input.labels} />
{/if}
