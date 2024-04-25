<script lang="ts">
  import { getContext } from "svelte";
  import type { Readable } from "svelte/store";

  export let id: string;
  export let icon: string = "";
  export let title = "";
  export let classes = "";
  export let hidden: boolean;

  const setVisibility =
    getContext<(id: string, visible: boolean) => void>("setVisibility");

  $: if (typeof hidden === "boolean") {
    setVisibility(id, !hidden);
  }

  const registerPanel =
    getContext<
      (id: string, icon: string, classes: string) => Readable<boolean>
    >("registerPanel");

  let visible = registerPanel(id, icon, classes);
  console.log(id, $visible, hidden);
</script>

{#if $visible}
  <div class="wrapper" class:hidden>
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
