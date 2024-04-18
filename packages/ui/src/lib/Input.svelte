<script lang="ts">
  import Checkbox from "$lib/elements/Checkbox.svelte";
  import Float from "$lib/elements/Float.svelte";
  import Integer from "$lib/elements/Integer.svelte";
  import Select from "$lib/elements/Select.svelte";

  import type { NodeInput } from "@nodes/types";

  export let input: NodeInput;
  export let value: any;
  export let id: string;
</script>

{#if input.type === "float"}
  <Float {id} bind:value min={input?.min} max={input?.max} />
{:else if input.type === "integer"}
  <Integer {id} bind:value min={input?.min} max={input?.max} />
{:else if input.type === "boolean"}
  <Checkbox {id} bind:value />
{:else if input.type === "select"}
  <Select {id} bind:value options={input.options} />
{/if}
