<script lang="ts">
  import { T } from "@threlte/core";
  import { Text } from "@threlte/extras";
  import type { BufferGeometry } from "three";
  import { OrbitControls } from "@threlte/extras";

  export let geometry: BufferGeometry[];

  function getPosition(geo: BufferGeometry, i: number) {
    const pos = [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ];
    return pos;
  }
</script>

<T.GridHelper args={[20, 20]} />

<T.PerspectiveCamera position={[-10, 10, 10]} makeDefault fov={50}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} />
<T.AmbientLight intensity={0.5} />

{#each geometry as geo}
  {#if false}
    {#each geo.attributes.position.array as _, i}
      {#if i % 3 === 0}
        <Text text={i / 3} fontSize={0.25} position={getPosition(geo, i)} />
      {/if}
    {/each}

    <T.Points visible={true}>
      <T is={geo} />
      <T.PointsMaterial size={0.25} />
    </T.Points>
  {/if}
  <T.Mesh geometry={geo}>
    <T.MeshStandardMaterial color="green" />
  </T.Mesh>
{/each}
