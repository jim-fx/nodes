<script lang="ts">
  import type { createKeyMap } from "$lib/helpers/createKeyMap";
  import { ShortCut } from "@nodes/ui";

  export let keymap: ReturnType<typeof createKeyMap>;
  const keys = keymap.keys;
</script>

<div class="wrapper">
  <h3>Editor</h3>

  <section>
    {#each $keys as key}
      {#if key.description}
        <div class="command-wrapper">
          <ShortCut {...key} />
        </div>
        <p>{key.description}</p>
      {/if}
    {/each}
  </section>
</div>

<style>
  .wrapper {
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  section {
    display: grid;
    grid-template-columns: min-content 1fr;
    gap: 1em;
  }

  h3 {
    margin: 0;
  }

  .command-wrapper {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  p {
    font-size: 0.9em;
    margin: 0;
    display: flex;
    align-items: center;
  }
</style>
