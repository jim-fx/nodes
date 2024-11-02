<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IntegerComp from './Integer.svelte';

	const { Story } = defineMeta({
		title: 'Inputs/Integer',
		component: IntegerComp
	});
</script>

<Story name="Integer" />
