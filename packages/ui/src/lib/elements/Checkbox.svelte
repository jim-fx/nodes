<script lang="ts">
	import { run } from 'svelte/legacy';



	interface Props {
		value: boolean;
		id?: string;
	}

	let { value = $bindable(), id = '' }: Props = $props();
	run(() => {
		if (typeof value === 'string') {
			value = value === 'true';
		} else if (typeof value === 'number') {
			value = value === 1;
		}
	});
</script>

<input {id} type="checkbox" bind:checked={value} />
<label for={id}>
	<svg viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M2 7L7 12L17 2"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</label>

<style>
	input[type='checkbox'] {
		position: absolute;
		overflow: hidden;
		clip: rect(0 0 0 0);
		height: 1px;
		width: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
	}
	#inputPreview {
		display: flex;
		gap: 20px;
		justify-content: center;
	}
	input + label {
		position: relative;
		font-size: 14px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		height: 22px;
		color: rgb(0, 0, 0);
	}
	input + label::before {
		content: ' ';
		display: inline;
		vertical-align: middle;
		margin-right: 3px;
		width: 22px;
		height: 22px;
		background-color: var(--layer-2);
		border-radius: 5px;
		border: none;
		box-shadow: none;
	}
	input:checked + label::after {
		content: ' ';
		background-repeat: no-repeat;
		background-size: 12px 12px;
		background-position: center center;
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 0px;
		left: 0px;
		top: 0px;
		text-align: center;
		background-color: transparent;
		color: red;
		font-size: 10px;
		height: 22px;
		width: 22px;
	}

	input + label > svg {
		position: absolute;
		display: none;
		width: 12px;
		height: 10px;
		left: 5px;
		color: var(--text-color);
		top: 5.9px;
	}

	input:checked + label > svg {
		display: block;
	}
</style>

