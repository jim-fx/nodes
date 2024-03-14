<script lang="ts">
  import { T, extend } from "@threlte/core";
  import { MeshLineGeometry, MeshLineMaterial } from "@threlte/extras";
  import { CubicBezierCurve, Mesh, Vector2, Vector3 } from "three";

  extend({ MeshLineGeometry, MeshLineMaterial });

  export let from: { x: number; y: number };
  export let to: { x: number; y: number };

  const curve = new CubicBezierCurve(
    new Vector2(from.x, from.y),
    new Vector2(from.x + 2, from.y),
    new Vector2(to.x - 2, to.y),
    new Vector2(to.x, to.y),
  );

  let points: Vector3[] = [];

  let last_from_x = 0;
  let last_from_y = 0;

  let mesh: Mesh;

  import { colors } from "../graph/stores";

  $: color = $colors.backgroundColorLighter;

  export const update = function (force = false) {
    if (!force) {
      const new_x = from.x + to.x;
      const new_y = from.y + to.y;
      if (last_from_x === new_x && last_from_y === new_y) {
        return;
      }
      last_from_x = new_x;
      last_from_y = new_y;
    }

    const mid = new Vector2((from.x + to.x) / 2, (from.y + to.y) / 2);

    // const length = Math.sqrt(
    //   Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
    // );
    //
    // let samples = Math.max(5, Math.floor(length));
    // console.log(samples);
    const samples = 12;

    curve.v0.set(from.x, from.y);
    curve.v1.set(mid.x, from.y);
    curve.v2.set(mid.x, to.y);
    curve.v3.set(to.x, to.y);
    points = curve.getPoints(samples).map((p) => new Vector3(p.x, 0, p.y));
    // mesh.setGeometry(points);
    // mesh.needsUpdate = true;
  };

  update();
  $: if (from || to) {
    update();
  }
</script>

<T.Mesh
  position.x={from.x}
  position.z={from.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
>
  <T.CircleGeometry args={[0.3, 16]} />
  <T.MeshBasicMaterial {color} />
</T.Mesh>

<T.Mesh
  position.x={to.x}
  position.z={to.y}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
>
  <T.CircleGeometry args={[0.3, 16]} />
  <T.MeshBasicMaterial {color} />
</T.Mesh>

<T.Mesh position.y={0.5} bind:ref={mesh}>
  <MeshLineGeometry {points} />
  <MeshLineMaterial width={2} attenuate={false} {color} />
</T.Mesh>
