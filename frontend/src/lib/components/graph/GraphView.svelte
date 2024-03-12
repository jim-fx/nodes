<script lang="ts">
  import type { Edge as EdgeType, Node as NodeType } from "$lib/types";
  import { HTML } from "@threlte/extras";
  import Edge from "../edges/Edge.svelte";
  import Node from "../Node.svelte";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  export let nodes: Writable<Map<number, NodeType>>;
  export let edges: Writable<EdgeType[]>;

  export let cameraPosition = [0, 1, 0];
  export let downSocket: null | { node: NodeType; index: number | string } =
    null;
  export let possibleSocketIds: null | Set<string> = null;

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
</script>

{#each $edges as edge}
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
    class:hovering-sockets={downSocket}
    style={`--cz: ${cameraPosition[2]}`}
  >
    {#each $nodes.values() as node}
      <Node
        {node}
        inView={cameraPosition && isNodeInView(node)}
        {possibleSocketIds}
      />
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
