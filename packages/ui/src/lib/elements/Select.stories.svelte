<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectComp from '$lib/elements/Select.svelte';
	const { Story } = defineMeta({
		title: 'Inputs/Select',
		component: SelectComp,

		argTypes: {
			options: {
				control: {
					type: 'select'
				}
			}
		},
		parameters: {
			actions: {
				handles: ['change']
			}
		}
	});
</script>

<Story name="Select" args={{ options: ['strawberry', 'raspberry', 'chickpeas'] }} />
