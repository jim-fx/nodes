<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import { getGraphManager } from "../graph/context.js";
  import { Input } from "@nodes/ui";

  export let node: Node;
  export let input: NodeInput;
  export let id: string;
  export let label: string | undefined;

  const graph = getGraphManager();

  let value = node?.props?.[id] ?? input.value;

  let elementId = Math.random().toString(36).substring(7);

  $: if (node?.props?.[id] !== value) {
    node.props = { ...node.props, [id]: value };
    graph.save();
    graph.execute();
  }
</script>

<label for="input-{elementId}">{label || id}</label>
<Input id="input-{elementId}" {input} bind:value />
