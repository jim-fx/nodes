<script lang="ts">
  import { T } from "@threlte/core";
  import { MeshLineGeometry, MeshLineMaterial, Text } from "@threlte/extras";
  import type { BufferGeometry, PerspectiveCamera, Vector3 } from "three";
  import type { OrbitControls as OrbitControlsType } from "three/addons/controls/OrbitControls.js";
  import { OrbitControls } from "@threlte/extras";
  import { AppSettings } from "../settings/app-settings";
  import localStore from "$lib/helpers/localStore";
  import { Inspector } from "three-inspect";

  export let geometries: BufferGeometry[];
  export let lines: Vector3[][];

  export let camera: PerspectiveCamera;
  export let controls: OrbitControlsType;

  const cameraTransform = localStore<{ camera: number[]; target: number[] }>(
    "nodes.camera.transform",
    {
      camera: [0, 0, 10],
      target: [0, 0, 0],
    },
  );

  function saveCameraState() {
    if (!camera) return;
    $cameraTransform = {
      camera: camera.position.toArray(),
      target: controls.target.toArray(),
    };
  }

  function getPosition(geo: BufferGeometry, i: number) {
    const pos = [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ];
    return pos;
  }
</script>

{#if $AppSettings.showGrid}
  <T.GridHelper args={[20, 20]} />
{/if}

<T.PerspectiveCamera
  bind:ref={camera}
  position={$cameraTransform.camera}
  makeDefault
  fov={50}
>
  <OrbitControls
    bind:ref={controls}
    on:change={saveCameraState}
    target={$cameraTransform.target}
  />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} />
<T.AmbientLight intensity={0.5} />

{#each geometries as geo}
  {#if $AppSettings.showIndices}
    {#each geo.attributes.position.array as _, i}
      {#if i % 3 === 0}
        <Text text={i / 3} fontSize={0.25} position={getPosition(geo, i)} />
      {/if}
    {/each}
  {/if}

  {#if $AppSettings.showVertices}
    <T.Points visible={true}>
      <T is={geo} />
      <T.PointsMaterial size={0.25} />
    </T.Points>
  {/if}
  <T.Mesh geometry={geo}>
    <T.MeshStandardMaterial
      color="green"
      depthTest={true}
      wireframe={$AppSettings.wireframe}
    />
  </T.Mesh>
{/each}

{#if $AppSettings.showStemLines && lines}
  {#each lines as line}
    <T.Mesh>
      <MeshLineGeometry points={line} />
      <MeshLineMaterial width={0.1} color="red" depthTest={false} />
    </T.Mesh>
  {/each}
{/if}
