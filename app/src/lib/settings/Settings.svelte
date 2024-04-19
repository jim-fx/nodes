<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import type { Writable } from "svelte/store";
  import localStore from "$lib/helpers/localStore";
  import type { SvelteComponent } from "svelte";
  import NestedSettings from "./NestedSettings.svelte";

  export let panels: Record<
    string,
    {
      icon: string;
      id: string;
      component?: typeof SvelteComponent<{}, {}, {}>;
      definition: Record<string, NodeInput>;
      settings: Writable<Record<string, unknown>>;
    }
  >;

  const activePanel = localStore<keyof typeof panels | false>(
    "nodes.settings.activePanel",
    false,
  );
  $: keys = panels
    ? (Object.keys(panels) as unknown as (keyof typeof panels)[])
    : [];

  function setActivePanel(panel: keyof typeof panels | false) {
    if (panel === $activePanel) {
      $activePanel = false;
    } else if (panel) {
      $activePanel = panel;
    } else {
      $activePanel = false;
    }
  }

  interface Nested {
    [key: string]: NodeInput | Nested;
  }

  function constructNested(panel: (typeof panels)[keyof typeof panels]) {
    const nested: Nested = {};

    for (const key in panel.definition) {
      const parts = key.split(".");
      let current = nested;
      for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1) {
          current[parts[i]] = panel.definition[key];
        } else {
          current[parts[i]] = current[parts[i]] || {};
          current = current[parts[i]] as Nested;
        }
      }
    }
    return nested;
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
    {#if $activePanel && panels[$activePanel]}
      <h1 class="m-0 p-4">{panels[$activePanel].id}</h1>
      {#key $activePanel}
        {#if panels[$activePanel]?.component}
          <svelte:component
            this={panels[$activePanel].component}
            {...panels[$activePanel]}
          />
        {:else}
          <div class="flex flex-col">
            <NestedSettings
              settings={constructNested(panels[$activePanel])}
              store={panels[$activePanel].settings}
            />
          </div>
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

  h1 {
    border-bottom: solid thin var(--outline);
    box-sizing: border-box;
    height: 70px;
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
