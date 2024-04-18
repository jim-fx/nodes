<script lang="ts">
  export let title = "Details";
  export let transparent = false;
</script>

<details class:transparent>
  <summary>{title}</summary>
  <div class="content">
    <slot />
  </div>
</details>

<style>
  details {
    padding: 1em;
    color: var(--text-color);
    padding-left: 20px;
    background-color: #202020;
    outline: solid 0.1px white;
    border-radius: 2px;
    font-weight: 300;
    font-size: 0.9em;
  }

  details.transparent {
    background-color: transparent;
    padding: 0;
    outline: none;
  }

  .content {
    padding-left: 12px;
  }
</style>
