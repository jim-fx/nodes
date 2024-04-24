<script lang="ts">
  export let theme = "dark";

  $: if (theme !== undefined) {
    const classes = document.body.classList;
    const newClassName = `theme-${theme}`;
    for (const className of classes) {
      if (className.startsWith("theme-") && className !== newClassName) {
        classes.remove(className);
      }
    }
    document.body.classList.add(newClassName);
  }
</script>

<div>
  <slot />
</div>

<style>
  div {
    padding: 1em;
  }
</style>
