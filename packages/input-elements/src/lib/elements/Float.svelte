<script lang="ts">
  export let value: number = 0;
  export let min = 0;
  export let max = 10;
  export let step = 0.1;
</script>

<input type="number" bind:value {min} {max} {step} />

<style>
  input {
    background: var(--background-color-lighter);
    color: var(--text-color);
    font-family: var(--font-family);
    padding: 0.8em 1em;
    border-radius: 5px;
    border: none;
  }
</style>
