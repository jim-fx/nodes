<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import { getGraphManager } from "../graph/context.js";
  import { Input } from "@nodes/ui";

  export let node: Node;
  export let input: NodeInput;
  export let id: string;

  const graph = getGraphManager();

  let value = node?.props?.[id] ?? input.value;

  export let elementId: string = `input-${Math.random().toString(36).substring(7)}`;

  $: if (node?.props?.[id] !== value) {
    node.props = { ...node.props, [id]: value };
    if (graph) {
      graph.save();
      graph.execute();
    }
  }
</script>

<Input id="input-{elementId}" {input} bind:value />
