<script lang="ts">
  export let points: number[];

  $: max = Math.max(...points);
  $: min = Math.min(...points);
  function constructPath() {
    return points
      .map((point, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = 100 - ((point - min) / (max - min)) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }
</script>

<div class="wrapper">
  <p>Runtime Execution</p>
  <span class="min">{min}ms</span>
  <span class="max">{max}ms</span>
  <svg preserveAspectRatio="none" viewBox="0 0 100 100">
    <polyline vector-effect="non-scaling-stroke" points={constructPath()} />
  </svg>
</div>

<style>
  span {
    position: absolute;
    right: 10px;
    font-size: 0.8em;
    opacity: 0.5;
  }

  .max {
    top: 4px;
  }

  .min {
    bottom: 5px;
  }

  .wrapper {
    position: relative;
    border-bottom: solid thin var(--outline);
    display: flex;
  }
  p {
    margin: 0px;
    top: 3px;
    left: 5px;
    font-size: 0.9em;
    opacity: 0.5;
    position: absolute;
  }
  svg {
    height: 124px;
    margin: 24px 0px;
    border-top: solid thin var(--outline);
    border-bottom: solid thin var(--outline);
    width: 100%;
  }
  polyline {
    fill: none;
    stroke: var(--layer-3);
    opacity: 0.5;
    stroke-width: 1;
  }
</style>
