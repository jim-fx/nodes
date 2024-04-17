<script context="module" lang="ts">
  const color = new Color(0x202020);
  color.convertLinearToSRGB();

  const color2 = color.clone();
  color2.convertSRGBToLinear();

  const circleMaterial = new MeshBasicMaterial({
    color,
    toneMapped: false,
  });

  const lineCache = new Map<number, BufferGeometry>();

  const curve = new CubicBezierCurve(
    new Vector2(0, 0),
    new Vector2(0, 0),
    new Vector2(0, 0),
    new Vector2(0, 0),
  );
</script>

<script lang="ts">
  import { T } from "@threlte/core";
  import { MeshLineMaterial } from "@threlte/extras";
  import { BufferGeometry, MeshBasicMaterial, Vector3 } from "three";
  import { Color } from "three/src/math/Color.js";
  import { CubicBezierCurve } from "three/src/extras/curves/CubicBezierCurve.js";
  import { Vector2 } from "three/src/math/Vector2.js";
  import { createEdgeGeometry } from "./createEdgeGeometry.js";

  export let from: { x: number; y: number };
  export let to: { x: number; y: number };

  let samples = 5;

  let geometry: BufferGeometry;

  let lastId: number | null = null;

  const primeA = 31;
  const primeB = 37;

  export const update = function () {
    const new_x = to.x - from.x;
    const new_y = to.y - from.y;
    const curveId = new_x * primeA + new_y * primeB;
    if (lastId === curveId) {
      return;
    }

    const mid = new Vector2(new_x / 2, new_y / 2);

    if (lineCache.has(curveId)) {
      geometry = lineCache.get(curveId)!;
      return;
    }

    const length = Math.floor(
      Math.sqrt(Math.pow(new_x, 2) + Math.pow(new_y, 2)) / 4,
    );
    samples = Math.min(Math.max(10, length), 60);

    curve.v0.set(0, 0);
    curve.v1.set(mid.x, 0);
    curve.v2.set(mid.x, new_y);
    curve.v3.set(new_x, new_y);

    const points = curve
      .getPoints(samples)
      .map((p) => new Vector3(p.x, 0, p.y))
      .flat();

    geometry = createEdgeGeometry(points);
    lineCache.set(curveId, geometry);
  };

  $: if (from || to) {
    update();
  }
</script>

<T.Mesh
  position.x={from.x}
  position.z={from.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  material={circleMaterial}
>
  <T.CircleGeometry args={[0.3, 16]} />
</T.Mesh>

<T.Mesh
  position.x={to.x}
  position.z={to.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  material={circleMaterial}
>
  <T.CircleGeometry args={[0.3, 16]} />
</T.Mesh>

{#if geometry}
  <T.Mesh position.x={from.x} position.z={from.y} position.y={0.1} {geometry}>
    <MeshLineMaterial
      width={4}
      attenuate={false}
      color={color2}
      toneMapped={false}
    />
  </T.Mesh>
{/if}