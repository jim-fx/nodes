<script lang="ts">
  import type { Edge as EdgeType, Node as NodeType } from "@nodes/types";
  import { HTML } from "@threlte/extras";
  import Edge from "../edges/Edge.svelte";
  import Node from "../node/Node.svelte";
  import { getContext, onMount } from "svelte";
  import { getGraphState } from "./state.svelte";
  import { useThrelte } from "@threlte/core";
  import { appSettings } from "$lib/settings/app-settings.svelte";

  type Props = {
    nodes: Map<number, NodeType>;
    edges: EdgeType[];
    cameraPosition: [number, number, number];
  };

  const { nodes, edges, cameraPosition = [0, 0, 4] }: Props = $props();

  const { invalidate } = useThrelte();

  $effect(() => {
    appSettings.theme;
    invalidate();
  });

  $effect(() => console.log({ nodes }));

  const graphState = getGraphState();

  const isNodeInView = getContext<(n: NodeType) => boolean>("isNodeInView");

  const getSocketPosition =
    getContext<(node: NodeType, index: string | number) => [number, number]>(
      "getSocketPosition",
    );

  const edgePositions = $derived(
    edges.map((edge) => {
      const fromNode = nodes.get(edge[0].id);
      const toNode = nodes.get(edge[2].id);

      // This check is important because nodes might not be there during some transitions.
      if (!fromNode || !toNode) {
        return [0, 0, 0, 0];
      }

      const pos1 = getSocketPosition(fromNode, edge[1]);
      const pos2 = getSocketPosition(toNode, edge[3]);
      return [pos1[0], pos1[1], pos2[0], pos2[1]];
    }),
  );

  const nodeArray = $derived(Array.from(nodes.values()));

  onMount(() => {
    for (const node of nodes.values()) {
      if (node?.tmp?.ref) {
        node.tmp.ref.style.setProperty("--nx", `${node.position[0] * 10}px`);
        node.tmp.ref.style.setProperty("--ny", `${node.position[1] * 10}px`);
      }
    }
  });
</script>

{#each edgePositions as edge (`${edge.join("-")}`)}
  {@const [x1, y1, x2, y2] = edge}
  <Edge
    z={cameraPosition[2]}
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
    id="graph"
    tabindex="0"
    class="wrapper"
    style:transform={`scale(${cameraPosition[2] * 0.1})`}
    class:hovering-sockets={graphState.activeSocket}
  >
    {#each nodeArray as node, i (node.id)}
      <Node
        bind:node={nodeArray[i]}
        inView={cameraPosition && isNodeInView(node)}
        z={cameraPosition[2]}
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
  }
</style>
