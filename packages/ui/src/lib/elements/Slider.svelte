<script lang="ts">
  export let value: number = 0;
  export let min = 0;
  export let max = 10;
  export let step = 0.1;
  export let id: string;
</script>

<input type="range" {id} bind:value {min} {max} {step} />
