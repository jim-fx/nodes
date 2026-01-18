<script lang="ts">
  import Grid from "$lib/grid";
  import Panel from "$lib/sidebar/Panel.svelte";
  import Sidebar from "$lib/sidebar/Sidebar.svelte";
</script>

<Grid.Row>
  <Grid.Cell></Grid.Cell>
  <Grid.Cell>
    <Sidebar>
      <Panel
        id="node-store"
        classes="text-green-400"
        title="Node Store"
        icon="i-[tabler--database]"
      >
        <div class="p-4">
          <input type="text" class="bg-red rounded-sm p-2" />
        </div>
      </Panel>
    </Sidebar>
  </Grid.Cell>
</Grid.Row>

<style>
  :global body {
    height: 100vh;
  }
</style>
