<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Styling
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step = 1;
	export let value = 0;
	export let id = '';

	if (!value) {
		value = 0;
	}

	let inputEl: HTMLInputElement;
	let wrapper: HTMLDivElement;
	$: value !== undefined && update();

	let prev = -1;
	function update() {
		if (prev === value) return;
		prev = value;
		dispatch('change', parseFloat(value + ''));
	}

	$: width = Number.isFinite(value)
		? Math.max((value?.toString().length ?? 1) * 8, 30) + 'px'
		: '20px';

	function handleChange(change: number) {
		value = Math.max(min ?? -Infinity, Math.min(+value + change, max ?? Infinity));
	}

	let downX = 0;
	let downV = 0;
	let rect: DOMRect;

	function handleMouseDown(ev: MouseEvent) {
		ev.preventDefault();

		downV = value;
		downX = ev.clientX;
		rect = wrapper.getBoundingClientRect();

		window.removeEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = 'ew-resize';
	}

	function handleMouseUp() {
		if (downV === value) {
			inputEl.focus();
		} else {
			inputEl.blur();
		}

		document.body.style.cursor = 'unset';
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('mousemove', handleMouseMove);
	}

	function handleMouseMove(ev: MouseEvent) {
		if (!ev.ctrlKey && typeof min === 'number' && typeof max === 'number') {
			const vx = (ev.clientX - rect.left) / rect.width;
			value = Math.max(Math.min(Math.round(min + (max - min) * vx), max), min);
		} else {
			const vx = ev.clientX - downX;
			value = downV + Math.round(vx / 10);
		}
	}
</script>

<div
	class="component-wrapper"
	bind:this={wrapper}
	role="slider"
	tabindex="0"
	aria-valuenow={value}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
>
	{#if typeof min !== 'undefined' && typeof max !== 'undefined'}
		<span class="overlay" style={`width: ${Math.min((value - min) / (max - min), 1) * 100}%`} />
	{/if}
	<button on:click={() => handleChange(-step)}>-</button>
	<input
		bind:value
		bind:this={inputEl}
		{id}
		{step}
		{max}
		{min}
		type="number"
		style={`width:${width};`}
	/>

	<button on:click={() => handleChange(+step)}>+</button>
</div>

<style>
	.component-wrapper {
		position: relative;
		display: flex;
		background-color: var(--layer-2, #4b4b4b);
		border-radius: 2px;
		user-select: none;
		transition: box-shadow 0.3s ease;
		outline: solid 1px var(--outline);
		overflow: hidden;
		border-radius: var(--border-radius, 2px);
	}

	input[type='number'] {
		-webkit-appearance: textfield;
		-moz-appearance: textfield;
		appearance: textfield;
		cursor: pointer;
		font-size: 1em;
		font-family: var(--font-family);
		padding-top: 8px;
		flex: 1;
		width: 72%;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	.overlay {
		position: absolute;
		top: 0px;
		left: 0px;
		height: 100%;
		background-color: var(--layer-3);
		opacity: 0.3;
		pointer-events: none;
	}

	button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		line-height: 0px;
		margin: 0;
		color: var(--text-color);
		margin-inline: 6px;
	}

	div input[type='number'] {
		color: var(--text-color);
		background-color: transparent;
		padding: var(--padding, 6px);
		padding-inline: 0px;
		text-align: center;
		border: none;
		border-style: none;
	}
</style>

