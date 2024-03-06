<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import type { Graph } from "$lib/types";

  const graph: Graph = {
    edges: [],
    nodes: [],
  };

  for (let i = 0; i < 40; i++) {
    const x = i % 20;
    const y = Math.floor(i / 20);

    graph.nodes.push({
      id: `${i.toString()}`,
      tmp: {
        visible: false,
      },
      position: {
        x: x * 7.5,
        y: y * 5,
      },
      type: "test",
    });

    graph.edges.push({
      from: i.toString(),
      to: (i + 1).toString(),
    });
  }
</script>

<Canvas shadows={false}>
  <Scene {graph} />
</Canvas>
