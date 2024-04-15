<script lang="ts">
	import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
	import { points, lines } from './store.js';
	import { T } from '@threlte/core';
</script>

{#each $points as point}
	<T.Mesh position.x={point.x} position.y={point.y} position.z={point.z} rotation.x={-Math.PI / 2}>
		<T.CircleGeometry args={[0.2, 32]} />
		<T.MeshBasicMaterial color="red" />
	</T.Mesh>
{/each}

{#each $lines as line}
	<T.Mesh>
		<MeshLineGeometry points={line} />
		<MeshLineMaterial color="red" linewidth={1} attenuate={false} />
	</T.Mesh>
{/each}
