<script lang="ts">
  import { getContext } from "svelte";
  import type { Readable } from "svelte/store";

  export let id: string;
  export let icon: string = "";
  export let title = "";

  const registerPanel =
    getContext<(id: string, icon: string) => Readable<boolean>>(
      "registerPanel",
    );

  let visible = registerPanel(id, icon);
</script>

{#if $visible}
  <div class="wrapper">
    {#if title}
      <header>
        <h3>{title}</h3>
      </header>
    {/if}
    <slot />
  </div>
{/if}

<style>
  header {
    border-bottom: solid thin var(--outline);
    height: 69px;
    display: flex;
    align-items: center;
    padding-left: 1em;
  }
  h3 {
    margin: 0px;
  }
</style>
