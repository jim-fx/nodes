<script lang="ts">
  import localStore from "$lib/helpers/localStore";
  import { Integer } from "@nodes/ui";
  import { writable } from "svelte/store";

  export let run: () => Promise<any>;

  let isRunning = false;
  let amount = localStore<number>("nodes.benchmark.samples", 500);
  let samples = 0;
  let warmUp = writable(0);
  let warmUpAmount = 10;
  let state = "";
  let result = "";

  const copyContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  async function benchmark() {
    if (isRunning) return;
    isRunning = true;

    samples = 0;
    $warmUp = 0;

    await new Promise((r) => setTimeout(r, 100));

    // warm up
    for (let i = 0; i < warmUpAmount; i++) {
      await run();
      $warmUp = i + 1;
    }

    let results = [];

    // perform run
    for (let i = 0; i < $amount; i++) {
      const a = performance.now();
      await run();
      samples = i;
      const b = performance.now();
      results.push(b - a);
      console.log(b - a);
    }
    result = results.join(" ");
  }
</script>

{state}

<div class="wrapper" class:running={isRunning}>
  {#if isRunning}
    <p>WarmUp ({$warmUp}/{warmUpAmount})</p>
    <progress value={$warmUp} max={warmUpAmount}
      >{Math.floor(($warmUp / warmUpAmount) * 100)}%</progress
    >
    <p>Progress ({samples}/{$amount})</p>
    <progress value={samples} max={$amount}
      >{Math.floor((samples / $amount) * 100)}%</progress
    >

    {#if result}
      <textarea readonly>{result}</textarea>
      <div>
        <button on:click={() => copyContent(result)}>Copy</button>
        <button on:click={() => (isRunning = false)}>reset</button>
      </div>
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
</style>
