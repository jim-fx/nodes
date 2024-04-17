<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
  } from "three";
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
    const indices = encodedData.subarray(index, index + faceCount * 3);
    index = index + faceCount * 3;

    const normals = new Float32Array(
      encodedData.buffer,
      index * 4,
      faceCount * 3,
    );
    index = index + faceCount * 3;

    // Vertices
    const vertices = new Float32Array(
      encodedData.buffer,
      index * 4,
      vertexCount * 3,
    );

    // Add data to geometry
    geometry.setIndex([...indices]);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    // geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
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

  $: if (result) {
    const inputs = parse_args(result);

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
