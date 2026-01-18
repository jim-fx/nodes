<script lang="ts">
	import Checkbox from './inputs/Checkbox.svelte';
	import Float from './inputs/Float.svelte';
	import Integer from './inputs/Integer.svelte';
	import Select from './inputs/Select.svelte';

	import type { NodeInput } from '@nodarium/types';
	import Vec3 from './inputs/Vec3.svelte';

	interface Props {
		input: NodeInput;
		value: any;
	}

	let { input, value = $bindable() }: Props = $props();
</script>

{#if input.type === 'float'}
	<Float bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'integer'}
	<Integer bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'boolean'}
	<Checkbox bind:value />
{:else if input.type === 'select'}
	<Select bind:value options={input.options} />
{:else if input.type === 'vec3'}
	<Vec3 bind:value />
{/if}
