<script lang="ts">
  import * as templates from "$lib/graph-templates";
  import Panel from "$lib/sidebar/Panel.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import GraphInterface from "$lib/graph-interface";
  import { RemoteNodeRegistry } from "@nodarium/registry";
  import { type Graph } from "@nodarium/types";
  import Grid from "$lib/grid";
  import { MemoryRuntimeExecutor } from "$lib/runtime";
  import devPlant from "./dev-graph.json";
  import { decodeNestedArray } from "@nodarium/utils";

  let result = $state<Int32Array>();

  const nodeRegistry = new RemoteNodeRegistry("");
  nodeRegistry.overwriteNode("max/plantarium/output", {
    id: "max/plantarium/output",
    meta: {
      title: "Debug View",
      description: "",
    },
    inputs: {
      out: {
        type: "*",
      },
    },
    execute(input: Int32Array) {
      result = input;
      return input;
    },
  });

  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let graph = $state(
    localStorage.getItem("nodes.dev.graph")
      ? JSON.parse(localStorage.getItem("nodes.dev.graph")!)
      : devPlant,
  );
  function handleSave(graph: Graph) {
    localStorage.setItem("nodes.dev.graph", JSON.stringify(graph));
  }

  let graphSettings = $state<Record<string, any>>({});
  let graphSettingTypes = $state({
    randomSeed: { type: "boolean", value: false },
  });

  async function handleResult(res: unknown) {
    const result = await runtimeExecutor.execute(graph, graphSettings);
    console.log({ res, result });
  }
</script>

<Grid.Row>
  <Grid.Cell>
    {#if result}
      <pre><code>{JSON.stringify(decodeNestedArray(result))}</code></pre>
    {/if}
  </Grid.Cell>

  <Grid.Cell>
    <GraphInterface
      {graph}
      registry={nodeRegistry}
      bind:settings={graphSettings}
      bind:settingTypes={graphSettingTypes}
      onsave={(g) => handleSave(g)}
      onresult={(result) => handleResult(result)}
    />
  </Grid.Cell>
</Grid.Row>

<Sidebar>
  <Panel
    id="node-store"
    classes="text-green-400"
    title="Node Store"
    icon="i-[tabler--database]"
  ></Panel>
</Sidebar>

<style>
  :global body {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
</style>
