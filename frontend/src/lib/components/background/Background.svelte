<script lang="ts">
  import { T } from "@threlte/core";
  import { onMount } from "svelte";

  import BackgroundVert from "./Background.vert";
  import BackgroundFrag from "./Background.frag";

  export let minZoom = 4;
  export let maxZoom = 150;

  export let cx = 0;
  export let cy = 0;
  export let cz = 30;

  export let width = globalThis?.innerWidth || 100;
  export let height = globalThis?.innerHeight || 100;

  let bw = 2;
  let bh = 2;

  $: if (width && height) {
    bw = width / cz;
    bh = height / cz;
  }
</script>

<T.Group position.x={cx} position.z={cy} position.y={-1.0}>
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
      uniforms.cx.value={cx}
      uniforms.cy.value={cy}
      uniforms.cz.value={cz}
      uniforms.width.value={width}
      uniforms.height.value={height}
    />
  </T.Mesh>
</T.Group>
