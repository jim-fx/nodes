<script lang="ts">
	import '$lib/app.css';
	import Float from '$lib/elements/Float.svelte';
	import Integer from '$lib/elements/Integer.svelte';
	import Vec3 from '$lib/elements/Vec3.svelte';

	let intValue = $state(0);
	let floatValue = $state(0.2);
	let vecValue = $state([0.2, 0.3, 0.4]);
</script>

<main>
	<section>
		<h3>Integer {intValue}</h3>
		<Integer bind:value={intValue} />
	</section>

	<section>
		<h3>Float {floatValue}</h3>
		<Float bind:value={floatValue} />
	</section>

	<section>
		<h3>Vec3 {JSON.stringify(vecValue)}</h3>
		<Vec3 bind:value={vecValue} />
	</section>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
	}
</style>
