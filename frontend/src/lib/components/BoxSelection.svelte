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
    class="selection"
    style={`width: ${width}px; height: ${height}px;`}
  ></div>
</HTML>

<style>
  .selection {
    width: 40px;
    height: 20px;
    border: solid 0.2px white;
    border-style: dashed;
    border-radius: 2px;
  }
</style>
