<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Float from "./Float.svelte";
  import StoryContent from "$lib/helpers/StoryContent.svelte";
  import StorySettings from "$lib/helpers/StorySettings.svelte";
  let theme = "dark";
</script>

<Hst.Story>
  <StoryContent {theme}>
    <Float value={0} min={0} max={6.9} />
  </StoryContent>
  <svelte:fragment slot="controls">
    <StorySettings bind:theme />
  </svelte:fragment>
</Hst.Story>
