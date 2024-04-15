<script lang="ts">
	import type { Graph, NodeRegistry } from '@nodes/types';
	import GraphEl from './Graph.svelte';
	import { GraphManager } from '../graph-manager.js';
	import { createEventDispatcher } from 'svelte';

	export let registry: NodeRegistry;
	export let graph: Graph;

	const manager = new GraphManager(registry);

	manager.on('result', (result) => {
		dispatch('result', result);
	});

	manager.on('save', (save) => {
		dispatch('save', save);
	});

	manager.load(graph);

	const dispatch = createEventDispatcher();
</script>

<GraphEl graph={manager} />
