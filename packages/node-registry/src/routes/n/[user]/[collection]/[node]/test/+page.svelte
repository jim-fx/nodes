<script lang="ts">
	import type { PageData } from './$types';

	import { getNode, getNodeWasm } from '$lib/registry';
	import { onMount } from 'svelte';

	export let data: PageData;
	const nodeId = `${data.params.user}/${data.params.collection}/${data.params.node}` as const;

	let node;
	let wasm;

	onMount(async () => {
		wasm = await getNodeWasm(nodeId);
		window['wasm'] = wasm;
		node = await getNode(nodeId);
	});
</script>

<h1>{data.params.user}/{data.params.collection}/{data.params.node}</h1>

<h3>Node Definition</h3>
{#if !node}
	<p>Loading Node</p>
{:else}
	<pre>{JSON.stringify(node, null, 2)}</pre>
{/if}
