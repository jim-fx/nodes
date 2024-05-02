<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import { Integer } from "@nodes/ui";
  import { writable } from "svelte/store";
  import { humanizeDuration } from "$lib/helpers";
  import Monitor from "$lib/performance/Monitor.svelte";

  function calculateStandardDeviation(array: number[]) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(
      array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
    );
  }

  export let run: () => Promise<any>;

  let isRunning = false;
  let amount = localStore<number>("nodes.benchmark.samples", 500);
  let samples = 0;
  let warmUp = writable(0);
  let warmUpAmount = 10;
  let state = "";
  let result:
    | { stdev: number; avg: number; duration: number; samples: number[] }
    | undefined;

  const copyContent = async (text?: string | number) => {
    if (!text) return;
    if (typeof text !== "string") {
      text = (Math.floor(text * 100) / 100).toString();
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  async function benchmark() {
    if (isRunning) return;
    isRunning = true;
    result = undefined;
    samples = 0;
    $warmUp = 0;

    await new Promise((r) => setTimeout(r, 50));

    // warm up
    for (let i = 0; i < warmUpAmount; i++) {
      await run();
      $warmUp = i + 1;
    }

    let a = performance.now();
    let results = [];

    // perform run
    for (let i = 0; i < $amount; i++) {
      const a = performance.now();
      await run();
      samples = i;
      const b = performance.now();
      await new Promise((r) => setTimeout(r, 20));
      results.push(b - a);
    }
    result = {
      stdev: calculateStandardDeviation(results),
      samples: results,
      duration: performance.now() - a,
      avg: results.reduce((a, b) => a + b) / results.length,
    };
  }
</script>

{state}

<div class="wrapper" class:running={isRunning}>
  {#if isRunning}
    {#if result}
      <h3>Finished ({humanizeDuration(result.duration)})</h3>
      <div class="monitor-wrapper">
        <Monitor points={result.samples} />
      </div>
      <label for="bench-avg">Average </label>
      <button
        id="bench-avg"
        on:keydown={(ev) => ev.key === "Enter" && copyContent(result?.avg)}
        on:click={() => copyContent(result?.avg)}
        >{Math.floor(result.avg * 100) / 100}</button
      >
      <i
        role="button"
        tabindex="0"
        on:keydown={(ev) => ev.key === "Enter" && copyContent(result?.avg)}
        on:click={() => copyContent(result?.avg)}>(click to copy)</i
      >
      <label for="bench-stdev">Standard Deviation σ</label>
      <button id="bench-stdev" on:click={() => copyContent(result?.stdev)}
        >{Math.floor(result.stdev * 100) / 100}</button
      >
      <i
        role="button"
        tabindex="0"
        on:keydown={(ev) => ev.key === "Enter" && copyContent(result?.avg)}
        on:click={() => copyContent(result?.stdev + "")}>(click to copy)</i
      >
      <div>
        <button on:click={() => (isRunning = false)}>reset</button>
      </div>
    {:else}
      <p>WarmUp ({$warmUp}/{warmUpAmount})</p>
      <progress value={$warmUp} max={warmUpAmount}
        >{Math.floor(($warmUp / warmUpAmount) * 100)}%</progress
      >
      <p>Progress ({samples}/{$amount})</p>
      <progress value={samples} max={$amount}
        >{Math.floor((samples / $amount) * 100)}%</progress
      >
    {/if}
  {:else}
    <label for="bench-samples">Samples</label>
    <Integer id="bench-sample" bind:value={$amount} max={1000} />
    <button on:click={benchmark} disabled={isRunning}> start </button>
  {/if}
</div>

<style>
  .wrapper {
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .monitor-wrapper {
    border: solid thin var(--outline);
    border-bottom: none;
  }
  textarea {
    width: 100%;
    height: 1em;
    font-size: 1em;
    padding: 0.5em;
    border: solid thin var(--outline);
    background: var(--layer-2);
    box-sizing: border-box;
    height: 2.5em;
  }
  i {
    opacity: 0.5;
    font-size: 0.8em;
  }
</style>
