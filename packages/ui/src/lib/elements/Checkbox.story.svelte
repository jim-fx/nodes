<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Checkbox from "./Checkbox.svelte";
  import StoryContent from "$lib/helpers/StoryContent.svelte";
  import StorySettings from "$lib/helpers/StorySettings.svelte";
  let theme = "dark";
</script>

<Hst.Story>
  <StoryContent {theme}>
    <Checkbox value={false} />
  </StoryContent>
  <svelte:fragment slot="controls">
    <StorySettings bind:theme />
  </svelte:fragment>
</Hst.Story>
