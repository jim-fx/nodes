<script lang="ts">
  export let value: boolean;

  $: if (typeof value === "string") {
    value = value === "true";
  } else if (typeof value === "number") {
    value = value === 1;
  }

  export let id: string;
</script>

<input {id} type="checkbox" bind:checked={value} />
