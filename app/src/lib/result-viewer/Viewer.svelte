<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import { Group, Vector3 } from "three";

  import { updateGeometries } from "./updateGeometries";
  import { decodeFloat, splitNestedArray } from "@nodes/utils";
  import type { PerformanceStore } from "@nodes/utils";
  import { AppSettings } from "$lib/settings/app-settings";
  import SmallPerformanceViewer from "$lib/performance/SmallPerformanceViewer.svelte";

  export let centerCamera: boolean = true;
  export let perf: PerformanceStore;
  export let scene: Group;
  let fps: number[] = [];

  let lines: Vector3[][] = [];

  let invalidate: () => void;

  function createLineGeometryFromEncodedData(encodedData: Int32Array) {
    const positions: Vector3[] = [];

    const amount = (encodedData.length - 1) / 4;

    for (let i = 0; i < amount; i++) {
      const x = decodeFloat(encodedData[2 + i * 4 + 0]);
      const y = decodeFloat(encodedData[2 + i * 4 + 1]);
      const z = decodeFloat(encodedData[2 + i * 4 + 2]);
      positions.push(new Vector3(x, y, z));
    }

    return positions;
  }

  export const update = function update(result: Int32Array) {
    perf?.addPoint("split-result");
    const inputs = splitNestedArray(result);
    perf?.endPoint();

    if ($AppSettings.showStemLines) {
      perf?.addPoint("create-lines");
      lines = inputs
        .map((input) => {
          if (input[0] === 0) {
            return createLineGeometryFromEncodedData(input);
          }
        })
        .filter(Boolean) as Vector3[][];
      perf.endPoint();
    }

    perf?.addPoint("update-geometries");

    const { totalVertices, totalFaces } = updateGeometries(inputs, scene);
    perf?.endPoint();

    perf?.addPoint("total-vertices", totalVertices);
    perf?.addPoint("total-faces", totalFaces);
    invalidate();
  };
</script>

{#if $AppSettings.showPerformancePanel}
  <SmallPerformanceViewer {fps} store={perf} />
{/if}

<Canvas>
  <Scene bind:scene bind:invalidate {lines} {centerCamera} bind:fps />
</Canvas>
