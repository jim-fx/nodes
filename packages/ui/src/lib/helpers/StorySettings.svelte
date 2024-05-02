<script lang="ts">
	import { Select } from '$lib/index.js';

	const themes = ['dark', 'light', 'catppuccin', 'solarized', 'high-contrast', 'nord', 'dracula'];

	let value = 0;
	export let theme = themes[value];
	$: theme = themes[value];
</script>

<div>
	<label for="theme-select"> Select Theme </label>
	<Select id="" bind:value options={themes} />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
	}
</style>
