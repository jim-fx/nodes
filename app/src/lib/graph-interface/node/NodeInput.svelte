<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import { getGraphManager } from "../graph/context.js";
  import { Input } from "@nodes/ui";

  type Props = {
    node: Node;
    input: NodeInput;
    id: string;
    elementId?: string;
  };

  const {
    node,
    input,
    id,
    elementId = `input-${Math.random().toString(36).substring(7)}`,
  }: Props = $props();

  const graph = getGraphManager();

  let value = $state(node?.props?.[id] ?? input.value);

  $effect(() => {
    if (value !== undefined && node?.props?.[id] !== value) {
      node.props = { ...node.props, [id]: value };
      if (graph) {
        graph.save();
        graph.execute();
      }
    }
  });
</script>

<Input id="input-{elementId}" {input} bind:value />
