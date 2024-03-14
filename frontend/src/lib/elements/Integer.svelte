<script lang="ts">
  export let value: number = 0;
  export let min = 0;
  export let max = 10;
  export let step = 1;
</script>

<input type="number" bind:value {min} {max} {step} />

