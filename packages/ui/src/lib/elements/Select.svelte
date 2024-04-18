<script lang="ts">
  export let options: string[] = [];
  export let value: number = 0;
  export let id: string;
</script>

<select {id} bind:value>
  {#each options as label, i}
    <option value={i}>{label}</option>
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
