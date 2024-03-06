<script lang="ts">
  import type { Graph, Node } from "$lib/types";
  import Edge from "./Edge.svelte";
  import { T, useTask } from "@threlte/core";
  import { settings } from "$lib/stores/settings";
  import type { OrthographicCamera } from "three";
  import { HTML, OrbitControls } from "@threlte/extras";
  import { onMount } from "svelte";
  import BackgroundVert from "./Background.vert";
  import BackgroundFrag from "./Background.frag";
  import { max } from "three/examples/jsm/nodes/Nodes.js";

  export let camera: OrthographicCamera;

  export let graph: Graph;

  let cx = 0;
  let cy = 0;
  let cz = 30;
  let bw = 2;
  let bh = 2;

  const minZoom = 4;
  const maxZoom = 150;

  let width = globalThis?.innerWidth || 100;
  let height = globalThis?.innerHeight || 100;

  let mouseX = 0;
  let mouseY = 0;

  let mouseDown = false;
  let mouseDownX = 0;
  let mouseDownY = 0;

  let activeNodeId: string;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "a") {
      $settings.useHtml = !$settings.useHtml;
    }
  }

  function snapToGrid(value: number) {
    return Math.round(value / 2.5) * 2.5;
  }

  function handleMouseMove(event: MouseEvent) {
    cx = camera.position.x || 0;
    cy = camera.position.z || 0;
    cz = camera.zoom || 30;
    mouseX = cx + (event.clientX - width / 2) / cz;
    mouseY = cy + (event.clientY - height / 2) / cz;

    if (activeNodeId && mouseDown) {
      graph.nodes = graph.nodes.map((node) => {
        if (node.id === activeNodeId) {
          node.position.x =
            (node?.tmp?.downX || 0) + (event.clientX - mouseDownX) / cz;
          node.position.y =
            (node?.tmp?.downY || 0) + (event.clientY - mouseDownY) / cz;

          if (event.ctrlKey) {
            node.position.x = snapToGrid(node.position.x);
            node.position.y = snapToGrid(node.position.y);
          }

          edges = [...edges];
        }
        return node;
      });
    }
  }

  let edges: [Node, Node][] = [];
  function calculateEdges() {
    edges = graph.edges
      .map((edge) => {
        const from = graph.nodes.find((node) => node.id === edge.from);
        const to = graph.nodes.find((node) => node.id === edge.to);
        if (!from || !to) return;
        return [from, to] as const;
      })
      .filter(Boolean) as unknown as [Node, Node][];
  }

  calculateEdges();

  function handleMouseDown(ev: MouseEvent) {
    activeNodeId = ev?.target?.dataset?.nodeId;
    mouseDown = true;
    mouseDownX = ev.clientX;
    mouseDownY = ev.clientY;
    const node = graph.nodes.find((node) => node.id === activeNodeId);
    if (!node) return;
    node.tmp = node.tmp || {};
    node.tmp.downX = node.position.x;
    node.tmp.downY = node.position.y;
  }

  function handleMouseUp() {
    mouseDown = false;
  }

  function updateCameraProps() {
    cx = camera.position.x || 0;
    cy = camera.position.z || 0;
    cz = camera.zoom || 30;
    width = window.innerWidth;
    height = window.innerHeight;
    bw = width / cz;
    bh = height / cz;
  }

  onMount(() => {
    updateCameraProps();
  });
</script>

<svelte:window
  on:keydown={handleKeyDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:wheel={updateCameraProps}
  on:resize={updateCameraProps}
/>

{#if true}
  <T.Group position.x={mouseX} position.z={mouseY}>
    <T.Mesh rotation.x={-Math.PI / 2} position.y={0.2}>
      <T.CircleGeometry args={[0.5, 16]} />
      <T.MeshBasicMaterial color="green" />
    </T.Mesh>
  </T.Group>
{/if}

<T.Group position.x={cx} position.z={cy} position.y={-1.0}>
  <T.Mesh rotation.x={-Math.PI / 2} position.y={0.2} scale.x={bw} scale.y={bh}>
    <T.PlaneGeometry args={[1, 1]} />
    <T.ShaderMaterial
      transparent
      vertexShader={BackgroundVert}
      fragmentShader={BackgroundFrag}
      uniforms={{
        cx: {
          value: 0,
        },
        cy: {
          value: 0,
        },
        cz: {
          value: 30,
        },
        minz: {
          value: minZoom,
        },
        maxz: {
          value: maxZoom,
        },
        height: {
          value: 100,
        },
        width: {
          value: 100,
        },
      }}
      uniforms.cx.value={cx}
      uniforms.cy.value={cy}
      uniforms.cz.value={cz}
      uniforms.width.value={width}
      uniforms.height.value={height}
    />
  </T.Mesh>
</T.Group>

<T.OrthographicCamera
  bind:ref={camera}
  makeDefault
  position={[0, 1, 0]}
  zoom={30}
>
  <OrbitControls
    enableZoom={true}
    target.y={0}
    rotateSpeed={0}
    minPolarAngle={0}
    maxPolarAngle={0}
    enablePan={true}
    zoomToCursor
    {maxZoom}
    {minZoom}
  />
</T.OrthographicCamera>

{#each edges as edge}
  <Edge from={edge[0]} to={edge[1]} />
{/each}

<HTML transform={false}>
  <div class="wrapper" style={`--cz: ${cz}`} on:mousedown={handleMouseDown}>
    {#each graph.nodes as node}
      <div
        class="node"
        data-node-id={node.id}
        style={`--nx:${node.position.x * 10}px;
                --ny: ${node.position.y * 10}px`}
      >
        {node.id}
      </div>
    {/each}
  </div>
</HTML>

<style>
  :global(body) {
    overflow: hidden;
  }

  .wrapper {
    position: absolute;
    z-index: 100;
    width: 0px;
    height: 0px;
    transform: scale(calc(var(--cz) * 0.1));
  }

  .node {
    position: absolute;
    border-radius: 1px;
    user-select: none !important;
    cursor: pointer;
    width: 50px;
    height: 25px;
    background: linear-gradient(-11.1grad, #000 0%, #0b0b0b 100%);
    color: white;
    transform: translate(var(--nx), var(--ny));
    z-index: 1;
    box-shadow: 0px 0px 0px calc(15px / var(--cz)) rgba(255, 255, 255, 0.3);
    font-weight: 300;
    font-size: 0.5em;
  }

  .node::after {
    /* content: ""; */
    position: absolute;
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 2px;
    transform: scale(1.01);
    top: 0;
    left: 0;
    z-index: -1;
  }
</style>
