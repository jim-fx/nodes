<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import type { Writable } from "svelte/store";
  import SettingsComponent from "./Panel.svelte";
  import localStore from "$lib/helpers/localStore";

  export let settings: Record<
    string,
    {
      icon: string;
      id: string;
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
  <div class="content p-2">
    {#if $activePanel && settings[$activePanel]}
      {#key $activePanel}
        <SettingsComponent setting={settings[$activePanel]} />
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
    background: transparent;
    right: 0px;
    transform: translateX(calc(100% - 30px));
    transition:
      transform 0.2s,
      background 0.2s ease;
    width: 30%;
    min-width: 300px;
  }

  .tabs {
    display: flex;
    flex-direction: column;
    border-right: solid thin white;
  }

  .tabs > button {
    height: 30px;
    background: none;
    background: blue;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    border-bottom: solid thin white;
    border-left: solid thin white;
  }

  .tabs > button.active {
    color: black;
    background: white;
  }

  .visible .tabs > button {
    border-left: none;
  }

  .visible .tabs {
    margin-left: -1px;
    border-left: solid thin white;
  }

  .visible > .tabs button:first-child {
    transform: scaleX(-1);
  }

  .visible {
    transform: translateX(0);
    border-left: solid thin white;
    background: black;
  }
</style>
