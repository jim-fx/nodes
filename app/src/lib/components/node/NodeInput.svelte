<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import { getGraphManager } from "../graph/context";
  import Input from "@nodes/input-elements";

  export let node: Node;
  export let input: NodeInput;
  export let id: string;

  const graph = getGraphManager();

  let value = node?.props?.[id] ?? input.value;

  $: if (node?.props?.[id] !== value) {
    node.props = { ...node.props, [id]: value };
    graph.execute();
  }
</script>

<label for="asd">{id}</label>
<Input {input} bind:value />
