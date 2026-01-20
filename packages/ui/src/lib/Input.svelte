<script lang="ts">
	import type { NodeInput } from '@nodarium/types';

	import Checkbox from './inputs/Checkbox.svelte';
	import Number from './inputs/Number.svelte';
	import Select from './inputs/Select.svelte';
	import Vec3 from './inputs/Vec3.svelte';

	interface Props {
		input: NodeInput;
		value: any;
		id?: string;
	}

	let { input, value = $bindable(), id }: Props = $props();
</script>

{#if input.type === 'float'}
	<Number bind:value min={input?.min} max={input?.max} step={0.01} />
{:else if input.type === 'integer'}
	<Number bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'boolean'}
	<Checkbox bind:value {id} />
{:else if input.type === 'select'}
	<Select bind:value options={input.options} {id} />
{:else if input.type === 'vec3'}
	<Vec3 bind:value {id} />
{/if}
