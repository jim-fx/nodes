<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Vec3Comp from './Vec3.svelte';
	const { Story } = defineMeta({
		title: 'Inputs/Vec3',
		component: Vec3Comp
	});
</script>

<Story name="Vec3" />
