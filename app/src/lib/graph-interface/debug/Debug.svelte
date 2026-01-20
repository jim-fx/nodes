<script lang="ts">
  import { MeshLineGeometry, MeshLineMaterial } from "@threlte/extras";
  import { points, lines, rects } from "./store.js";
  import { T } from "@threlte/core";
  import { Color } from "three";
</script>

{#each $points as point}
  <T.Mesh
    position.x={point.x}
    position.y={point.y}
    position.z={point.z}
    rotation.x={-Math.PI / 2}
  >
    <T.CircleGeometry args={[0.2, 32]} />
    <T.MeshBasicMaterial color="red" />
  </T.Mesh>
{/each}

{#each $rects as rect, i}
  <T.Mesh
    position.x={(rect.minX + rect.maxX) / 2}
    position.y={0}
    position.z={(rect.minY + rect.maxY) / 2}
    rotation.x={-Math.PI / 2}
  >
    <T.PlaneGeometry args={[rect.maxX - rect.minX, rect.maxY - rect.minY]} />
    <T.MeshBasicMaterial
      color={new Color().setHSL((i * 1.77) % 1, 1, 0.5)}
      opacity={0.9}
    />
  </T.Mesh>
{/each}

{#each $lines as line}
  <T.Mesh position.y={1}>
    <MeshLineGeometry points={line.points} />
    <MeshLineMaterial
      color={line.color || "red"}
      linewidth={1}
      attenuate={false}
    />
  </T.Mesh>
{/each}
