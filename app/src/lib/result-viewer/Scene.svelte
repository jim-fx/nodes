<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import {
    MeshLineGeometry,
    MeshLineMaterial,
    Text,
    useTexture,
  } from "@threlte/extras";
  import {
    type Group,
    type BufferGeometry,
    type PerspectiveCamera,
    Vector3,
    type Vector3Tuple,
    Box3,
  } from "three";
  import type { OrbitControls as OrbitControlsType } from "three/addons/controls/OrbitControls.js";
  import { OrbitControls } from "@threlte/extras";
  import { AppSettings } from "../settings/app-settings";
  import localStore from "$lib/helpers/localStore";

  export let geometries: BufferGeometry[];
  export let lines: Vector3[][];
  let geos: Group;

  let camera: PerspectiveCamera;
  let controls: OrbitControlsType;
  export let centerCamera: boolean = true;

  const matcap = useTexture("/matcap_green.jpg");

  const cameraTransform = localStore<{
    camera: Vector3Tuple;
    target: Vector3Tuple;
  }>("nodes.camera.transform", {
    camera: [0, 0, 10],
    target: [0, 0, 0],
  });

  function saveCameraState() {
    if (!camera) return;
    $cameraTransform = {
      camera: camera.position.toArray(),
      target: controls.target.toArray(),
    };
  }

  function getPosition(geo: BufferGeometry, i: number) {
    return [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ] as Vector3Tuple;
  }

  let cameraTarget: Vector3;
  let duration = 0;
  let totalDuration = 5;
  const { start, stop, started } = useTask((delta) => {
    duration += delta;
    if (!cameraTarget) {
      stop();
      return;
    }
    // This function will be executed on every frame
    if (duration >= totalDuration) {
      controls.target.copy(cameraTarget);
      stop();
      controls.update();
    } else {
      const t = duration / totalDuration;
      controls.target.lerp(cameraTarget, t);
      controls.update();
    }
  });
  stop();

  $: if (geometries && geos && centerCamera) {
    const aabb = new Box3();
    aabb.setFromObject(geos);
    const newCenter = aabb.getCenter(new Vector3());
    if (
      newCenter &&
      newCenter.x !== 0 &&
      newCenter.y !== 0 &&
      newCenter.z !== 0
    ) {
      cameraTarget = newCenter;
      duration = 0;
      start();
    }
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
<T.AmbientLight intensity={2} />

<T.Group bind:ref={geos}>
  {#each geometries as geo}
    {#if $AppSettings.showIndices}
      {#each geo.attributes.position.array as _, i}
        {#if i % 3 === 0}
          <Text fontSize={0.25} position={getPosition(geo, i)} />
        {/if}
      {/each}
    {/if}

    {#if $AppSettings.showVertices}
      <T.Points visible={true}>
        <T is={geo} />
        <T.PointsMaterial size={0.25} />
      </T.Points>
    {/if}
    {#await matcap then value}
      <T.Mesh geometry={geo}>
        <T.MeshMatcapMaterial
          matcap={value}
          wireframe={$AppSettings.wireframe}
        />
      </T.Mesh>
    {/await}
  {/each}
</T.Group>

{#if $AppSettings.showStemLines && lines}
  {#each lines as line}
    <T.Mesh>
      <MeshLineGeometry points={line} />
      <MeshLineMaterial width={0.1} color="red" depthTest={false} />
    </T.Mesh>
  {/each}
{/if}
