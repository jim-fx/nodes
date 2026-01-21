<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import {
    Grid,
    MeshLineGeometry,
    MeshLineMaterial,
    Text,
  } from "@threlte/extras";
  import {
    type Group,
    type BufferGeometry,
    Vector3,
    type Vector3Tuple,
    Box3,
    Mesh,
    MeshBasicMaterial,
  } from "three";
  import { appSettings } from "../settings/app-settings.svelte";
  import Camera from "./Camera.svelte";
  import { colors } from "$lib/graph-interface/graph/colors.svelte";

  const { renderStage, invalidate: _invalidate } = useThrelte();

  type Props = {
    fps: number[];
    lines: Vector3[][];
    scene: Group;
    centerCamera: boolean;
  };

  let {
    lines,
    centerCamera,
    fps = $bindable(),
    scene = $bindable(),
  }: Props = $props();

  let geometries = $state.raw<BufferGeometry[]>([]);
  let center = $state(new Vector3(0, 4, 0));

  useTask(
    (delta) => {
      fps.push(1 / delta);
      fps = fps.slice(-100);
    },
    { stage: renderStage, autoInvalidate: false },
  );

  export const invalidate = function () {
    if (scene) {
      const geos: BufferGeometry[] = [];
      scene.traverse(function (child) {
        if (isMesh(child)) {
          geos.push(child.geometry);
        }
      });
      geometries = geos;
    }

    if (geometries && scene && centerCamera) {
      const aabb = new Box3().setFromObject(scene);
      center = aabb
        .getCenter(new Vector3())
        .max(new Vector3(-4, -4, -4))
        .min(new Vector3(4, 4, 4));
    }
    _invalidate();
  };

  function isMesh(child: Mesh | any): child is Mesh {
    return child.isObject3D && "material" in child;
  }

  function isMatCapMaterial(material: any): material is MeshBasicMaterial {
    return material.isMaterial && "matcap" in material;
  }

  $effect(() => {
    const wireframe = appSettings.value.debug.wireframe;
    scene.traverse(function (child) {
      if (isMesh(child) && isMatCapMaterial(child.material) && child.visible) {
        child.material.wireframe = wireframe;
      }
    });
    _invalidate();
  });

  function getPosition(geo: BufferGeometry, i: number) {
    return [
      geo.attributes.position.array[i],
      geo.attributes.position.array[i + 1],
      geo.attributes.position.array[i + 2],
    ] as Vector3Tuple;
  }
</script>

<Camera {center} {centerCamera} />

{#if appSettings.value.showGrid}
  <Grid
    cellColor={colors["outline"]}
    cellThickness={0.7}
    infiniteGrid
    sectionThickness={0.7}
    sectionDistance={2}
    sectionColor={colors["outline"]}
    fadeDistance={50}
    fadeStrength={10}
    fadeOrigin={new Vector3(0, 0, 0)}
  />
{/if}

<T.Group>
  {#if geometries}
    {#each geometries as geo}
      {#if appSettings.value.debug.showIndices}
        {#each geo.attributes.position.array as _, i}
          {#if i % 3 === 0}
            <Text fontSize={0.25} position={getPosition(geo, i)} />
          {/if}
        {/each}
      {/if}

      {#if appSettings.value.debug.showVertices}
        <T.Points visible={true}>
          <T is={geo} />
          <T.PointsMaterial size={0.25} />
        </T.Points>
      {/if}
    {/each}
  {/if}

  <T.Group bind:ref={scene}></T.Group>
</T.Group>

{#if appSettings.value.debug.showStemLines && lines}
  {#each lines as line}
    <T.Mesh>
      <MeshLineGeometry points={line} />
      <MeshLineMaterial width={0.1} color="red" depthTest={false} />
    </T.Mesh>
  {/each}
{/if}
