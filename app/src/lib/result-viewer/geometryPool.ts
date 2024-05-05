import { fastHashArrayBuffer } from "@nodes/utils";
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Group, InstancedMesh, Material, Matrix4, Mesh } from "three"


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

export function createGeometryPool(parentScene: Group, material: Material) {
  const scene = new Group();
  parentScene.add(scene);

  let meshes: Mesh[] = [];

  function updateSingleGeometry(data: Int32Array, existingMesh: Mesh | null = null) {

    let hash = fastArrayHash(data);

    let geometry = existingMesh ? existingMesh.geometry : new BufferGeometry();

    // Extract data from the encoded array
    // const geometryType = encodedData[index++];
    let index = 1;
    const vertexCount = data[index++];
    const faceCount = data[index++];

    if (geometry.userData?.hash === hash) {
      return;
    }

    // Indices
    const indicesEnd = index + faceCount * 3;
    const indices = data.subarray(index, indicesEnd);
    index = indicesEnd;

    // Vertices
    const vertices = new Float32Array(
      data.buffer,
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
      data.buffer,
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

    if (!existingMesh) {
      const mesh = new Mesh(geometry, material);
      scene.add(mesh);
      meshes.push(mesh);
    }

  }


  return {
    update(
      newData: Int32Array[],
    ) {
      for (let i = 0; i < Math.max(newData.length, meshes.length); i++) {
        const existingMesh = meshes[i];
        let input = newData[i];
        if (input) {
          updateSingleGeometry(input, existingMesh || null);
        } else if (existingMesh) {
          existingMesh.visible = false;
          scene.remove(existingMesh);
        }
      }
    }
  }
}

export function createInstancedGeometryPool(parentScene: Group, material: Material) {
  const scene = new Group();
  parentScene.add(scene);

  const instances: InstancedMesh[] = [];

  function updateSingleInstance(data: Int32Array, existingInstance: InstancedMesh | null = null) {

    let hash = fastArrayHash(data);

    let geometry = existingInstance ? existingInstance.geometry : new BufferGeometry();

    // Extract data from the encoded array
    let index = 0;
    const geometryType = data[index++];
    const vertexCount = data[index++];
    const faceCount = data[index++];
    const instanceCount = data[index++];
    const stemDepth = data[index++];

    // Indices
    const indicesEnd = index + faceCount * 3;
    const indices = data.subarray(index, indicesEnd);
    index = indicesEnd;
    if (
      geometry.userData?.faceCount !== faceCount ||
      geometry.userData?.vertexCount !== vertexCount
    ) {
      // Add data to geometry
      geometry.setIndex([...indices]);
    }

    // Vertices
    const vertices = new Float32Array(
      data.buffer,
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
      data.buffer,
      index * 4,
      vertexCount * 3,
    );
    index = index + vertexCount * 3;
    const normalsAttribute = geometry.getAttribute(
      "normal",
    ) as BufferAttribute | null;
    if (normalsAttribute && normalsAttribute.count === vertexCount) {
      normalsAttribute.set(normals, 0);
      normalsAttribute.needsUpdate = true;
    } else {
      geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    }

    if (existingInstance && instanceCount > existingInstance.geometry.userData.count) {
      console.log("recreating instance")
      scene.remove(existingInstance);
      instances.splice(instances.indexOf(existingInstance), 1);
      existingInstance = new InstancedMesh(geometry, material, instanceCount);
      scene.add(existingInstance)
      instances.push(existingInstance)
    } else if (!existingInstance) {
      console.log("creating instance")
      existingInstance = new InstancedMesh(geometry, material, instanceCount);
      scene.add(existingInstance)
      instances.push(existingInstance)
    } else {
      console.log("updating instance")
      existingInstance.count = instanceCount;
    }

    // update the matrices

    const matrices = new Float32Array(
      data.buffer,
      index * 4,
      instanceCount * 16);

    for (let i = 0; i < instanceCount; i++) {
      const matrix = new Matrix4().fromArray(matrices.subarray(i * 16, i * 16 + 16));
      existingInstance.setMatrixAt(i, matrix);
    }

    geometry.userData = {
      vertexCount,
      faceCount,
      count: Math.max(instanceCount, existingInstance.geometry.userData.count || 0),
      hash,
    };

    existingInstance.instanceMatrix.needsUpdate = true;

  }

  return {
    update(
      newData: Int32Array[],
    ) {
      for (let i = 0; i < Math.max(newData.length, instances.length); i++) {
        const existingMesh = instances[i];
        let input = newData[i];
        if (input) {
          updateSingleInstance(input, existingMesh || null);
        } else if (existingMesh) {
          existingMesh.visible = false;
          scene.remove(existingMesh);
        }
      }
    }
  }
}
