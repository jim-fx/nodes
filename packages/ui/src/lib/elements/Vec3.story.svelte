<script lang="ts">
	import type { Hst } from '@histoire/plugin-svelte';
	export let Hst: Hst;
	import Vec3 from './Vec3.svelte';
	import StoryContent from '$lib/helpers/StoryContent.svelte';
	import StorySettings from '$lib/helpers/StorySettings.svelte';

	let theme = 'dark';
</script>

<Hst.Story>
	<StoryContent {theme}>
		<Vec3 value={[0.2, 0.4, 0.6]} />
	</StoryContent>
	<svelte:fragment slot="controls">
		<StorySettings bind:theme />
	</svelte:fragment>
</Hst.Story>
