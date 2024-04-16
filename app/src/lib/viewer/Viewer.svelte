<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import { BufferGeometry, Float32BufferAttribute } from "three";
  import { decodeFloat } from "$lib/helpers/encode";

  export let result: Int32Array;

  let geometries: BufferGeometry[] = [];

  function createGeometryFromEncodedData(
    encodedData: Int32Array,
  ): BufferGeometry {
    const geometry = new BufferGeometry();

    // Extract data from the encoded array
    let index = 0;
    const geometryType = encodedData[index++];
    const vertexCount = encodedData[index++];
    const faceCount = encodedData[index++];

    // Indices
    const indices: number[] = [];
    for (let i = 0; i < faceCount * 3; i++) {
      indices.push(encodedData[index++]);
    }

    // Face normals (although typically there would be one normal per vertex)
    const normals: number[] = [];
    for (let i = 0; i < faceCount; i++) {
      const x = decodeFloat(encodedData[index++]);
      const y = decodeFloat(encodedData[index++]);
      const z = decodeFloat(encodedData[index++]);
      normals.push(x, y, z);
    }

    // Vertices
    const vertices: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const x = decodeFloat(encodedData[index++]);
      const y = decodeFloat(encodedData[index++]);
      const z = decodeFloat(encodedData[index++]);
      vertices.push(x, y, z);
    }

    // Add data to geometry
    geometry.setIndex(indices);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));

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

  $: if (result) {
    const inputs = parse_args(result);

    console.log({ inputs });

    for (let input of inputs) {
      if (input[0] === 1) {
        const geo = createGeometryFromEncodedData(input);
        geometries = [geo];
        console.log(geo);
      }
    }
  }
</script>

<Canvas>
  <Scene geometry={geometries} />
</Canvas>

<style>
</style>
