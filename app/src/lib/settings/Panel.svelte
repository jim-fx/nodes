<script lang="ts">
  import type { NodeInput } from "@nodes/types";
  import type { Writable } from "svelte/store";
  import { Input } from "@nodes/ui";

  export let setting: {
    icon: string;
    id: string;
    definition: Record<string, NodeInput>;
    settings: Writable<Record<string, unknown>>;
  };

  const store = setting.settings;

  const keys = setting?.definition
    ? (Object.keys(
        setting.definition,
      ) as unknown as (keyof typeof setting.definition)[])
    : [];
</script>

<div class="flex flex-col gap-4">
  <h1 class="m-0">{setting.id}</h1>
  {#each keys as key}
    <div>
      {#if setting.definition && key in setting.definition}
        <Input
          id="test"
          input={setting.definition[key]}
          bind:value={$store[key]}
        ></Input>
      {/if}
      <label for="test">
        {key}
      </label>
    </div>
  {/each}
</div>
