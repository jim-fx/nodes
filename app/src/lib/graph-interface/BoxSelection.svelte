<script lang="ts">
  import { HTML } from "@threlte/extras";

  export let p1 = { x: 0, y: 0 };
  export let p2 = { x: 0, y: 0 };

  export let cameraPosition = [0, 1, 0];

  $: width = Math.abs(p1.x - p2.x) * cameraPosition[2];
  $: height = Math.abs(p1.y - p2.y) * cameraPosition[2];

  $: x = Math.max(p1.x, p2.x) - width / cameraPosition[2];
  $: y = Math.max(p1.y, p2.y) - height / cameraPosition[2];
</script>

<HTML position.x={x} position.z={y} transform={false}>
  <div
    class="box-selection"
    style={`width: ${width}px; height: ${height}px;`}
  ></div>
</HTML>

<style>
  .box-selection {
    width: 40px;
    height: 20px;
    border: solid 2px var(--outline);
    border-style: dashed;
    border-radius: 2px;
  }
</style>
