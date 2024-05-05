<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { MeshLineGeometry, MeshLineMaterial, Text } from "@threlte/extras";
  import {
    type Group,
    type BufferGeometry,
    Vector3,
    type Vector3Tuple,
    Box3,
    Mesh,
    MeshMatcapMaterial,
    MeshBasicMaterial,
  } from "three";
  import { AppSettings } from "../settings/app-settings";
  import Camera from "./Camera.svelte";

  const threlte = useThrelte();

  export let fps: number[] = [];
  let renderer = threlte.renderer;
  let rendererRender = renderer.render;
  renderer.render = function (scene, camera) {
    const a = performance.now();
    rendererRender.call(renderer, scene, camera);
    fps.push(performance.now() - a);
    fps = fps.slice(-100);
  };

  export const invalidate = function () {
    if (scene) {
      geometries = scene.children
        .filter(
          (child) => "geometry" in child && child.isObject3D && child.geometry,
        )
        .map((child) => {
          return child.geometry;
        });
    }

    if (geometries && scene && centerCamera) {
      const aabb = new Box3().setFromObject(scene);
      center = aabb
        .getCenter(new Vector3())
        .max(new Vector3(-4, -4, -4))
        .min(new Vector3(4, 4, 4));
    }
    threlte.invalidate();
  };

  let geometries: BufferGeometry[] = [];
  export let lines: Vector3[][];
  export let scene: Group;

  export let centerCamera: boolean = true;
  let center = new Vector3(0, 4, 0);

  function isMesh(child: Mesh | any): child is Mesh {
    return child.isObject3D && "material" in child;
  }

  function isMatCapMaterial(material: any): material is MeshBasicMaterial {
    return material.isMaterial && "matcap" in material;
  }

  $: if ($AppSettings && scene) {
    scene.traverse(function (child) {
      if (isMesh(child) && isMatCapMaterial(child.material)) {
        child.material.wireframe = $AppSettings.wireframe;
      }
    });
    threlte.invalidate();
  }

  function getPosition(geo: BufferGeometry, i: number) {
    return [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ] as Vector3Tuple;
  }
</script>

<Camera {center} {centerCamera} />

{#if $AppSettings.showGrid}
  <T.GridHelper args={[20, 20]} />
{/if}

<T.Group>
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

  <T.Group bind:ref={scene}></T.Group>
</T.Group>

{#if $AppSettings.showStemLines && lines}
  {#each lines as line}
    <T.Mesh>
      <MeshLineGeometry points={line} />
      <MeshLineMaterial width={0.1} color="red" depthTest={false} />
    </T.Mesh>
  {/each}
{/if}
