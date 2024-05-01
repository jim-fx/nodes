<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import NestedSettings from "./NestedSettings.svelte";
  import { writable } from "svelte/store";

  import type { GraphManager } from "$lib/graph-interface/graph-manager";

  export let manager: GraphManager;
  export let node: Node | undefined;

  function filterInputs(inputs: Record<string, NodeInput>) {
    return Object.fromEntries(
      Object.entries(inputs)
        .filter(([key, value]) => {
          return value.hidden === true;
        })
        .map(([key, value]) => {
          //@ts-ignore
          value.__node_type = node?.tmp?.type.id;
          //@ts-ignore
          value.__node_input = key;
          return [key, value];
        }),
    );
  }

  function createStore(
    props: Node["props"],
    inputs: Record<string, NodeInput>,
  ) {
    const store: Record<string, unknown> = {};
    Object.keys(inputs).forEach((key) => {
      if (props) {
        //@ts-ignore
        store[key] = props[key] || inputs[key].value;
      }
    });
    return writable(store);
  }

  let nodeDefinition: Record<string, NodeInput> | undefined;
  $: nodeDefinition = node?.tmp?.type
    ? filterInputs(node.tmp.type.inputs)
    : undefined;
  $: store = node ? createStore(node.props, nodeDefinition) : undefined;

  let lastPropsHash = "";
  function updateNode() {
    if (!node || !$store) return;
    let needsUpdate = false;
    Object.keys($store).forEach((_key: string) => {
      node.props = node.props || {};
      const key = _key as keyof typeof $store;
      if (node && $store) {
        needsUpdate = true;
        node.props[key] = $store[key];
      }
    });
    let propsHash = JSON.stringify(node.props);
    if (propsHash === lastPropsHash) {
      return;
    }
    lastPropsHash = propsHash;
    // console.log(needsUpdate, node.props, $store);
    if (needsUpdate) {
      manager.execute();
    }
  }

  $: if (store && $store) {
    updateNode();
  }
</script>

{#if node}
  {#key node.id}
    {#if nodeDefinition && store && Object.keys(nodeDefinition).length > 0}
      <NestedSettings
        id="activeNodeSettings"
        settings={nodeDefinition}
        {store}
      />
    {:else}
      <p class="mx-4">Active Node has no Settings</p>
    {/if}
  {/key}
{:else}
  <p class="mx-4">No active node</p>
{/if}
