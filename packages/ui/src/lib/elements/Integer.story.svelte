<script lang="ts">
	import type { Hst } from '@histoire/plugin-svelte';
	export let Hst: Hst;
	import Integer from './Integer.svelte';
	import StorySettings from '../helpers/StorySettings.svelte';
	import StoryContent from '$lib/helpers/StoryContent.svelte';

	let theme = 'dark';
</script>

<Hst.Story>
	<StoryContent {theme}>
		<Integer value={5} min={0} max={42} />
	</StoryContent>
	<svelte:fragment slot="controls">
		<StorySettings bind:theme />
	</svelte:fragment>
</Hst.Story>
