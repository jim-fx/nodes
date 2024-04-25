<script lang="ts">
  import { browser } from "$app/environment";
  import Monitor from "./Monitor.svelte";
  import { humanizeNumber } from "$lib/helpers";

  type PerformanceData = {
    total: Record<string, number>;
    runs: Record<string, number[]>[];
  };

  export let data: PerformanceData;
  export let viewer: PerformanceData;

  function getPerformanceData() {
    return Object.entries(data.total)
      .sort((a, b) => b[1] - a[1])
      .filter(([key]) => !key.startsWith("node/"));
  }

  function getNodePerformanceData() {
    return Object.entries(data.total)
      .filter(([key]) => key.startsWith("node/"))
      .sort((a, b) => b[1] - a[1]);
  }

  function getViewerPerformanceData() {
    return Object.entries(viewer.total)
      .filter(([key]) => key !== "total-vertices" && key !== "total-faces")
      .sort((a, b) => b[1] - a[1]);
  }

  function constructPoints(key: keyof (typeof data.runs)[0]) {
    return data.runs
      .map((run, i) => {
        return run[key][0];
      })
      .slice(-100);
  }
</script>

{#key data}
  {#if browser}
    <Monitor points={constructPoints("total")} />
  {/if}

  <div class="px-4">
    {#if data.runs.length !== 0}
      <h3>General</h3>
      <table>
        {#each getPerformanceData() as [key, value]}
          <tr>
            <td>
              {Math.floor(value * 100) / 100}<span>ms</span>
            </td>
            <td>
              {key}
            </td>
          </tr>
        {/each}

        <h3>Nodes</h3>
        {#each getNodePerformanceData() as [key, value]}
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
          {#each getViewerPerformanceData() as [key, value]}
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
