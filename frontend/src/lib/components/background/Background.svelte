<script lang="ts">
  import { T } from "@threlte/core";
  import { onMount } from "svelte";

  import BackgroundVert from "./Background.vert";
  import BackgroundFrag from "./Background.frag";

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

<T.Group
  position.x={cameraPosition[0]}
  position.z={cameraPosition[1]}
  position.y={-1.0}
>
  <T.Mesh rotation.x={-Math.PI / 2} position.y={0.2} scale.x={bw} scale.y={bh}>
    <T.PlaneGeometry args={[1, 1]} />
    <T.ShaderMaterial
      transparent
      vertexShader={BackgroundVert}
      fragmentShader={BackgroundFrag}
      uniforms={{
        cx: {
          value: 0,
        },
        cy: {
          value: 0,
        },
        cz: {
          value: 30,
        },
        minZ: {
          value: minZoom,
        },
        maxZ: {
          value: maxZoom,
        },
        height: {
          value: 100,
        },
        width: {
          value: 100,
        },
      }}
      uniforms.cx.value={cameraPosition[0]}
      uniforms.cy.value={cameraPosition[1]}
      uniforms.cz.value={cameraPosition[2]}
      uniforms.width.value={width}
      uniforms.height.value={height}
    />
  </T.Mesh>
</T.Group>
