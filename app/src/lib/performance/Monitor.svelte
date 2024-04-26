<script lang="ts">
  export let points: number[];

  export let type = "ms";
  export let title = "Performance";
  export let max: number | undefined = undefined;
  export let min: number | undefined = undefined;

  function getMax(m?: number) {
    if (type === "%") {
      return 100;
    }

    if (m !== undefined) {
      if (m < 1) {
        return Math.floor(m * 100) / 100;
      }
      if (m < 10) {
        return Math.floor(m * 10) / 10;
      }
      return Math.floor(m);
    }

    return 1;
  }

  function constructPath() {
    max = max !== undefined ? max : Math.max(...points);
    min = min !== undefined ? min : Math.min(...points);
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
  <p>{title}</p>
  <span class="min">{Math.floor(min || 0)}{type}</span>
  <span class="max">{getMax(max)}{type}</span>
  <svg preserveAspectRatio="none" viewBox="0 0 100 100">
    {#key points}
      <polyline vector-effect="non-scaling-stroke" points={constructPath()} />
    {/key}
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
