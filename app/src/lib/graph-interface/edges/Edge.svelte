<script module lang="ts">
  import { colors } from "../graph/colors.svelte";

  const circleMaterial = new MeshBasicMaterial({
    color: colors.edge.clone(),
    toneMapped: false,
  });

  let lineColor = $state(colors.edge.clone().convertSRGBToLinear());

  $effect.root(() => {
    $effect(() => {
      appSettings.value.theme;
      circleMaterial.color = colors.edge.clone().convertSRGBToLinear();
      lineColor = colors.edge.clone().convertSRGBToLinear();
    });
  });

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
  import { Mesh, MeshBasicMaterial, Vector3 } from "three";
  import { CubicBezierCurve } from "three/src/extras/curves/CubicBezierCurve.js";
  import { Vector2 } from "three/src/math/Vector2.js";
  import { createEdgeGeometry } from "./createEdgeGeometry.js";
  import { appSettings } from "$lib/settings/app-settings.svelte";

  type Props = {
    from: { x: number; y: number };
    to: { x: number; y: number };
    z: number;
  };

  const { from, to, z }: Props = $props();

  const thickness = $derived(Math.max(0.001, 0.00082 * Math.exp(0.055 * z)));

  let mesh = $state<Mesh>();

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

    const length = Math.floor(
      Math.sqrt(Math.pow(new_x, 2) + Math.pow(new_y, 2)) / 4,
    );

    const samples = Math.max(length * 16, 10);

    curve.v0.set(0, 0);
    curve.v1.set(new_x / 2, 0);
    curve.v2.set(new_x / 2, new_y);
    curve.v3.set(new_x, new_y);

    const points = curve
      .getPoints(samples)
      .map((p) => new Vector3(p.x, 0, p.y))
      .flat();

    if (mesh) {
      mesh.geometry = createEdgeGeometry(points);
    }
  }

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

<T.Mesh
  bind:ref={mesh}
  position.x={from.x}
  position.z={from.y}
  position.y={0.1}
>
  <MeshLineMaterial width={thickness} color={lineColor} />
</T.Mesh>
