<script lang="ts">
	export let value = 0.5;
	export let step = 0.01;
	export let min = 0;
	export let max = 1;
	export let id = '';

	if (min > max) {
		[min, max] = [max, min];
	}
	if (value > max) {
		max = value;
	}

	function strip(input: number) {
		return +parseFloat(input + '').toPrecision(2);
	}

	let inputEl: HTMLInputElement;

	$: if ((value || 0).toString().length > 5) {
		value = strip(value || 0);
	}
	$: value !== undefined && handleChange();
	let oldValue: number;
	function handleChange() {
		if (value === oldValue) return;
		oldValue = value;
	}

	$: width = Number.isFinite(value)
		? Math.max((value?.toString().length ?? 1) * 8, 50) + 'px'
		: '20px';

	let isMouseDown = false;
	let downV = 0;
	let vx = 0;
	let rect: DOMRect;

	function handleMouseDown(ev: MouseEvent) {
		ev.preventDefault();

		inputEl.focus();

		isMouseDown = true;

		downV = value;
		rect = inputEl.getBoundingClientRect();

		window.removeEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = 'ew-resize';
	}

	function handleMouseUp() {
		isMouseDown = false;

		if (downV === value) {
			inputEl.focus();
		}

		if (value > max) {
			max = value;
		}

		if (value < min) {
			min = value;
		}

		document.body.style.cursor = 'unset';
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('mousemove', handleMouseMove);
	}

	function handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Escape' || ev.key === 'Enter') {
			handleMouseUp();
			inputEl.blur();
		}
	}

	function handleMouseMove(ev: MouseEvent) {
		vx = (ev.clientX - rect.left) / rect.width;

		if (ev.ctrlKey) {
			let v = min + (max - min) * vx;
			value = v;
		} else {
			value = Math.max(Math.min(min + (max - min) * vx, max), min);
		}
	}
</script>

<div class="component-wrapper" class:is-down={isMouseDown}>
	<span class="overlay" style={`width: ${((value - min) / (max - min)) * 100}%`}></span>
	<input
		bind:value
		bind:this={inputEl}
		{id}
		{step}
		{max}
		{min}
		on:keydown={handleKeyDown}
		on:mousedown={handleMouseDown}
		on:mouseup={handleMouseUp}
		type="number"
		style={`width:${width};`}
	/>
</div>

<style>
	.component-wrapper {
		position: relative;
		background-color: var(--layer-2, #4b4b4b);
		border-radius: 4px;
		user-select: none;
		transition: box-shadow 0.3s ease;
		border: solid 1px var(--outline);
		box-sizing: border-box;
		overflow: hidden;
		border-radius: var(--border-radius, 2px);
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	input[type='number'] {
		box-sizing: border-box;
		-webkit-appearance: textfield;
		-moz-appearance: textfield;
		appearance: textfield;
		font-family: var(--font-family);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		color: var(--text-color);
		background-color: transparent;
		padding: var(--padding, 6px);
		font-size: 1em;
		padding-inline: 10px;
		text-align: center;
		border: none;
		border-style: none;
		min-width: 100%;
	}

	.is-down > input {
		cursor: ew-resize !important;
	}

	.overlay {
		position: absolute;
		top: 0px;
		left: 0px;
		height: 100%;
		max-width: 100%;
		background-color: var(--text-color);
		opacity: 0.3;
		pointer-events: none;
		transition: width 0.3s ease;
	}

	.is-down > .overlay {
		transition: none !important;
	}
</style>
