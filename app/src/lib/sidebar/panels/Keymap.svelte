<script lang="ts">
  import type { createKeyMap } from "$lib/helpers/createKeyMap";
  import { ShortCut } from "@nodes/ui";
  import { get } from "svelte/store";

  type Props = {
    keymaps: {
      keymap: ReturnType<typeof createKeyMap>;
      title: string;
    }[];
  };

  let { keymaps }: Props = $props();
  console.log({ keymaps });
</script>

<table class="wrapper">
  <tbody>
    {#each keymaps as keymap}
      <tr>
        <td colspan="2">
          <h3>{keymap.title}</h3>
        </td>
      </tr>
      {#each get(keymap.keymap?.keys) as key}
        <tr>
          {#if key.description}
            <td class="command-wrapper">
              <ShortCut
                alt={key.alt}
                ctrl={key.ctrl}
                shift={key.shift}
                key={key.key}
              />
            </td>
            <td>{key.description}</td>
          {/if}
        </tr>
      {/each}
    {/each}
  </tbody>
</table>

<style>
  .wrapper {
    padding: 1em;
  }

  h3 {
    margin: 0;
  }

  .command-wrapper {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  td {
    font-size: 0.9em;
    margin: 0;
    padding: 7px;
    padding-left: 0;
    align-items: center;
  }
</style>
