<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  export let Hst: Hst;
  import Select from "./Select.svelte";
  import StoryContent from "$lib/helpers/StoryContent.svelte";
  import StorySettings from "$lib/helpers/StorySettings.svelte";

  let theme = "dark";
</script>

<Hst.Story>
  <StoryContent {theme}>
    <Select id="" options={["strawberry", "apple", "banana"]} />
  </StoryContent>
  <svelte:fragment slot="controls">
    <StorySettings bind:theme />
  </svelte:fragment>
</Hst.Story>
