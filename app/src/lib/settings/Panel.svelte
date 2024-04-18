<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import type { Writable } from "svelte/store";
  import NestedSettings from "./NestedSettings.svelte";

  export let setting: {
    icon: string;
    id: string;
    definition: Record<string, NodeInput>;
    settings: Writable<Record<string, unknown>>;
  };

  const store = setting.settings;

  interface Nested {
    [key: string]: NodeInput | Nested;
  }

  $: nestedSettings = constructNested();

  function constructNested() {
    const nested: Nested = {};

    for (const key in setting.definition) {
      const parts = key.split(".");
      let current = nested;
      for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1) {
          current[parts[i]] = setting.definition[key];
        } else {
          current[parts[i]] = current[parts[i]] || {};
          current = current[parts[i]] as Nested;
        }
      }
    }
    return nested;
  }
</script>

<div class="flex flex-col">
  <h1 class="m-0 p-4">{setting.id}</h1>
  <NestedSettings settings={nestedSettings} {store} />
</div>

<style>
  h1 {
    border-bottom: solid thin var(--outline);
  }
</style>
