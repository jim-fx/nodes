<script lang="ts">
  import Panel from "$lib/sidebar/Panel.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import GraphInterface from "$lib/graph-interface";
  import { RemoteNodeRegistry } from "@nodarium/registry";
  import { type Graph, type NodeInstance } from "@nodarium/types";
  import Grid from "$lib/grid";
  import { MemoryRuntimeExecutor, type Pointer } from "$lib/runtime";
  import devPlant from "./dev-graph.json";
  import { decodeFloat } from "@nodarium/utils";
  import { localState } from "$lib/helpers/localState.svelte";

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
    execute(outputPos: number, args: number[]) {
      return 0;
    },
  });

  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let inputPtrs: Record<number, Pointer[]>;
  let activeNode = $state<NodeInstance>();
  let isCalculating = $state<boolean>(false);
  let windowHeight = $state(500);
  let start = $state(0);

  const rowHeight = 40;
  const numRows = $derived(Math.floor(windowHeight / rowHeight));

  let memory = $state<Int32Array>();
  const visibleRows = $derived(memory?.slice(start, start + numRows));

  const ptrs = $derived.by(() => {
    if (!inputPtrs) return [];
    const seen = new Set();
    const ptrs = [...Object.values(inputPtrs)]
      .flat()
      .sort((a, b) => (a.start > b.start ? 1 : -1))
      .filter((ptr) => {
        const id = `${ptr.start}-${ptr.end}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    if (!ptrs) return [];

    let out = [];
    for (let i = 0; i < numRows; i++) {
      let rowIndex = start + i;
      const activePtr = ptrs.find(
        (ptr) => ptr.start < rowIndex && ptr.end >= rowIndex,
      );
      if (activePtr) {
        out.push({
          start: rowIndex,
          end: rowIndex + 1,
          _title: activePtr._title,
        });
      }
    }
    return out;
  });

  let graph = $state(
    localStorage.getItem("nodes.dev.graph")
      ? JSON.parse(localStorage.getItem("nodes.dev.graph")!)
      : devPlant,
  );
  function handleSave(g: Graph) {
    localStorage.setItem("nodes.dev.graph", JSON.stringify(g));
  }

  let graphSettings = $state<Record<string, any>>({});
  let graphSettingTypes = $state({
    randomSeed: { type: "boolean", value: false },
  });

  let calcTimeout: ReturnType<typeof setTimeout>;
  async function handleResult(res?: Graph) {
    console.clear();
    isCalculating = true;
    if (res) handleSave(res);
    try {
      await runtimeExecutor.execute(res || graph, graphSettings);
    } catch (e) {
      console.log(e);
    }
    memory = runtimeExecutor.getMemory();
    inputPtrs = runtimeExecutor.inputPtrs;
    clearTimeout(calcTimeout);
    calcTimeout = setTimeout(() => {
      isCalculating = false;
    }, 500);
  }

  const rowIsFloat = localState<boolean[]>("node.dev.isFloat", []);

  function decodeValue(value: number, isFloat?: boolean) {
    return isFloat ? decodeFloat(value) : value;
  }
</script>

<svelte:window
  bind:innerHeight={windowHeight}
  onkeydown={(ev) => ev.key === "r" && handleResult()}
/>

<Grid.Row>
  <Grid.Cell>
    {#if visibleRows?.length}
      <table
        class="min-w-full select-none overflow-hidden text-left text-sm flex-1"
      >
        <thead class="">
          <tr>
            <th class="px-4 py-2 border-b border-[var(--outline)]">i</th>
            <th
              class="px-4 py-2 border-b border-[var(--outline)] w-[50px]"
              style:width="50px">Ptrs</th
            >
            <th class="px-4 py-2 border-b border-[var(--outline)]">Value</th>
            <th class="px-4 py-2 border-b border-[var(--outline)]">Float</th>
          </tr>
        </thead>
        <tbody>
          {#each visibleRows as r, i}
            {@const index = i + start}
            {@const ptr = ptrs[i]}
            <tr class="h-[40px] odd:bg-[var(--layer-1)]">
              <td class="px-4 border-b border-[var(--outline)] w-8">{index}</td>
              <td
                class="w-[50px] border-b border-[var(--outline)]
                        {ptr?._title?.includes('->')
                  ? 'bg-red-500'
                  : 'bg-blue-500'}"
              >
                <span>{ptr?._title}</span>
              </td>
              <td
                class="px-4 border-b border-[var(--outline)] cursor-pointer text-blue-600 hover:text-blue-800"
                onclick={() =>
                  (rowIsFloat.value[index] = !rowIsFloat.value[index])}
              >
                {decodeValue(r, rowIsFloat.value[index])}
              </td>
              <td class="px-4 border-b border-[var(--outline)] italic w-5">
                <input
                  type="checkbox"
                  checked={rowIsFloat.value[index]}
                  onclick={() =>
                    (rowIsFloat.value[index] = !rowIsFloat.value[index])}
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <input
        class="absolute bottom-4 left-4 bg-white"
        bind:value={start}
        min="0"
        type="number"
        step="1"
      />
    {/if}
  </Grid.Cell>

  <Grid.Cell>
    {#if isCalculating}
      <span
        class="opacity-50 top-4 left-4 i-[tabler--loader-2] w-10 h-10 absolute animate-spin z-100"
      ></span>
    {/if}
    <button
      onclick={() => handleResult()}
      class="flex items-center cursor-pointer absolute bottom-4 left-4 z-100"
    >
      Execute Graph (R)
    </button>
    <GraphInterface
      {graph}
      bind:activeNode
      registry={nodeRegistry}
      bind:settings={graphSettings}
      bind:settingTypes={graphSettingTypes}
      onsave={(g) => handleSave(g)}
      onresult={(res) => handleResult(res)}
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
