<script lang="ts">
  import type { GraphManager } from "./graph-manager.svelte";
  import { HTML } from "@threlte/extras";
  import { onMount } from "svelte";
  import type { NodeType } from "@nodes/types";

  type Props = {
    position: [x: number, y: number] | null;
    graph: GraphManager;
  };

  let { position = $bindable(), graph }: Props = $props();

  let input: HTMLInputElement;
  let value = $state<string>();
  let activeNodeId = $state<NodeType>();

  const allNodes = graph.getNodeDefinitions();

  function filterNodes() {
    return allNodes.filter((node) => node.id.includes(value ?? ""));
  }

  const nodes = $derived(value === "" ? allNodes : filterNodes());
  $effect(() => {
    if (nodes) {
      if (activeNodeId === undefined) {
        activeNodeId = nodes[0].id;
      } else if (nodes.length) {
        const node = nodes.find((node) => node.id === activeNodeId);
        if (!node) {
          activeNodeId = nodes[0].id;
        }
      }
    }
  });

  function handleKeyDown(event: KeyboardEvent) {
    event.stopImmediatePropagation();

    if (event.key === "Escape") {
      position = null;
      return;
    }

    if (event.key === "ArrowDown") {
      const index = nodes.findIndex((node) => node.id === activeNodeId);
      activeNodeId = nodes[(index + 1) % nodes.length].id;
      return;
    }

    if (event.key === "ArrowUp") {
      const index = nodes.findIndex((node) => node.id === activeNodeId);
      activeNodeId = nodes[(index - 1 + nodes.length) % nodes.length].id;
      return;
    }

    if (event.key === "Enter") {
      if (activeNodeId && position) {
        graph.createNode({ type: activeNodeId, position, props: {} });
        position = null;
      }
      return;
    }
  }

  onMount(() => {
    input.disabled = false;
    setTimeout(() => input.focus(), 50);
  });
</script>

<HTML position.x={position?.[0]} position.z={position?.[1]} transform={false}>
  <div class="add-menu-wrapper">
    <div class="header">
      <input
        id="add-menu"
        type="text"
        aria-label="Search for a node type"
        role="searchbox"
        placeholder="Search..."
        disabled={false}
        onkeydown={handleKeyDown}
        bind:value
        bind:this={input}
      />
    </div>

    <div class="content">
      {#each nodes as node}
        <div
          class="result"
          role="treeitem"
          tabindex="0"
          aria-selected={node.id === activeNodeId}
          onkeydown={(event) => {
            if (event.key === "Enter") {
              if (position) {
                graph.createNode({ type: node.id, position, props: {} });
                position = null;
              }
            }
          }}
          onmousedown={() => {
            if (position) {
              graph.createNode({ type: node.id, position, props: {} });
              position = null;
            }
          }}
          onfocus={() => {
            activeNodeId = node.id;
          }}
          class:selected={node.id === activeNodeId}
          onmouseover={() => {
            activeNodeId = node.id;
          }}
        >
          {node.id.split("/").at(-1)}
        </div>
      {/each}
    </div>
  </div>
</HTML>

<style>
  .header {
    padding: 5px;
  }

  input {
    background: var(--layer-0);
    font-family: var(--font-family);
    border: none;
    border-radius: 5px;
    color: var(--text-color);
    padding: 0.6em;
    width: calc(100% - 2px);
    box-sizing: border-box;
    font-size: 0.8em;
    margin-left: 1px;
    margin-top: 1px;
  }

  input:focus {
    outline: solid 2px rgba(255, 255, 255, 0.2);
  }

  .add-menu-wrapper {
    position: absolute;
    background: var(--layer-1);
    border-radius: 7px;
    overflow: hidden;
    border: solid 2px var(--layer-2);
    width: 150px;
  }
  .content {
    min-height: none;
    width: 100%;
    color: var(--text-color);
  }

  .result {
    padding: 1em 0.9em;
    border-bottom: solid 1px var(--layer-2);
    opacity: 0.7;
    font-size: 0.9em;
    cursor: pointer;
  }

  .result[aria-selected="true"] {
    background: var(--layer-2);
    opacity: 1;
  }
</style>
