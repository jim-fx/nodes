<script module lang="ts">
  import { colors } from "../graph/colors.svelte";

  const circleMaterial = new MeshBasicMaterial({
    color: colors.edge.clone(),
    toneMapped: false,
  });
  $effect.root(() => {
    $effect(() => {
      appSettings.theme;
      circleMaterial.color = colors.edge.clone().convertSRGBToLinear();
    })
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
  import { BufferGeometry,  MeshBasicMaterial, Vector3 } from "three";
  import { CubicBezierCurve } from "three/src/extras/curves/CubicBezierCurve.js";
  import { Vector2 } from "three/src/math/Vector2.js";
  import { createEdgeGeometry } from "./createEdgeGeometry.js";
    import { appSettings } from "$lib/settings/app-settings.svelte";

  type Props = {
    from: { x: number; y: number };
    to: { x: number; y: number };
    z:number;
  };

  const { from, to, z }: Props = $props();

  let geometry: BufferGeometry|null = $state(null);

  const lineColor = $derived(appSettings.theme && colors.edge.clone().convertSRGBToLinear());

  let lastId: number | null = null;

  const primeA = 31;
  const primeB = 37;

  function update() {
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

    const samples = Math.max(length * 16, 10);

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


  $effect(() => {
    if (from || to) {
      update();
    }
  });
</script>

<T.Mesh
  position.x={from.x}
  position.z={from.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  material={circleMaterial}
>
  <T.CircleGeometry args={[0.5, 16]} />
</T.Mesh>

<T.Mesh
  position.x={to.x}
  position.z={to.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  material={circleMaterial}
>
  <T.CircleGeometry args={[0.5, 16]} />
</T.Mesh>

{#if geometry}
  <T.Mesh position.x={from.x} position.z={from.y} position.y={0.1} {geometry}>
    <MeshLineMaterial width={Math.max(z*0.0001,0.00001)} color={lineColor}  />
  </T.Mesh>
{/if}
