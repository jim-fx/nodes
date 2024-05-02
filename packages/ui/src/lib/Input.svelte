<script lang="ts">
	import Checkbox from './elements/Checkbox.svelte';
	import Float from './elements/Float.svelte';
	import Integer from './elements/Integer.svelte';
	import Select from './elements/Select.svelte';

	import type { NodeInput } from '@nodes/types';
	import Vec3 from './elements/Vec3.svelte';

	export let input: NodeInput;
	export let value: any;
	export let id: string;
</script>

{#if input.type === 'float'}
	<Float {id} bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'integer'}
	<Integer {id} bind:value min={input?.min} max={input?.max} />
{:else if input.type === 'boolean'}
	<Checkbox {id} bind:value />
{:else if input.type === 'select'}
	<Select {id} bind:value options={input.options} />
{:else if input.type === 'vec3'}
	<Vec3 {id} bind:value />
{/if}

