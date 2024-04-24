<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import NestedSettings from "./NestedSettings.svelte";
  import type { Writable } from "svelte/store";

  interface Nested {
    [key: string]: NodeInput | Nested;
  }

  export let type: Record<string, NodeInput>;

  export let store: Writable<Record<string, any>>;

  function constructNested(type: Record<string, NodeInput>) {
    const nested: Nested = {};

    for (const key in type) {
      const parts = key.split(".");
      let current = nested;
      for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1) {
          current[parts[i]] = type[key];
        } else {
          current[parts[i]] = current[parts[i]] || {};
          current = current[parts[i]] as Nested;
        }
      }
    }
    return nested;
  }

  $: settings = constructNested({
    randomSeed: { type: "boolean", value: false },
    ...type,
  });
</script>

{#key settings}
  <NestedSettings id="graph-settings" {settings} {store} />
{/key}
