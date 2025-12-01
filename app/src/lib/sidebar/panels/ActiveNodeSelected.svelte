<script lang="ts">
  import type { Node, NodeInput } from "@nodarium/types";
  import NestedSettings from "$lib/settings/NestedSettings.svelte";
  import type { GraphManager } from "$lib/graph-interface/graph-manager.svelte";

  type Props = {
    manager: GraphManager;
    node: Node;
  };

  const { manager, node = $bindable() }: Props = $props();

  function filterInputs(inputs?: Record<string, NodeInput>) {
    const _inputs = $state.snapshot(inputs);
    return Object.fromEntries(
      Object.entries(structuredClone(_inputs ?? {}))
        .filter(([_key, value]) => {
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
  const nodeDefinition = filterInputs(node.tmp?.type?.inputs);

  type Store = Record<string, number | number[]>;
  let store = $state<Store>(createStore(node?.props, nodeDefinition));
  function createStore(
    props: Node["props"],
    inputs: Record<string, NodeInput>,
  ): Store {
    const store: Store = {};
    Object.keys(inputs).forEach((key) => {
      if (props) {
        //@ts-ignore
        store[key] = props[key] || inputs[key].value;
      }
    });
    return store;
  }

  let lastPropsHash = "";
  function updateNode() {
    if (!node || !store) return;
    let needsUpdate = false;
    Object.keys(store).forEach((_key: string) => {
      node.props = node.props || {};
      const key = _key as keyof typeof store;
      if (node && store) {
        needsUpdate = true;
        node.props[key] = store[key];
      }
    });

    let propsHash = JSON.stringify(node.props);
    if (propsHash === lastPropsHash) {
      return;
    }
    lastPropsHash = propsHash;

    if (needsUpdate) {
      manager.execute();
    }
  }

  $effect(() => {
    if (store) {
      updateNode();
    }
  });
</script>

{#if Object.keys(nodeDefinition).length}
  <NestedSettings
    id="activeNodeSettings"
    bind:value={store}
    type={nodeDefinition}
  />
{:else}
  <p class="mx-4">Node has no settings</p>
{/if}
