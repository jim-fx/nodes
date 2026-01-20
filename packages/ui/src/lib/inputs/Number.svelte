<script lang="ts">
	interface Props {
		value?: number;
		step?: number;
		min?: number;
		max?: number;
		id?: string;
	}

	let {
		value = $bindable(1),
		step = 1,
		min = $bindable(0),
		max = $bindable(1),
		id: _id
	}: Props = $props();
	const uid = $props.id();
	const id = $derived(_id || uid);

	if (min > max) {
		[min, max] = [max, min];
	}
	if (value > max) {
		max = value;
	}

	function strip(input: number) {
		return +parseFloat(input + '').toPrecision(2);
	}

	let inputEl = $state() as HTMLInputElement;

	let prev = -1;
	function update() {
		if (prev === value) return;
		if (value.toString().length > 5) {
			value = strip(value);
		}
		prev = value;
	}

	function handleChange(change: number) {
		value = Math.max(min ?? -Infinity, Math.min(+value + change, max ?? Infinity));
	}

	function handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Escape' || ev.key === 'Enter') {
			inputEl?.blur();
		}
	}

	$effect(() => {
		update();
	});

	let ratio = $derived(((value - min) / (max - min)) * 100);
</script>

<div>
	<div class="component-wrapper">
		<button onclick={() => handleChange(-step)}>-</button>
		<input
			bind:value
			bind:this={inputEl}
			{id}
			{step}
			{max}
			{min}
			type="number"
			onkeydown={handleKeyDown}
		/>
		<button onclick={() => handleChange(+step)}>+</button>
	</div>
	<div class="slider">
		<input
			type="range"
			bind:value
			{min}
			{max}
			{step}
			style={`background: linear-gradient(90deg, var(--text-color) ${ratio}%, var(--layer-2, #4b4b4b) ${ratio}%)`}
		/>
	</div>
</div>

<style>
	:root {
		--slider-height: 4px;
	}

	.component-wrapper {
		display: flex;
		background-color: var(--layer-2, #4b4b4b);
		user-select: none;
		transition: box-shadow 0.3s ease;
		border: solid 1px var(--outline);
		overflow: hidden;
		border-radius: 0 var(--border-radius, 2px); /* only top */
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	input[type='number'] {
		-webkit-appearance: textfield;
		-moz-appearance: textfield;
		appearance: textfield;
		cursor: pointer;
		font-family: var(--font-family);
		font-variant-numeric: tabular-nums;
		color: var(--text-color);
		background-color: transparent;
		padding: var(--padding, 6px);
		font-size: 1em;
		padding-inline: 10px;
		text-align: center;
		border: none;
		border-style: none;
		flex: 1;
		width: 72%;
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

	.slider {
		position: relative;
		margin-top: -1px; /* hide edge */
	}

	input[type='range'] {
		position: absolute;
		appearance: none;
		width: 100%;
		height: var(--slider-height);
		background: var(--layer-2, #4b4b4b);
		cursor: pointer;
	}

	/* Thumb: for Chrome, Safari, Edge */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: var(--slider-height);
		background: var(--text-color);
		box-shadow: none;
	}

	/* Thumb: for Firefox */
	input[type='range']::-moz-range-thumb {
		border: none;
		width: 12px;
		height: var(--slider-height);
		background: var(--text-color);
		box-shadow: none;
	}
</style>
