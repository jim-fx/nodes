<script lang="ts">
  type Props = {
    labels: string[];
    values: number[];
  };

  const { labels, values }: Props = $props();

  const total = $derived(values.reduce((acc, v) => acc + v, 0));

  let colors = ["red", "green", "blue"];
</script>

<div class="wrapper">
  <div class="bars">
    {#each values as value, i}
      <div class="bar bg-{colors[i]}" style="width: {(value / total) * 100}%;">
        {Math.round(value)}ms
      </div>
    {/each}
  </div>

  <div class="labels mt-2">
    {#each values as _label, i}
      <div class="text-{colors[i]}">{labels[i]}</div>
    {/each}
  </div>
  <span class="bg-red bg-green bg-blue text-red text-green text-blue"></span>
</div>

<style>
  .wrapper {
    margin-block: 1em;
  }

  .bars {
    height: 20px;
    display: flex;
  }

  .bar {
    height: 100%;
    color: black;
    display: flex;
    align-items: center;
    font-size: 0.8em;
    padding-left: 0.4em;
  }
</style>
