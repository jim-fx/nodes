<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { MeshLineGeometry, MeshLineMaterial, Text } from "@threlte/extras";
  import {
    type Group,
    type BufferGeometry,
    Vector3,
    type Vector3Tuple,
    Box3,
  } from "three";
  import { AppSettings } from "../settings/app-settings";
  import Camera from "./Camera.svelte";

  const d = useThrelte();

  export const invalidate = d.invalidate;

  export let geometries: BufferGeometry[];
  export let lines: Vector3[][];
  export let scene;
  let geos: Group;
  $: scene = geos;
  export let geoGroup: Group;

  export let centerCamera: boolean = true;
  let center = new Vector3(0, 4, 0);

  function getPosition(geo: BufferGeometry, i: number) {
    return [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ] as Vector3Tuple;
  }

  $: if (geometries && geos && centerCamera) {
    const aabb = new Box3().setFromObject(geos);
    center = aabb
      .getCenter(new Vector3())
      .max(new Vector3(-4, -4, -4))
      .min(new Vector3(4, 4, 4));
  }
</script>

<Camera {center} {centerCamera} />

{#if $AppSettings.showGrid}
  <T.GridHelper args={[20, 20]} />
{/if}

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
  {/each}

  <T.Group bind:ref={geoGroup}></T.Group>
</T.Group>

{#if $AppSettings.showStemLines && lines}
  {#each lines as line}
    <T.Mesh>
      <MeshLineGeometry points={line} />
      <MeshLineMaterial width={0.1} color="red" depthTest={false} />
    </T.Mesh>
  {/each}
{/if}
