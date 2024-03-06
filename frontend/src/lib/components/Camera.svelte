<script lang="ts">
  import { T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";
  import { onMount } from "svelte";
  import { type OrthographicCamera } from "three";

  export let camera: OrthographicCamera | undefined = undefined;
  export let maxZoom = 150;
  export let minZoom = 4;

  let controls: OrbitControls | undefined = undefined;

  export const position: [number, number, number] = [0, 1, 0];

  function updateProps() {
    if (!camera) return;
    position[0] = camera.position.x;
    position[1] = camera.position.z;
    position[2] = camera.zoom;
  }

  onMount(() => {
    updateProps();
    controls?.addEventListener("change", updateProps);
    return () => {
      controls?.removeEventListener("change", updateProps);
    };
  });
</script>

<T.OrthographicCamera
  bind:ref={camera}
  makeDefault
  position.y={1}
  zoom={30}
  on:create={({ ref, cleanup }) => {
    ref.onBeforeRender = () => {
      console.log(ref.position);
    };

    cleanup(() => {});
  }}
>
  <OrbitControls
    bind:ref={controls}
    enableZoom={true}
    target.y={0}
    rotateSpeed={0}
    minPolarAngle={0}
    maxPolarAngle={0}
    enablePan={true}
    zoomToCursor
    {maxZoom}
    {minZoom}
  />
</T.OrthographicCamera>
