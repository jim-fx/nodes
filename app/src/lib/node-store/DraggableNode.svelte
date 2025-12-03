<script lang="ts">
  import NodeHtml from "$lib/graph-interface/node/NodeHTML.svelte";
  import type { SerializedNode } from "@nodarium/types";

  const { node }: { node: SerializedNode } = $props();

  let dragging = $state(false);

  let nodeData = $state({
    id: 0,
    type: node?.id,
    position: [0, 0] as [number, number],
    props: {},
    tmp: {
      type: node,
    },
  });

  function handleDragStart(e: DragEvent) {
    dragging = true;
    const box = (e?.target as HTMLElement)?.getBoundingClientRect();
    if (e.dataTransfer === null) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("data/node-id", node.id.toString());
    if (nodeData.props) {
      e.dataTransfer.setData("data/node-props", JSON.stringify(nodeData.props));
    }
    e.dataTransfer.setData(
      "data/node-offset-x",
      Math.round(box.left - e.clientX).toString(),
    );
    e.dataTransfer.setData(
      "data/node-offset-y",
      Math.round(box.top - e.clientY).toString(),
    );
  }
</script>

<div class="node-wrapper" class:dragging>
  <div
    ondragend={() => {
      dragging = false;
    }}
    draggable={true}
    role="button"
    tabindex="0"
    ondragstart={handleDragStart}
  >
    <NodeHtml inView={true} position={"relative"} z={5} bind:node={nodeData} />
  </div>
</div>

<style>
  .node-wrapper {
    width: fit-content;
    border-radius: 5px;
    box-sizing: border-box;
    border: solid 2px transparent;
    padding: 5px;
    margin-left: -5px;
  }

  .dragging {
    border: dashed 2px var(--outline);
  }
  .node-wrapper > div {
    opacity: 1;
    display: block;
    pointer-events: all;
    transition: opacity 0.2s;
  }
  .dragging > div {
    opacity: 0.2;
  }
</style>
