import { fastHashArrayBuffer } from "@nodes/utils";
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Mesh, MeshMatcapMaterial, TextureLoader, type Group } from "three";

function fastArrayHash(arr: ArrayBuffer) {
  let ints = new Uint8Array(arr);

  const sampleDistance = Math.max(Math.floor(ints.length / 100), 1);
  const sampleCount = Math.floor(ints.length / sampleDistance);

  let hash = new Uint8Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const index = i * sampleDistance;
    hash[i] = ints[index];
  }

  return fastHashArrayBuffer(hash.buffer);
}

const loader = new TextureLoader();
const matcap = loader.load('/matcap_green.jpg');
matcap.colorSpace = "srgb";
const material = new MeshMatcapMaterial({
  color: 0xffffff,
  matcap
});

function createGeometryFromEncodedData(
  encodedData: Int32Array,
  geometry = new BufferGeometry(),
): BufferGeometry {
  // Extract data from the encoded array
  let index = 1;
  // const geometryType = encodedData[index++];
  const vertexCount = encodedData[index++];
  const faceCount = encodedData[index++];

  let hash = fastArrayHash(encodedData);

  if (geometry.userData?.hash === hash) {
    return geometry;
  }

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

  let posAttribute = geometry.getAttribute(
    "position",
  ) as BufferAttribute | null;

  if (posAttribute && posAttribute.count === vertexCount) {
    posAttribute.set(vertices, 0);
    posAttribute.needsUpdate = true;
  } else {
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(vertices, 3),
    );
  }

  const normals = new Float32Array(
    encodedData.buffer,
    index * 4,
    vertexCount * 3,
  );
  index = index + vertexCount * 3;

  if (
    geometry.userData?.faceCount !== faceCount ||
    geometry.userData?.vertexCount !== vertexCount
  ) {
    // Add data to geometry
    geometry.setIndex([...indices]);
  }

  const normalsAttribute = geometry.getAttribute(
    "normal",
  ) as BufferAttribute | null;
  if (normalsAttribute && normalsAttribute.count === vertexCount) {
    normalsAttribute.set(normals, 0);
    normalsAttribute.needsUpdate = true;
  } else {
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  }

  geometry.userData = {
    vertexCount,
    faceCount,
    hash,
  };

  return geometry;
}

let meshes: Mesh[] = [];


export function updateGeometries(inputs: Int32Array[], group: Group) {
  let totalVertices = 0;
  let totalFaces = 0;
  let newGeometries = [];

  for (let i = 0; i < Math.max(meshes.length, inputs.length); i++) {
    let existingMesh = meshes[i];
    let input = inputs[i];

    if (input) {
      if (input[0] !== 1) {
        continue
      }
      totalVertices += input[1];
      totalFaces += input[2];
    } else {
      if (existingMesh) {
        existingMesh.visible = false;
      }
      continue;
    }

    if (existingMesh) {
      createGeometryFromEncodedData(input, existingMesh.geometry);
    } else {
      let geo = createGeometryFromEncodedData(input);
      const mesh = new Mesh(geo, material);
      meshes[i] = mesh;
      newGeometries.push(mesh);
    }

  }

  for (let i = 0; i < newGeometries.length; i++) {
    group.add(newGeometries[i]);
  }

  return { totalFaces, totalVertices };
}
