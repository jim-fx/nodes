<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import { setContext } from "svelte";
  import { derived } from "svelte/store";

  let panels: Record<
    string,
    {
      icon: string;
      id: string;
      classes: string;
      visible?: boolean;
    }
  > = {};

  const activePanel = localStore<keyof typeof panels | false>(
    "nodes.settings.activePanel",
    false,
  );

  $: keys = panels
    ? (Object.keys(panels) as unknown as (keyof typeof panels)[]).filter(
        (key) => !!panels[key]?.id,
      )
    : [];

  setContext("setVisibility", (id: string, visible: boolean) => {
    panels[id].visible = visible;
    panels = { ...panels };
  });

  setContext("registerPanel", (id: string, icon: string, classes: string) => {
    panels[id] = { id, icon, classes };
    return derived(activePanel, ($activePanel) => {
      return $activePanel === id;
    });
  });

  function setActivePanel(panel: keyof typeof panels | false) {
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
      aria-label="Close"
      on:click={() => {
        setActivePanel($activePanel ? false : keys[0]);
      }}
    >
      <span class="absolute i-tabler-chevron-left w-6 h-6 block"></span>
    </button>
    {#each keys as panel (panels[panel].id)}
      {#if panels[panel].visible !== false}
        <button
          aria-label={panel}
          class="tab {panels[panel].classes}"
          class:active={panel === $activePanel}
          on:click={() => setActivePanel(panel)}
        >
          <span class={`block w-6 h-6 ${panels[panel].icon}`}></span>
        </button>
      {/if}
    {/each}
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .wrapper {
    top: 0px;
    position: absolute;
    display: grid;
    z-index: 2;
    grid-template-columns: 30px 1fr;
    height: 100%;
    right: 0px;
    transform: translateX(calc(100% - 30px));
    transition:
      transform 0.2s,
      background 0.2s ease;
    width: 30%;
    min-width: 350px;
  }

  .content {
    background: var(--layer-1);
    z-index: 10;
    position: relative;
    max-height: 100vh;
    overflow-y: auto;
  }

  .tabs {
    display: flex;
    flex-direction: column;
    border-right: solid thin var(--outline);
  }

  .tabs > button {
    height: 35px;
    padding: 5px;
    border-radius: 0px;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    border-bottom: solid thin var(--outline);
    border-left: solid thin var(--outline);
    background: var(--layer-1);
  }

  .tabs > button > span {
    opacity: 0.5;
  }

  .tabs > button.active {
    background: var(--layer-2);
  }

  .tabs > button.active span {
    opacity: 1;
  }

  .visible .tabs {
    margin-left: -1px;
  }

  .visible > .tabs button:first-child > span {
    transform: scaleX(-1);
  }

  .visible {
    transform: translateX(0);
  }
</style>
