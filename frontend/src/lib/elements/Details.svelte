<script lang="ts">
  export let title = "Details";
</script>

<details>
  <summary>{title}</summary>

  <slot />
</details>

<style>
  details {
    padding: 1em;
    color: white;
    outline: solid 0.1px white;
    border-radius: 2px;
    font-weight: 300;
    font-size: 0.9em;
  }
</style>
