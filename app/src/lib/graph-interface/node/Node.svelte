<script lang="ts">
  import type { Node } from "@nodes/types";
  import { getContext, onMount } from "svelte";
  import { getGraphState } from "../graph/state.svelte";
  import { T } from "@threlte/core";
  import { type Mesh } from "three";
  import NodeFrag from "./Node.frag";
  import NodeVert from "./Node.vert";
  import NodeHtml from "./NodeHTML.svelte";
  import { colors } from "../graph/colors.svelte";
  import { appSettings } from "$lib/settings/app-settings.svelte";

  const graphState = getGraphState();

  type Props = {
    node: Node;
    inView: boolean;
    z: number;
  };
  let { node = $bindable(), inView, z }: Props = $props();

  const isActive = $derived(graphState.activeNodeId === node.id);
  const isSelected = $derived(graphState.selectedNodes.has(node.id));
  let strokeColor = $state(colors.selected);
  $effect(() => {
    appSettings.theme;
    strokeColor = isSelected
      ? colors.selected
      : isActive
        ? colors.active
        : colors.outline;
  });

  const updateNodePosition =
    getContext<(n: Node) => void>("updateNodePosition");

  const getNodeHeight = getContext<(n: string) => number>("getNodeHeight");

  let meshRef: Mesh | undefined = $state();

  const height = getNodeHeight?.(node.type);

  $effect(() => {
    node.tmp.mesh = meshRef;
  });

  onMount(() => {
    if (!node.tmp) node.tmp = {};
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
      uColorBright: { value: colors["layer-2"] },
      uColorDark: { value: colors["layer-1"] },
      uStrokeColor: { value: colors.outline.clone() },
      uStrokeWidth: { value: 1.0 },
      uWidth: { value: 20 },
      uHeight: { value: height },
    }}
    uniforms.uStrokeColor.value={strokeColor.clone()}
    uniforms.uStrokeWidth.value={(7 - z) / 3}
  />
</T.Mesh>

<NodeHtml bind:node {inView} {isActive} {isSelected} {z} />
