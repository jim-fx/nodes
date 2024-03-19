<script lang="ts">
  import { T } from "@threlte/core";
  import { type OrthographicCamera } from "three";

  export let camera: OrthographicCamera | undefined = undefined;

  export let position: [number, number, number] = [0, 0, 4];
</script>

<T.OrthographicCamera
  bind:ref={camera}
  position.x={0}
  position.y={10}
  position.z={0}
  rotation.x={-Math.PI / 2}
  zoom={position[2]}
  makeDefault
/>
