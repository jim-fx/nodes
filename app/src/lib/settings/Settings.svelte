<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import type { Writable } from "svelte/store";
  import SettingsComponent from "./Panel.svelte";
  import localStore from "$lib/helpers/localStore";
  import type { SvelteComponent } from "svelte";

  export let settings: Record<
    string,
    {
      icon: string;
      id: string;
      component?: typeof SvelteComponent<{}, {}, {}>;
      definition: Record<string, NodeInput>;
      settings: Writable<Record<string, unknown>>;
    }
  >;

  const activePanel = localStore<keyof typeof settings | false>(
    "nodes.settings.activePanel",
    false,
  );
  $: keys = Object.keys(settings) as unknown as (keyof typeof settings)[];

  function setActivePanel(panel: keyof typeof settings | false) {
    if (panel === $activePanel) {
      $activePanel = false;
    } else if (panel) {
      $activePanel = panel;
    } else {
      $activePanel = false;
    }
  }
</script>

<div class="wrapper" class:visible={$activePanel}>
  <div class="tabs">
    <button
      on:click={() => {
        setActivePanel($activePanel ? false : keys[0]);
      }}
    >
      <span class="absolute i-tabler-chevron-left w-6 h-6 block"></span>
    </button>
    {#each keys as panel (settings[panel].id)}
      <button
        class="tab"
        class:active={panel === $activePanel}
        on:click={() => setActivePanel(panel)}
      >
        <i class={`block w-6 h-6 ${settings[panel].icon}`} />
      </button>
    {/each}
  </div>
  <div class="content">
    {#if $activePanel && settings[$activePanel]}
      {#key $activePanel}
        {#if settings[$activePanel].component}
          <svelte:component
            this={settings[$activePanel].component}
            {...settings[$activePanel]}
          />
        {:else}
          <SettingsComponent setting={settings[$activePanel]} />
        {/if}
      {/key}
    {/if}
  </div>
</div>

<style>
  .wrapper {
    top: 0px;
    position: absolute;
    display: grid;
    grid-template-columns: 30px 1fr;
    height: 100%;
    right: 0px;
    transform: translateX(calc(100% - 30px));
    transition:
      transform 0.2s,
      background 0.2s ease;
    width: 30%;
    min-width: 300px;
  }

  .content {
    background: var(--layer-1);
  }

  .tabs {
    display: flex;
    flex-direction: column;
    border-right: solid thin var(--outline);
  }

  .tabs > button {
    height: 30px;
    padding: 5px;
    background: none;
    color: var(--outline);
    border: none;
    display: flex;
    align-items: center;
    border-bottom: solid thin var(--outline);
    border-left: solid thin var(--outline);
  }

  .tabs > button.active {
    color: var(--layer-3);
    background: var(--layer-1);
  }

  .visible .tabs > button {
    border-left: none;
  }

  .visible .tabs {
    margin-left: -1px;
    border-left: solid thin var(--outline);
  }

  .visible > .tabs button:first-child {
    transform: scaleX(-1);
  }

  .visible {
    transform: translateX(0);
    border-left: solid thin var(--outline);
    background: var(--layer-0);
  }
</style>
