<script lang="ts">
  import Monitor from "./Monitor.svelte";
  import { humanizeNumber } from "$lib/helpers";
  import { Checkbox } from "@nodes/ui";
  import localStore from "$lib/helpers/localStore";
  import { type PerformanceData } from "./store";

  export let data: PerformanceData;

  let activeType = localStore<string>("nodes.performance.active-type", "total");
  let showAverage = true;

  function getAverage(key: string) {
    return (
      data
        .map((run) => run[key]?.[0])
        .filter((v) => v !== undefined)
        .reduce((acc, run) => acc + run, 0) / data.length
    );
  }

  function round(v: number) {
    if (v < 1) {
      return Math.floor(v * 100) / 100;
    }
    if (v < 10) {
      return Math.floor(v * 10) / 10;
    }
    return Math.floor(v);
  }

  function getAverages() {
    let lastRun = data.at(-1);
    if (!lastRun) return {};
    return Object.keys(lastRun).reduce(
      (acc, key) => {
        acc[key] = getAverage(key);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  function getLast(key: string) {
    return data.at(-1)?.[key][0] || 0;
  }

  function getLasts() {
    return data.at(-1) || {};
  }

  function getTotalPerformance(onlyLast = false) {
    if (onlyLast) {
      return (
        getLast("runtime") +
        getLast("create-geometries") +
        getLast("worker-transfer")
      );
    }
    return (
      getAverage("runtime") +
      getAverage("create-geometries") +
      getAverage("worker-transfer")
    );
  }

  function getCacheRatio(onlyLast = false) {
    let ratio = onlyLast ? getLast("cache-hit") : getAverage("cache-hit");

    return Math.floor(ratio * 100);
  }

  const viewerKeys = [
    "total-vertices",
    "total-faces",
    "create-geometries",
    "split-result",
  ];

  function getPerformanceData(onlyLast: boolean = false) {
    let data = onlyLast ? getLasts() : getAverages();

    return Object.entries(data)
      .filter(
        ([key]) =>
          !key.startsWith("node/") &&
          key !== "total" &&
          !key.includes("cache") &&
          !viewerKeys.includes(key),
      )
      .sort((a, b) => b[1] - a[1]);
  }

  function getNodePerformanceData(onlyLast: boolean = false) {
    let data = onlyLast ? getLasts() : getAverages();

    return Object.entries(data)
      .filter(([key]) => key.startsWith("node/"))
      .sort((a, b) => b[1] - a[1]);
  }

  function getViewerPerformanceData(onlyLast: boolean = false) {
    let data = onlyLast ? getLasts() : getAverages();
    return Object.entries(data)
      .filter(
        ([key]) =>
          key !== "total-vertices" &&
          key !== "total-faces" &&
          viewerKeys.includes(key),
      )
      .sort((a, b) => b[1] - a[1]);
  }

  function getTotalPoints() {
    if (showAverage) {
      return data.map((run) => {
        return (
          run["runtime"].reduce((acc, v) => acc + v, 0) +
          run["create-geometries"].reduce((acc, v) => acc + v, 0) +
          run["worker-transfer"].reduce((acc, v) => acc + v, 0)
        );
      });
    }

    return data.map((run) => {
      return (
        run["runtime"][0] +
        run["create-geometries"][0] +
        run["worker-transfer"][0]
      );
    });
  }

  function constructPoints(key: string) {
    if (key === "total") {
      return getTotalPoints();
    }
    return data.map((run) => {
      if (key in run) {
        if (showAverage) {
          return run[key].reduce((acc, v) => acc + v, 0) / run[key].length;
        } else {
          return run[key][0];
        }
      }
      return 0;
    });
  }

  function getTitle(t: string) {
    if (t.includes("/")) {
      return `Node ${t.split("/").slice(-1).join("/")}`;
    }

    return t
      .split("-")
      .map((v) => v[0].toUpperCase() + v.slice(1))
      .join(" ");
  }
</script>

{#key $activeType && data}
  {#if $activeType === "cache-hit"}
    <Monitor
      title="Cache Hits"
      points={constructPoints($activeType)}
      min={0}
      max={1}
      type="%"
    />
  {:else}
    <Monitor
      title={getTitle($activeType)}
      points={constructPoints($activeType)}
    />
  {/if}

  <div class="p-4">
    <div class="flex items-center gap-2">
      <Checkbox id="show-total" bind:value={showAverage} />
      <label for="show-total">Show Average</label>
    </div>
    {#if data.length !== 0}
      <h3>General</h3>
      <table>
        <tr>
          <td>
            {round(getTotalPerformance(!showAverage))}<span>ms</span>
          </td>
          <td
            class:active={$activeType === "total"}
            on:click={() => ($activeType = "total")}
          >
            total<span
              >({Math.floor(1000 / getTotalPerformance(showAverage))}fps)</span
            >
          </td>
        </tr>
        {#each getPerformanceData(!showAverage) as [key, value]}
          <tr>
            <td>
              {round(value)}<span>ms</span>
            </td>
            <td
              class:active={$activeType === key}
              on:click={() => ($activeType = key)}
            >
              {key}
            </td>
          </tr>
        {/each}

        <tr>
          <td>{data.length}</td>
          <td>Samples</td>
        </tr>

        <h3>Nodes</h3>
        <tr>
          <td> {getCacheRatio(!showAverage)}<span>%</span> </td>
          <td
            class:active={$activeType === "cache-hit"}
            on:click={() => ($activeType = "cache-hit")}>cache hits</td
          >
        </tr>
        {#each getNodePerformanceData(!showAverage) as [key, value]}
          <tr>
            <td>
              {round(value)}<span>ms</span>
            </td>

            <td
              class:active={$activeType === key}
              on:click={() => ($activeType = key)}
            >
              {key.split("/").slice(-1).join("/")}
            </td>
          </tr>
        {/each}

        <h3>Viewer</h3>
        <tr>
          <td>{humanizeNumber(getLast("total-vertices"))}</td>
          <td>Vertices</td>
        </tr>
        <tr>
          <td>{humanizeNumber(getLast("total-faces"))}</td>
          <td>Faces</td>
        </tr>
        {#each getViewerPerformanceData(!showAverage) as [key, value]}
          <tr>
            <td>
              {round(value)}<span>ms</span>
            </td>
            <td
              class:active={$activeType === key}
              on:click={() => ($activeType = key)}
            >
              {key.split("/").slice(-1).join("/")}
            </td>
          </tr>
        {/each}
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
  td.active {
    font-weight: bold;
  }
  tr > td:nth-child(1) {
    text-align: right;
  }
  tr > td:nth-child(2) {
    opacity: 0.5;
  }
</style>
