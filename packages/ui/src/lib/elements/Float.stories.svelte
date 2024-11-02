<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FloatComp from './Float.svelte';

	const { Story } = defineMeta({
		title: 'Inputs/Float',
		component: FloatComp
	});
</script>

<Story name="Float" />
