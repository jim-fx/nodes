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

    saveControls();
  }

  const loadControls = () => {
    if (!controls) return;
    const stateJSON = localStorage.getItem(`orbitControls`);

    if (stateJSON) {
      const { target0, position0, zoom0 } = JSON.parse(stateJSON);
      controls.target0.copy(target0);
      controls.position0.copy(position0);
      controls.zoom0 = zoom0;
      controls.reset();
    }
  };

  const saveControls = () => {
    if (!controls) return;
    controls.saveState();
    const { target0, position0, zoom0 } = controls;
    const state = { target0, position0, zoom0 };
    localStorage.setItem(`orbitControls`, JSON.stringify(state));
  };

  onMount(() => {
    loadControls();
    updateProps();
    controls?.addEventListener("change", updateProps);
    return () => {
      controls?.removeEventListener("change", updateProps);
    };
  });
</script>

<T.OrthographicCamera bind:ref={camera} position.y={1} makeDefault>
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
