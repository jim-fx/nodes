<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
  import { decodeFloat } from "@nodes/utils";
  import type { PerformanceStore } from "$lib/performance";

  export let result: Int32Array;

  export let centerCamera: boolean = true;
  export let perf: PerformanceStore;

  let geometries: BufferGeometry[] = [];
  let lines: Vector3[][] = [];

  let totalVertices = 0;
  let totalFaces = 0;

  function createGeometryFromEncodedData(
    encodedData: Int32Array,
    geometry = new BufferGeometry(),
  ): BufferGeometry {
    // Extract data from the encoded array
    let index = 0;
    const geometryType = encodedData[index++];
    const vertexCount = encodedData[index++];
    const faceCount = encodedData[index++];

    totalVertices += vertexCount;
    totalFaces += faceCount;

    // Indices
    const indicesEnd = index + faceCount * 3;
    const indices = encodedData.subarray(index, indicesEnd);
    index = indicesEnd;

    // Vertices
    const vertices = new Float32Array(
      encodedData.buffer,
      index * 4,
      vertexCount * 3,
    );
    index = index + vertexCount * 3;

    const normals = new Float32Array(
      encodedData.buffer,
      index * 4,
      vertexCount * 3,
    );
    index = index + vertexCount * 3;

    // Add data to geometry
    geometry.setIndex([...indices]);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  function parse_args(input: Int32Array) {
    let index = 0;
    const length = input.length;
    let res: Int32Array[] = [];

    let nextBracketIndex = 0;
    let argStartIndex = 0;
    let depth = -1;

    while (index < length) {
      const value = input[index];

      if (index === nextBracketIndex) {
        nextBracketIndex = index + input[index + 1] + 1;
        if (value === 0) {
          depth++;
        } else {
          depth--;
        }

        if (depth === 1 && value === 0) {
          // if opening bracket
          argStartIndex = index + 2;
        }

        if (depth === 0 && value === 1) {
          // if closing bracket
          res.push(input.slice(argStartIndex, index));
          argStartIndex = index + 2;
        }

        index = nextBracketIndex;
        continue;
      }

      // we should not be here

      index++;
    }

    return res;
  }

  function createLineGeometryFromEncodedData(encodedData: Int32Array) {
    const positions: Vector3[] = [];

    const amount = (encodedData.length - 1) / 4;

    for (let i = 0; i < amount; i++) {
      const x = decodeFloat(encodedData[1 + i * 4 + 0]);
      const y = decodeFloat(encodedData[1 + i * 4 + 1]);
      const z = decodeFloat(encodedData[1 + i * 4 + 2]);
      positions.push(new Vector3(x, y, z));
    }

    return positions;
  }

  $: if (result) {
    perf?.startRun();

    let a = performance.now();
    const inputs = parse_args(result);
    let b = performance.now();
    perf?.addPoint("parse-args", b - a);

    totalVertices = 0;
    totalFaces = 0;

    a = performance.now();
    lines = inputs
      .map((input) => {
        if (input[0] === 0) {
          return createLineGeometryFromEncodedData(input);
        }
      })
      .filter(Boolean) as Vector3[][];
    b = performance.now();
    perf?.addPoint("create-lines", b - a);

    a = performance.now();
    geometries = inputs
      .map((input, i) => {
        if (input[0] === 1) {
          return createGeometryFromEncodedData(input, geometries[i]);
        }
      })
      .filter(Boolean) as BufferGeometry[];
    b = performance.now();
    perf?.addPoint("create-geometries", b - a);

    perf?.addPoint("total-vertices", totalVertices);
    perf?.addPoint("total-faces", totalFaces);

    perf?.stopRun();
  }
</script>

<Canvas>
  <Scene {geometries} {lines} {centerCamera} />
</Canvas>
