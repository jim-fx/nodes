<script lang="ts">
  import type { createKeyMap } from "$lib/helpers/createKeyMap";
  import { getContext } from "svelte";

  const { keys } = getContext<ReturnType<typeof createKeyMap>>("keymap");
</script>

<div class="wrapper">
  <h3>Editor</h3>

  <section>
    {#each $keys as key}
      {#if key.description}
        <div class="command-wrapper">
          <div class="command">
            {#if key.ctrl}
              <b>Ctrl</b>
            {/if}
            {#if key.shift}
              <b>Shift</b>
            {/if}
            {#if key.alt}
              <b>Alt</b>
            {/if}
            <b>{key.key}</b>
          </div>
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
    justify-content: left;
    align-items: center;
  }

  .command {
    background: var(--layer-3);
    padding: 0.4em;
    border-radius: 0.3em;
    white-space: nowrap;
  }

  .command > * {
    color: var(--layer-0);
  }

  p {
    font-size: 0.9em;
    margin: 0;
    display: flex;
    align-items: center;
  }
</style>
