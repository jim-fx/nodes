<script lang="ts">
  import type { Node } from "$lib/types";
  import { T } from "@threlte/core";
  import { MeshLineGeometry, MeshLineMaterial } from "@threlte/extras";
  import { CubicBezierCurve, Vector2, Vector3 } from "three";

  export let from: Node;
  export let to: Node;

  let samples = 20;

  const curve = new CubicBezierCurve(
    new Vector2(from.position.x + 20, from.position.y),
    new Vector2(from.position.x + 2, from.position.y),
    new Vector2(to.position.x - 2, to.position.y),
    new Vector2(to.position.x, to.position.y),
  );

  let points: Vector3[] = [];

  let last_from_x = 0;
  let last_from_y = 0;

  function update(force = false) {
    if (!force) {
      const new_x = from.position.x + to.position.x;
      const new_y = from.position.y + to.position.y;
      if (last_from_x === new_x && last_from_y === new_y) {
        return;
      }
      last_from_x = new_x;
      last_from_y = new_y;
    }
    curve.v0.set(from.position.x + 5, from.position.y + 5 / 8);
    curve.v1.set(from.position.x + 7, from.position.y + 5 / 8);
    curve.v2.set(to.position.x - 2, to.position.y + 2.55);
    curve.v3.set(to.position.x + 0.2, to.position.y + 2.55);
    points = curve.getPoints(samples).map((p) => new Vector3(p.x, 0, p.y));
  }

  update();
  $: if (from.position || to.position) {
    update();
  }
</script>

<T.Mesh>
  <MeshLineGeometry {points} />
  <MeshLineMaterial width={1} attenuate={false} color={0xffffff} />
</T.Mesh>
