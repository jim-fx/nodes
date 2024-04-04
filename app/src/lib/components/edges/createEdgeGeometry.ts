import { BufferGeometry, Vector3, BufferAttribute } from 'three'
import { setXY, setXYZ, setXYZW, setXYZXYZ } from './utils'


export function createEdgeGeometry(points: Vector3[]) {

  let shape = 'none'
  let shapeFunction = (p: number) => 1

  // When the component first runs we create the buffer geometry and allocate the buffer attributes
  let pointCount = points.length
  let counters: number[] = []
  let counterIndex = 0
  let side: number[] = []
  let widthArray: number[] = []
  let doubleIndex = 0
  let uvArray: number[] = []
  let uvIndex = 0
  let indices: number[] = []
  let indicesIndex = 0

  if (shape === 'taper') {
    shapeFunction = (p: number) => 1 * Math.pow(4 * p * (1 - p), 1)
  }

  for (let j = 0; j < pointCount; j++) {
    const c = j / points.length
    counters[counterIndex + 0] = c
    counters[counterIndex + 1] = c
    counterIndex += 2

    setXY(side, doubleIndex, 1, -1)
    let width = shape === 'none' ? 1 : shapeFunction(j / (pointCount - 1))
    setXY(widthArray, doubleIndex, width, width)
    doubleIndex += 2

    setXYZW(uvArray, uvIndex, j / (pointCount - 1), 0, j / (pointCount - 1), 1)
    uvIndex += 4

    if (j < pointCount - 1) {
      const n = j * 2
      setXYZ(indices, indicesIndex, n + 0, n + 1, n + 2)
      setXYZ(indices, indicesIndex + 3, n + 2, n + 1, n + 3)
      indicesIndex += 6
    }
  }

  const geometry = new BufferGeometry()
  // create these buffer attributes at the correct length but leave them empty for now
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(pointCount * 6), 3))
  geometry.setAttribute('previous', new BufferAttribute(new Float32Array(pointCount * 6), 3))
  geometry.setAttribute('next', new BufferAttribute(new Float32Array(pointCount * 6), 3))
  // create and populate these buffer attributes
  geometry.setAttribute('counters', new BufferAttribute(new Float32Array(counters), 1))
  geometry.setAttribute('side', new BufferAttribute(new Float32Array(side), 1))
  geometry.setAttribute('width', new BufferAttribute(new Float32Array(widthArray), 1))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvArray), 2))
  geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1))



  let positions: number[] = []
  let previous: number[] = []
  let next: number[] = []
  let positionIndex = 0
  let previousIndex = 0
  let nextIndex = 0
  setXYZXYZ(previous, previousIndex, points[0].x, points[0].y, points[0].z)
  previousIndex += 6
  for (let j = 0; j < pointCount; j++) {
    const p = points[j]
    setXYZXYZ(positions, positionIndex, p.x, p.y, p.z)
    positionIndex += 6
    if (j < pointCount - 1) {
      setXYZXYZ(previous, previousIndex, p.x, p.y, p.z)
      previousIndex += 6
    }
    if (j > 0 && j + 1 <= pointCount) {
      setXYZXYZ(next, nextIndex, p.x, p.y, p.z)
      nextIndex += 6
    }
  }
  setXYZXYZ(
    next,
    nextIndex,
    points[pointCount - 1].x,
    points[pointCount - 1].y,
    points[pointCount - 1].z
  )
  const positionAttribute = (geometry.getAttribute('position') as BufferAttribute).set(positions)
  const previousAttribute = (geometry.getAttribute('previous') as BufferAttribute).set(previous)
  const nextAttribute = (geometry.getAttribute('next') as BufferAttribute).set(next)
  positionAttribute.needsUpdate = true
  previousAttribute.needsUpdate = true
  nextAttribute.needsUpdate = true
  geometry.computeBoundingSphere()

  return geometry;

}
