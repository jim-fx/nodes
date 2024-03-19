<script lang="ts">
  import type { Edge as EdgeType, Node as NodeType } from "$lib/types";
  import { HTML } from "@threlte/extras";
  import Edge from "../edges/Edge.svelte";
  import Node from "../Node.svelte";
  import { getContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { activeSocket } from "./stores";

  export let nodes: Writable<Map<number, NodeType>>;
  export let edges: Writable<EdgeType[]>;

  export let cameraPosition = [0, 1, 0];

  const isNodeInView = getContext<(n: NodeType) => boolean>("isNodeInView");

  const getSocketPosition =
    getContext<(node: NodeType, index: string | number) => [number, number]>(
      "getSocketPosition",
    );

  function getEdgePosition(edge: EdgeType) {
    const pos1 = getSocketPosition(edge[0], edge[1]);
    const pos2 = getSocketPosition(edge[2], edge[3]);

    return [pos1[0], pos1[1], pos2[0], pos2[1]];
  }

  onMount(() => {
    for (const node of $nodes.values()) {
      if (node?.tmp?.ref) {
        node.tmp.ref.style.setProperty("--nx", `${node.position.x * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.position.y * 10}px`);
      }
    }
  });
</script>

{#each $edges as edge (edge[0].id + edge[2].id + edge[3])}
  {@const pos = getEdgePosition(edge)}
  {@const [x1, y1, x2, y2] = pos}
  <Edge
    from={{
      x: x1,
      y: y1,
    }}
    to={{
      x: x2,
      y: y2,
    }}
  />
{/each}

<HTML transform={false}>
  <div
    role="tree"
    tabindex="0"
    class="wrapper"
    class:zoom-small={cameraPosition[2] < 2}
    class:hovering-sockets={activeSocket}
    style={`--cz: ${cameraPosition[2]};`}
  >
    {#each $nodes.values() as node (node.id)}
      <Node {node} inView={cameraPosition && isNodeInView(node)} />
    {/each}
  </div>
</HTML>

<style>
  .wrapper {
    position: absolute;
    z-index: 100;
    width: 0px;
    height: 0px;
    transform: scale(calc(var(--cz) * 0.1));
    --input-opacity: calc((var(--cz) - 2) / 5);
  }
</style>
