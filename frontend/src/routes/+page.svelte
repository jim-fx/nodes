<script lang="ts">
  import App from "$lib/components/App.svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";

  onMount(async () => {
    try {
      const res = await invoke("greet", { name: "Dude" });
      console.log({ res });
    } catch (error) {
      console.log(error);
    }

    try {
      const res2 = await invoke("run_nodes", {});
      console.log({ res2 });
    } catch (error) {
      console.log(error);
    }
  });
</script>

<div>
  <App />
</div>

<style>
  div {
    height: 100vh;
  }

  :global(html) {
    background: rgb(13, 19, 32);
    background: linear-gradient(
      180deg,
      rgba(13, 19, 32, 1) 0%,
      rgba(8, 12, 21, 1) 100%
    );
  }

  :global(body) {
    margin: 0;
    position: relative;
    width: 100vw;
    height: 100vh;
  }
</style>
