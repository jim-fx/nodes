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

<T.PerspectiveCamera position={[-10, 10, 10]} makeDefault fov={50}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} />

{#each geometry as geo}
  {#each geo.attributes.position.array as attr, i}
    {#if i % 3 === 0}
      <Text text={i / 3} fontSize={1} position={getPosition(geo, i)} />
    {/if}
  {/each}

  <T.Points visible={true}>
    <T is={geo} />
    <T.PointsMaterial size={0.25} />
  </T.Points>
  <T.Mesh geometry={geo}>
    <T.MeshBasicMaterial color="red" />
  </T.Mesh>
{:else}
  <T.Mesh>
    <T.BoxGeometry args={[1, 1, 1]} />
    <T.MeshStandardMaterial color="hotpink" />
  </T.Mesh>
{/each}
