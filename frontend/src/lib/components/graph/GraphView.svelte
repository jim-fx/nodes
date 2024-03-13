<script lang="ts">
  import type { Edge as EdgeType, Node as NodeType, Socket } from "$lib/types";
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

  function getEdgePosition(edge: EdgeType) {
    const index = Object.keys(edge[2].tmp?.type?.inputs || {}).indexOf(edge[3]);
    return [
      edge[0].position.x + 5,
      edge[0].position.y + 0.625 + edge[1] * 2.5,
      edge[2].position.x,
      edge[2].position.y + 2.5 + index * 2.5,
    ];
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
    class:zoom-small={cameraPosition[2] < 10}
    class:hovering-sockets={activeSocket}
    style={`--cz: ${cameraPosition[2]}`}
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
  }
</style>
