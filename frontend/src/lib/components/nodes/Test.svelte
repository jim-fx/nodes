<script context="module" lang="ts">
  export type Props = {
    value: number;
  };
</script>

<script lang="ts">
  export let props = { value: 0 };
</script>

<input type="number" bind:value={props.value} />
