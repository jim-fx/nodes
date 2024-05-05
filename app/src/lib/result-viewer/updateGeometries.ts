import { MeshMatcapMaterial, TextureLoader, type Group } from "three";
import { createGeometryPool, createInstancedGeometryPool } from "./geometryPool";

const loader = new TextureLoader();
const matcap = loader.load('/matcap_green.jpg');
matcap.colorSpace = "srgb";
const material = new MeshMatcapMaterial({
  color: 0xffffff,
  matcap
});

let geometryPool: ReturnType<typeof createGeometryPool>;
let instancePool: ReturnType<typeof createInstancedGeometryPool>;

export function updateGeometries(inputs: Int32Array[], group: Group) {

  geometryPool = geometryPool || createGeometryPool(group, material);
  instancePool = instancePool || createInstancedGeometryPool(group, material);

  let totalVertices = 0;
  let totalFaces = 0;

  geometryPool.update(inputs.filter(i => i[0] === 1));
  instancePool.update(inputs.filter(i => i[0] === 2));

  return { totalFaces, totalVertices };
}
