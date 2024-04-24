<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import { setContext } from "svelte";
  import { derived } from "svelte/store";

  let panels: Record<
    string,
    {
      icon: string;
      id: string;
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

  setContext("registerPanel", (id: string, icon: string) => {
    panels[id] = { id, icon };
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
      on:click={() => {
        setActivePanel($activePanel ? false : keys[0]);
      }}
    >
      <span class="absolute i-tabler-chevron-left w-6 h-6 block"></span>
    </button>
    {#each keys as panel (panels[panel].id)}
      <button
        class="tab"
        class:active={panel === $activePanel}
        on:click={() => setActivePanel(panel)}
      >
        <i class={`block w-6 h-6 ${panels[panel].icon}`} />
      </button>
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

  h1 {
    border-bottom: solid thin var(--outline);
    box-sizing: border-box;
    height: 70px;
  }

  .content {
    background: var(--layer-1);
    position: relative;
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
