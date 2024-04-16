<script lang="ts">
  import { T } from "@threlte/core";
  import type { BufferGeometry } from "three";
  import { OrbitControls } from "@threlte/extras";

  export let geometry: BufferGeometry[];
</script>

<T.PerspectiveCamera position={[10, 10, 10]} makeDefault fov={50}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} />

{#each geometry as geo}
  <T.Mesh geometry={geo}>
    <T.MeshBasicMaterial color="red" />
  </T.Mesh>
{:else}
  <T.Mesh>
    <T.BoxGeometry args={[1, 1, 1]} />
    <T.MeshStandardMaterial color="hotpink" />
  </T.Mesh>
{/each}
