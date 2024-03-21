<script lang="ts">
  import type { GraphManager } from "$lib/graph-manager";
  import { HTML } from "@threlte/extras";
  import { onMount } from "svelte";

  export let position: [x: number, y: number] | null;

  export let graph: GraphManager;

  let input: HTMLInputElement;
  let value: string = "";
  let activeNodeId: string = "";

  const allNodes = graph.getNodeTypes();

  function filterNodes() {
    return allNodes.filter((node) => node.id.includes(value));
  }

  $: nodes = value === "" ? allNodes : filterNodes();
  $: if (nodes) {
    if (activeNodeId === "") {
      activeNodeId = nodes[0].id;
    } else if (nodes.length) {
      const node = nodes.find((node) => node.id === activeNodeId);
      if (!node) {
        activeNodeId = nodes[0].id;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    event.stopImmediatePropagation();
    const value = (event.target as HTMLInputElement).value;

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
        graph.createNode({ type: activeNodeId, position });
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
  <div class="wrapper">
    <div class="header">
      <input
        id="add-menu"
        type="text"
        aria-label="Search for a node type"
        role="searchbox"
        placeholder="Search..."
        disabled={false}
        on:keydown={handleKeyDown}
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
          on:keydown={(event) => {
            if (event.key === "Enter") {
              if (position) {
                graph.createNode({ type: node.id, position });
                position = null;
              }
            }
          }}
          on:mousedown={() => {
            if (position) {
              graph.createNode({ type: node.id, position });
              position = null;
            }
          }}
          on:focus={() => {
            activeNodeId = node.id;
          }}
          class:selected={node.id === activeNodeId}
          on:mouseover={() => {
            activeNodeId = node.id;
          }}
        >
          {node.id}
        </div>
      {/each}
    </div>
  </div>
</HTML>

<style>
  input {
    background: var(--background-color-lighter);
    font-family: var(--font-family);
    border: none;
    color: var(--text-color);
    padding: 0.8em;
    width: calc(100% - 2px);
    box-sizing: border-box;
    font-size: 1em;
    margin-left: 1px;
    margin-top: 1px;
  }

  input:focus {
    outline: solid 2px rgba(255, 255, 255, 0.2);
  }

  .wrapper {
    position: absolute;
    background: var(--background-color);
    border-radius: 7px;
    overflow: hidden;
    border: solid 2px var(--background-color-lighter);
    width: 150px;
  }
  .content {
    min-height: none;
    width: 100%;
    color: var(--text-color);
  }

  .result {
    padding: 1em 0.9em;
    border-bottom: solid 1px var(--background-color-lighter);
    opacity: 0.7;
    font-size: 0.9em;
    cursor: pointer;
  }

  .result[aria-selected="true"] {
    background: var(--background-color-lighter);
    opacity: 1;
  }
</style>
