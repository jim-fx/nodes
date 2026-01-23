<script lang="ts">
  import Panel from "$lib/sidebar/Panel.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
  import GraphInterface from "$lib/graph-interface";
  import { RemoteNodeRegistry } from "@nodarium/registry";
  import { type Graph, type NodeInstance } from "@nodarium/types";
  import Grid from "$lib/grid";
  import { MemoryRuntimeExecutor, type Pointer } from "$lib/runtime";
  import { decodeFloat } from "@nodarium/utils";
  import { localState } from "$lib/helpers/localState.svelte";
  import * as templates from "$lib/graph-templates";
  import NestedSettings from "$lib/settings/NestedSettings.svelte";
  import {
    appSettings,
    AppSettingTypes,
  } from "$lib/settings/app-settings.svelte";

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
      console.log({ outputPos, args });
      return 0;
    },
  });

  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let allPtrs = $state<Pointer[]>([]);
  let activeNode = $state<NodeInstance>();
  let isCalculating = $state<boolean>(false);
  let windowHeight = $state(500);
  const start = localState("nodes.dev.scroll", 0);

  const rowHeight = 40;
  const numRows = $derived(Math.floor(windowHeight / rowHeight));

  let memory = $state<Int32Array>();
  const visibleRows = $derived(
    memory?.slice(start.value, start.value + numRows),
  );

  const sortedPtrs = $derived.by(() => {
    const seen = new Set();
    const _ptrs = [...allPtrs]
      .sort((a, b) => (a.start > b.start ? 1 : -1))
      .filter((ptr) => {
        const id = `${ptr.start}-${ptr.end}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    if (!_ptrs) return [];
    return _ptrs;
  });

  const ptrs = $derived.by(() => {
    let out = [];
    for (let i = 0; i < numRows; i++) {
      let rowIndex = start.value + i;
      const activePtr = sortedPtrs.find(
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
      : templates.defaultPlant,
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
      await runtimeExecutor.execute(
        res || graph,
        $state.snapshot(graphSettings),
      );
    } catch (e) {
      console.log(e);
    }
    memory = runtimeExecutor.getMemory();
    allPtrs = runtimeExecutor.allPtrs;

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
        class="min-w-full select-none overflow-auto text-left text-sm flex-1"
        onscroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          start.value = Math.floor(scrollTop / rowHeight);
        }}
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
        <tbody
          onscroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            start.value = Math.floor(scrollTop / rowHeight);
          }}
        >
          {#each visibleRows as r, i}
            {@const index = i + start.value}
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
        bind:value={start.value}
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
  <Panel id="general" title="General" icon="i-[tabler--settings]">
    <NestedSettings
      id="general"
      bind:value={appSettings.value}
      type={AppSettingTypes}
    />
  </Panel>
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
