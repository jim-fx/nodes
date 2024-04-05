<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import { getGraphManager } from "../graph/context";
  import Input from "@nodes/input-elements";

  export let node: Node;
  export let input: NodeInput;
  export let label: string;

  const graph = getGraphManager();

  let value = node?.props?.[label] ?? input.value;

  $: if (node?.props?.[label] !== value) {
    node.props = { ...node.props, [label]: value };
    graph.execute();
  }
</script>

<label for="asd">{label}</label>
<Input {input} bind:value />
