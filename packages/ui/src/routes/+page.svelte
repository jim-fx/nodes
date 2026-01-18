<script lang="ts">
	import '$lib/app.css';
	import { Checkbox, Details, Float, Integer, Select, ShortCut, Vec3 } from '$lib/index.js';
	import Section from './Section.svelte';

	let intValue = $state(0);
	let floatValue = $state(0.2);
	let vecValue = $state([0.2, 0.3, 0.4]);
	const options = ['strawberry', 'raspberry', 'chickpeas'];
	let selectValue = $state(0);
	const d = $derived(options[selectValue]);

	let checked = $state(false);
	let detailsOpen = $state(false);

	const themes = ['light', 'solarized', 'catppuccin', 'high-contrast', 'nord', 'dracula'];
	let themeIndex = $state(0);
	$effect(() => {
		const classList = document.documentElement.classList;
		for (const c of classList) {
			if (c.startsWith('theme-')) document.documentElement.classList.remove(c);
		}
		document.documentElement.classList.add(`theme-${themes[themeIndex]}`);
	});
</script>

<main class="flex flex-col gap-8 py-8">
	<div class="flex gap-4">
		<h1 class="text-4xl">@nodarium/ui</h1>
		<Select bind:value={themeIndex} options={themes}></Select>
	</div>

	<Section title="Integer" value={intValue}>
		<Integer bind:value={intValue} />
	</Section>

	<Section title="Float" value={floatValue}>
		<Float bind:value={floatValue} />
	</Section>

	<Section title="Vec3" value={JSON.stringify(vecValue)}>
		<Vec3 bind:value={vecValue} />
	</Section>

	<Section title="Select" value={d}>
		<Select bind:value={selectValue} {options} />
	</Section>

	<Section title="Checkbox" value={checked}>
		<Checkbox bind:value={checked} />
	</Section>

	<Section title="Details" value={detailsOpen}>
		<Details title="More Information" bind:open={detailsOpen}>
			<p>Here is some more information that was previously hidden.</p>
		</Details>
	</Section>

	<Section title="Shortcut">
		<ShortCut ctrl key="S" />
	</Section>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
	}
</style>
