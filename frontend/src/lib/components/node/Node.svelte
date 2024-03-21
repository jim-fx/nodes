<script lang="ts">
  import type { Node } from "$lib/types";
  import { getContext, onMount } from "svelte";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { activeNodeId, selectedNodes } from "../graph/stores";
  import { T } from "@threlte/core";
  import { Color, type Mesh } from "three";
  import NodeFrag from "./Node.frag";
  import NodeVert from "./Node.vert";

  export let node: Node;
  export let inView = true;
  export let z = 2;

  $: isActive = $activeNodeId === node.id;
  $: isSelected = !!$selectedNodes?.has(node.id);

  const updateNodePosition =
    getContext<(n: Node) => void>("updateNodePosition");

  const getNodeHeight = getContext<(n: string) => number>("getNodeHeight");

  const type = node?.tmp?.type;

  const parameters = Object.entries(type?.inputs || {});

  let ref: HTMLDivElement;
  let meshRef: Mesh;

  const height = getNodeHeight(node.type);

  $: if (node && ref && meshRef) {
    node.tmp = node.tmp || {};
    node.tmp.ref = ref;
    node.tmp.mesh = meshRef;
    updateNodePosition(node);
  }

  onMount(() => {
    node.tmp = node.tmp || {};
    node.tmp.ref = ref;
    node.tmp.mesh = meshRef;
    updateNodePosition(node);
  });

  const colorDark = new Color();
  colorDark.setStyle("#151515");
  //colorDark.();

  const colorBright = new Color("#202020");
  //colorBright.convertLinearToSRGB();
</script>

<T.Mesh
  position.x={node.position[0] + 10}
  position.z={node.position[1] + height / 2}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  bind:ref={meshRef}
  visible={z < 7}
>
  <T.PlaneGeometry args={[20, height]} radius={1} />
  <T.ShaderMaterial
    vertexShader={NodeVert}
    fragmentShader={NodeFrag}
    transparent
    uniforms={{
      uColorBright: { value: colorBright },
      uColorDark: { value: colorDark },
      uSelectedColor: { value: new Color("#9d5f28") },
      uActiveColor: { value: new Color("white") },
      uSelected: { value: false },
      uActive: { value: false },
      uStrokeWidth: { value: 1.0 },
      uWidth: { value: 20 },
      uHeight: { value: height },
    }}
    uniforms.uSelected.value={isSelected}
    uniforms.uActive.value={isActive}
    uniforms.uStrokeWidth.value={(7 - z) / 3}
  />
</T.Mesh>

<div
  class="node"
  class:active={isActive}
  class:selected={isSelected}
  class:out-of-view={!inView}
  data-node-id={node.id}
  bind:this={ref}
>
  <NodeHeader {node} />

  {#each parameters as [key, value], i}
    <NodeParameter
      bind:node
      id={key}
      input={value}
      isLast={i == parameters.length - 1}
    />
  {/each}
</div>

<style>
  .node {
    position: absolute;
    box-sizing: border-box;
    user-select: none !important;
    cursor: pointer;
    width: 200px;
    color: var(--text-color);
    transform: translate3d(var(--nx), var(--ny), 0);
    z-index: 1;
    font-weight: 300;
    --stroke: var(--background-color-lighter);
    --stroke-width: 2px;
  }

  .node.active {
    --stroke: white;
    --stroke-width: 1px;
  }

  .node.selected {
    --stroke: #9d5f28;
    --stroke-width: 1px;
  }

  .node.out-of-view {
    display: none;
  }
</style>
