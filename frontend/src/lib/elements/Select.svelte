<script lang="ts">
  export let options: string[] = [];
  export let value: string = options[0];
</script>

<select bind:value>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<style>
  select {
    background: var(--background-color-lighter);
    color: var(--text-color);
    font-family: var(--font-family);
    padding: 0.8em 1em;
    border-radius: 5px;
    border: none;
  }
</style>
