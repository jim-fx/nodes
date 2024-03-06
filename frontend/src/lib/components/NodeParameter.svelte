<script lang="ts">
  import type { NodeInput } from "$lib/types";

  export let value: unknown;
  export let input: NodeInput;
  export let label: string;

  export let isLast = false;

  function createPath({ depth = 8, height = 20, y = 50 } = {}) {
    let corner = isLast ? 2 : 0;

    let right_bump = false;
    let left_bump = true;

    return `M0,0
      H100
      V${y - height / 2}
      ${
        right_bump
          ? ` C${100 - depth},${y - height / 2} ${100 - depth},${y + height / 2} 100,${y + height / 2}`
          : ` H100`
      }
      ${
        corner
          ? ` V${100 - corner}
              Q100,100 ${100 - corner / 2},100
              H${corner / 2}
              Q0,100  0,${100 - corner}
            `
          : ` V100
              H0
            `
      }
      ${
        left_bump
          ? ` V${y + height / 2} C${depth},${y + height / 2} ${depth},${y - height / 2} 0,${y - height / 2}`
          : ` H0`
      }
      Z`.replace(/\s+/g, " ");
  }
</script>

<div class="wrapper">
  <div class="content">
    <label>{label}</label>

    <div class="input">input</div>
  </div>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    preserveAspectRatio="none"
    style={`
      --path: path("${createPath({ depth: 5, height: 15, y: 48.2 })}");
      --hover-path: path("${createPath({ depth: 8, height: 24 })}");
    `}
  >
    <path vector-effect="non-scaling-stroke"></path>
  </svg>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    height: 25px;
  }

  .content {
    position: relative;
    padding: 2px 5px;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-around;
    box-sizing: border-box;
  }

  input {
    font-size: 0.5em;
    width: 100%;
    box-sizing: border-box;
  }

  .input {
    width: 100%;
    box-sizing: border-box;
    border-radius: 2px;
    font-size: 0.5em;
    padding: 2px 2px;
    background: #111;
  }

  label {
    font-size: 0.5em;
  }

  svg {
    position: absolute;
    box-sizing: border-box;
    pointer-events: none;
    width: 100%;
    height: 100%;
    overflow: visible;
    top: 0;
    left: 0;
    z-index: -1;
  }

  svg path {
    stroke-width: 0.2px;
    transition: 0.2s;
    fill: #060606;
    stroke: #777;
    stroke-width: 0.1;
    d: var(--path);
  }

  .wrapper:hover svg path {
    d: var(--hover-path) !important;
  }
</style>
