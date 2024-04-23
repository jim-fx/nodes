<script lang="ts">
  import type { createKeyMap } from "$lib/helpers/createKeyMap";

  export let keymap: ReturnType<typeof createKeyMap>;
  const keys = keymap.keys;
</script>

<div class="wrapper">
  <h3>Editor</h3>

  <section>
    {#each $keys as key}
      {#if key.description}
        <div class="command-wrapper">
          <div class="command">
            {#if key.ctrl}
              <span>Ctrl</span>
            {/if}
            {#if key.shift}
              <span>Shift</span>
            {/if}
            {#if key.alt}
              <span>Alt</span>
            {/if}
            {key.key}
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
    justify-content: right;
    align-items: center;
  }

  .command {
    background: var(--outline);
    padding: 0.4em;
    font-size: 0.8em;
    border-radius: 0.3em;
    white-space: nowrap;
  }

  p {
    font-size: 0.9em;
    margin: 0;
    display: flex;
    align-items: center;
  }

  span::after {
    content: " +";
    opacity: 0.5;
  }
</style>
