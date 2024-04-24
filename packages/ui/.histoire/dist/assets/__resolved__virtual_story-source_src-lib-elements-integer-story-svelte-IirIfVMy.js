const __resolved__virtual_storySource_srcLibElementsIntegerStorySvelte = '<script lang="ts">\n  import type { Hst } from "@histoire/plugin-svelte";\n  export let Hst: Hst;\n  import Integer from "./Integer.svelte";\n  import StorySettings from "../helpers/StorySettings.svelte";\n<\/script>\n\n<Hst.Story>\n  <div>\n    <Integer value={5} min={0} max={42} />\n  </div>\n   <svelte:fragment slot="controls">\n    <StorySettings/>\n    </svelte:fragment>\n</Hst.Story>\n\n<style>\n  div {\n    padding: 1em;\n  }\n</style>\n';
export {
  __resolved__virtual_storySource_srcLibElementsIntegerStorySvelte as default
};
