<script lang="ts">
  import Grid from "$lib/grid";
  import GraphInterface from "$lib/graph-interface";
  import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
  import { RemoteNodeRegistry } from "$lib/node-registry";
  import * as templates from "$lib/graph-templates";
  import type { Graph } from "@nodes/types";
  import { decode, encode, decodeFloat, encodeFloat } from "@nodes/utils";
  import Viewer from "$lib/viewer/Viewer.svelte";

  globalThis.decode = decode;
  globalThis.encode = encode;
  globalThis.df = decodeFloat;
  globalThis.en = encodeFloat;

  globalThis.ci = function createIndeces(resX: number, stemLength = 1) {
    const index = new Uint16Array(resX * (Math.max(stemLength, 1) - 1) * 6);

    for (let i = 0; i < stemLength; i++) {
      const indexOffset = i * resX * 6;
      const positionOffset = i * resX;
      for (let j = 0; j < resX; j++) {
        const _indexOffset = indexOffset + j * 6;
        const _positionOffset = positionOffset + j;

        console.log(`iio: ${_indexOffset} pio: ${_positionOffset} j: ${j}`);

        if (j === resX - 1) {
          index[_indexOffset + 0] = _positionOffset + 1;
          index[_indexOffset + 1] = _positionOffset - resX + 1;
          index[_indexOffset + 2] = _positionOffset;

          index[_indexOffset + 3] = _positionOffset;
          index[_indexOffset + 4] = _positionOffset + resX;
          index[_indexOffset + 5] = _positionOffset + 1;
        } else {
          index[_indexOffset + 0] = _positionOffset + resX + 1;
          index[_indexOffset + 1] = _positionOffset + 1;
          index[_indexOffset + 2] = _positionOffset;

          index[_indexOffset + 3] = _positionOffset;
          index[_indexOffset + 4] = _positionOffset + resX;
          index[_indexOffset + 5] = _positionOffset + resX + 1;
        }
      }
    }

    return index;
  };

  const nodeRegistry = new RemoteNodeRegistry("http://localhost:3001");
  const runtimeExecutor = new MemoryRuntimeExecutor(nodeRegistry);

  let res: Int32Array;
  let time = 0;

  let graph = localStorage.getItem("graph")
    ? JSON.parse(localStorage.getItem("graph")!)
    : templates.grid(3, 3);

  function handleResult(event: CustomEvent<Graph>) {
    let a = performance.now();
    res = runtimeExecutor.execute(event.detail);
    time = performance.now() - a;
    console.log({ res, time });
  }

  function handleSave(event: CustomEvent<Graph>) {
    localStorage.setItem("graph", JSON.stringify(event.detail));
  }
</script>

<div class="wrapper">
  <header>
    header
    <button
      on:click={() => {
        graph = templates.grid(15, 15);
      }}>grid stress-test</button
    >
  </header>
  <Grid.Row>
    <Grid.Cell>
      <Viewer result={res} />
    </Grid.Cell>
    <Grid.Cell>
      {#key graph}
        <GraphInterface
          registry={nodeRegistry}
          {graph}
          on:result={handleResult}
          on:save={handleSave}
        />
      {/key}
    </Grid.Cell>
  </Grid.Row>
</div>

<style>
  header {
    border-bottom: solid thin white;
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
    color: white;
    display: grid;
    grid-template-rows: 50px 1fr;
  }

  :global(html) {
    background: rgb(13, 19, 32);
    background: linear-gradient(
      180deg,
      rgba(13, 19, 32, 1) 0%,
      rgba(8, 12, 21, 1) 100%
    );
  }

  :global(body) {
    margin: 0;
    position: relative;
  }
</style>
