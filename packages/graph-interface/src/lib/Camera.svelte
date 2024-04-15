<script lang="ts">
	import { T } from '@threlte/core';
	import { type OrthographicCamera } from 'three';

	export let camera: OrthographicCamera | undefined = undefined;

	export let position: [number, number, number];
</script>

<T.OrthographicCamera
	bind:ref={camera}
	position.x={position[0]}
	position.y={10}
	position.z={position[1]}
	rotation.x={-Math.PI / 2}
	zoom={position[2]}
	makeDefault
/>
