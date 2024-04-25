<script lang="ts">
  import { browser } from "$app/environment";
  import Monitor from "./Monitor.svelte";
  import { humanizeNumber } from "$lib/helpers";
  import { Checkbox } from "@nodes/ui";

  type PerformanceData = {
    total: Record<string, number>;
    runs: Record<string, number[]>[];
  };

  export let data: PerformanceData;
  export let viewer: PerformanceData;
  let lastRunOnly = true;

  function getTotalPerformance(onlyLast = false) {
    if (onlyLast) {
      return (
        data.runs.at(-1).runtime[0] + viewer.runs.at(-1)["create-geometries"][0]
      );
    }
    return data.total.runtime + viewer.total["create-geometries"];
  }

  function count(input?: number | number[]) {
    if (!input) return 0;
    if (Array.isArray(input))
      return input.reduce((acc, val) => acc + val, 0) / input.length;
    return input;
  }

  function getCacheRatio(onlyLast = false) {
    let ratio = onlyLast
      ? count(data.runs.at(-1)?.["cache-hit"])
      : count(data.total["cache-hit"]);

    return `${Math.floor(ratio * 100)}%`;
  }

  function getPerformanceData(onlyLast: boolean = false) {
    if (onlyLast) {
      return Object.entries(data.runs.at(-1))
        .map(([key, value]) => [key, value[0]])
        .filter(
          ([key]) =>
            !key.startsWith("node/") &&
            key !== "total" &&
            !key.includes("cache"),
        )
        .sort((a, b) => b[1] - a[1]);
    }
    return Object.entries(data.total)
      .sort((a, b) => b[1] - a[1])
      .filter(
        ([key]) =>
          !key.startsWith("node/") && key !== "total" && !key.includes("cache"),
      );
  }

  function getNodePerformanceData(onlyLast: boolean = false) {
    if (onlyLast) {
      return Object.entries(data.runs.at(-1))
        .map(([key, value]) => [key, value[0]])
        .filter(([key]) => key.startsWith("node/"))
        .sort((a, b) => b[1] - a[1]);
    }
    return Object.entries(data.total)
      .filter(([key]) => key.startsWith("node/"))
      .sort((a, b) => b[1] - a[1]);
  }

  function getViewerPerformanceData(onlyLast: boolean = false) {
    if (onlyLast) {
      return Object.entries(viewer.runs.at(-1))
        .map(([key, value]) => [key, value[0]])
        .filter(([key]) => key !== "total-vertices" && key !== "total-faces")
        .sort((a, b) => b[1] - a[1]);
    }
    return Object.entries(viewer.total)
      .filter(([key]) => key !== "total-vertices" && key !== "total-faces")
      .sort((a, b) => b[1] - a[1]);
  }

  function constructPoints(key: keyof (typeof data.runs)[0]) {
    return data.runs.map((run, i) => {
      return run[key][0];
    });
  }
</script>

{#key data}
  {#if browser}
    <Monitor points={constructPoints("runtime")} />
  {/if}

  <div class="p-4">
    <div class="flex items-center gap-2">
      <Checkbox id="show-total" bind:value={lastRunOnly} />
      <label for="show-total">Show Average</label>
    </div>
    {#if data.runs.length !== 0}
      <h3>General</h3>
      <table>
        <tr>
          <td>
            {Math.floor(getTotalPerformance(!lastRunOnly) * 100) / 100}<span
              >ms</span
            >
          </td>
          <td>total</td>
        </tr>
        {#each getPerformanceData(!lastRunOnly) as [key, value]}
          <tr>
            <td>
              {Math.floor(value * 100) / 100}<span>ms</span>
            </td>
            <td>
              {key}
            </td>
          </tr>
        {/each}

        <tr>
          <td> {getCacheRatio(!lastRunOnly)} </td>
          <td>cache hit</td>
        </tr>

        <tr>
          <td>{data.runs.length}</td>
          <td>Samples</td>
        </tr>

        <h3>Nodes</h3>
        {#each getNodePerformanceData(!lastRunOnly) as [key, value]}
          <tr>
            <td>
              {Math.floor(value * 100) / 100}<span>ms</span>
            </td>
            <td>
              {key.split("/").slice(-1).join("/")}
            </td>
          </tr>
        {/each}

        {#if viewer.runs.length}
          <h3>Viewer</h3>
          <tr>
            <td>{humanizeNumber(viewer.runs.at(-1)?.["total-vertices"])}</td>
            <td>Vertices</td>
          </tr>
          <tr>
            <td>{humanizeNumber(viewer.runs.at(-1)?.["total-faces"])}</td>
            <td>Faces</td>
          </tr>
          {#each getViewerPerformanceData(!lastRunOnly) as [key, value]}
            <tr>
              <td>
                {Math.floor(value * 100) / 100}<span>ms</span>
              </td>
              <td>
                {key.split("/").slice(-1).join("/")}
              </td>
            </tr>
          {/each}
        {/if}
      </table>
    {:else}
      <p>No runs available</p>
    {/if}
  </div>
{/key}

<style>
  h3 {
    margin: 0;
    margin-top: 1em;
    margin-bottom: 0.2em;
    margin-left: 3px;
  }
  span {
    opacity: 0.3;
    margin-left: 4px;
  }
  td {
    padding-right: 10px;
    padding-block: 5px;
  }
  tr > td:nth-child(1) {
    text-align: right;
  }
  tr > td:nth-child(2) {
    opacity: 0.5;
  }
</style>
