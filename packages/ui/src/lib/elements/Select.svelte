<script lang="ts">
	let {
		id,
		value = $bindable(0),
		options
	}: { id: string; value: number; options: string[] } = $props();
</script>

<select {id} bind:value>
	{#each options as label, i}
		<option value={i}>{label}</option>
	{/each}
</select>

<style>
	select {
		background: var(--layer-2);
		color: var(--text-color);
		font-family: var(--font-family);
		outline: solid 1px var(--outline);
		padding: 0.8em 1em;
		border-radius: 5px;
		border: none;
	}
</style>
