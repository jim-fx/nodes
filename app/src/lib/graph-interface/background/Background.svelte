<script lang="ts">
	import { T } from '@threlte/core';

	import BackgroundVert from './Background.vert';
	import BackgroundFrag from './Background.frag';
	import { colors } from '../graph/stores.js';

	export let minZoom = 4;
	export let maxZoom = 150;

	export let cameraPosition: [number, number, number] = [0, 1, 0];

	export let width = globalThis?.innerWidth || 100;
	export let height = globalThis?.innerHeight || 100;

	let bw = 2;
	let bh = 2;

	$: if (width && height) {
		bw = width / cameraPosition[2];
		bh = height / cameraPosition[2];
	}
</script>

<T.Group position.x={cameraPosition[0]} position.z={cameraPosition[1]} position.y={-1.0}>
	<T.Mesh rotation.x={-Math.PI / 2} position.y={0.2} scale.x={bw} scale.y={bh}>
		<T.PlaneGeometry args={[1, 1]} />
		<T.ShaderMaterial
			transparent
			vertexShader={BackgroundVert}
			fragmentShader={BackgroundFrag}
			uniforms={{
				camPos: {
					value: [0, 1, 0]
				},
				backgroundColor: {
					value: [0, 0, 0]
				},
				zoomLimits: {
					value: [2, 50]
				},
				dimensions: {
					value: [100, 100]
				}
			}}
			uniforms.camPos.value={cameraPosition}
			uniforms.backgroundColor.value={$colors.backgroundColorDarker}
			uniforms.zoomLimits.value={[minZoom, maxZoom]}
			uniforms.dimensions.value={[width, height]}
		/>
	</T.Mesh>
</T.Group>
