<script lang="ts">
	import type { NodeInput } from '@nodarium/types';

	import { Checkbox, Number, Select, Vec3 } from './index.js';

	interface Props {
		input: NodeInput;
		value: any;
		id?: string;
	}

	let { input, value = $bindable(), id }: Props = $props();
</script>

{#if input.type === 'float'}
	<Number bind:value min={input?.min} max={input?.max} step={input?.step} />
{:else if input.type === 'integer'}
	<Number bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'boolean'}
	<Checkbox bind:value {id} />
{:else if input.type === 'select'}
	<Select bind:value options={input.options} {id} />
{:else if input.type === 'vec3'}
	<Vec3 bind:value {id} />
{/if}
