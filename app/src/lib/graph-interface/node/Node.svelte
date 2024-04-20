<script lang="ts">
  import type { Node } from "@nodes/types";
  import { getContext, onMount } from "svelte";
  import NodeHeader from "./NodeHeader.svelte";
  import NodeParameter from "./NodeParameter.svelte";
  import { activeNodeId, selectedNodes } from "../graph/stores.js";
  import { colors } from "../graph/stores";
  import { T } from "@threlte/core";
  import { Color, type Mesh } from "three";
  import NodeFrag from "./Node.frag";
  import NodeVert from "./Node.vert";
  import NodeHtml from "./NodeHTML.svelte";

  export let node: Node;
  export let inView = true;
  export let z = 2;

  $: isActive = $activeNodeId === node.id;
  $: isSelected = !!$selectedNodes?.has(node.id);

  const updateNodePosition =
    getContext<(n: Node) => void>("updateNodePosition");

  const getNodeHeight = getContext<(n: string) => number>("getNodeHeight");

  let meshRef: Mesh;

  const height = getNodeHeight?.(node.type);

  $: if (node && meshRef) {
    node.tmp = node.tmp || {};
    node.tmp.mesh = meshRef;
    updateNodePosition?.(node);
  }

  onMount(() => {
    node.tmp = node.tmp || {};
    node.tmp.mesh = meshRef;
    updateNodePosition?.(node);
  });
</script>

<T.Mesh
  position.x={node.position[0] + 10}
  position.z={node.position[1] + height / 2}
  position.y={0.8}
  rotation.x={-Math.PI / 2}
  bind:ref={meshRef}
  visible={inView && z < 7}
>
  <T.PlaneGeometry args={[20, height]} radius={1} />
  <T.ShaderMaterial
    vertexShader={NodeVert}
    fragmentShader={NodeFrag}
    transparent
    uniforms={{
      uColorBright: { value: new Color("#171717") },
      uColorDark: { value: new Color("#151515") },
      uStrokeColor: { value: new Color("#9d5f28") },
      uStrokeWidth: { value: 1.0 },
      uWidth: { value: 20 },
      uHeight: { value: height },
    }}
    uniforms.uColorBright.value={$colors.layer2}
    uniforms.uColorDark.value={$colors.layer1}
    uniforms.uStrokeColor.value={isSelected
      ? $colors.selected
      : isActive
        ? $colors.active
        : $colors.outline}
    uniforms.uStrokeWidth.value={(7 - z) / 3}
  />
</T.Mesh>

<NodeHtml {node} {inView} {isActive} {isSelected} {z} />
