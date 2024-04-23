<script lang="ts">
  import type { Node, NodeInput } from "@nodes/types";
  import NestedSettings from "./NestedSettings.svelte";
  import { writable } from "svelte/store";
  import type { GraphManager } from "$lib/graph-interface/graph-manager";

  function filterInputs(inputs: Record<string, NodeInput>) {
    return Object.fromEntries(
      Object.entries(inputs).filter(([key, value]) => {
        return value.hidden === true;
      }),
    );
  }

  function createStore(
    props: Node["props"],
    inputs: Record<string, NodeInput>,
  ) {
    const store = {};
    Object.keys(inputs).forEach((key) => {
      store[key] = props[key] || inputs[key].value;
    });
    console.log({ store, props });
    return writable(store);
  }

  export let manager: GraphManager;

  export let node: Node;
  let nodeDefinition: Record<string, NodeInput> | undefined;
  $: nodeDefinition = node?.tmp?.type
    ? filterInputs(node.tmp.type.inputs)
    : undefined;
  $: store = node ? createStore(node.props, nodeDefinition) : undefined;

  function updateNode() {
    if (!node || !$store) return;
    Object.keys($store).forEach((_key: string) => {
      node.props = node.props || {};
      const key = _key as keyof typeof $store;
      let needsUpdate = false;
      console.log({ key });
      if (
        node &&
        $store &&
        key in node.props &&
        node.props[key] !== $store[key]
      ) {
        needsUpdate = true;
        node.props[key] = $store[key];
      }
      if (needsUpdate) {
        manager.execute();
      }
    });
  }

  $: if (store && $store) {
    updateNode();
  }
</script>

{#if node}
  {#if nodeDefinition && store && Object.keys(nodeDefinition).length > 0}
    <NestedSettings id="activeNodeSettings" settings={nodeDefinition} {store} />
  {:else}
    <p class="mx-4">Active Node has no Settings</p>
  {/if}
{:else}
  <p class="mx-4">No active node</p>
{/if}
