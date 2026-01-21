<script lang="ts">
  import type { Graph } from "$lib/types";
  import { defaultPlant } from "$lib/graph-templates";
  import type { ProjectManager } from "./project-manager.svelte";

  const { projectManager } = $props<{ projectManager: ProjectManager }>();

  let showNewProject = $state(false);
  let newProjectName = $state("");

  function handleCreate() {
    projectManager.handleCreateProject(
      defaultPlant as unknown as Graph,
      newProjectName,
    );
    newProjectName = "";
    showNewProject = false;
  }
</script>

<header
  class="flex justify-between px-4 h-[70px] border-b-1 border-[var(--outline)] items-center"
>
  <h3>Project</h3>
  <button
    class="px-3 py-1 bg-[var(--layer-0)] rounded"
    onclick={() => (showNewProject = !showNewProject)}
  >
    New
  </button>
</header>

{#if showNewProject}
  <div
    class="flex justify-between px-4 h-[70px] border-b-1 border-[var(--outline)] items-center gap-2"
  >
    <input
      type="text"
      bind:value={newProjectName}
      placeholder="Project name"
      class="flex-1 min-w-0 px-2 py-2 bg-gray-800 border border-gray-700 rounded"
      onkeydown={(e) => e.key === "Enter" && handleCreate()}
    />
    <button class="cursor-pointer" onclick={() => handleCreate()}>
      Create
    </button>
  </div>
{/if}

<div class="p-4 text-white min-h-screen">
  {#if projectManager.loading}
    <p>Loading...</p>
  {/if}

  <ul class="space-y-2">
    {#each projectManager.projects as project (project.id)}
      <li>
        <div
          class="w-full text-left px-3 py-2 rounded cursor-pointer {projectManager
            .activeProjectId.value === project.id
            ? 'bg-blue-600'
            : 'bg-gray-800 hover:bg-gray-700'}"
          onclick={() => projectManager.handleSelectProject(project.id!)}
          role="button"
          tabindex="0"
          onkeydown={(e) =>
            e.key === "Enter" &&
            projectManager.handleSelectProject(project.id!)}
        >
          <div class="flex justify-between items-center">
            <span>{project.meta?.title || "Untitled"}</span>
            <button
              class="text-red-400 hover:text-red-300"
              onclick={() => {
                projectManager.handleDeleteProject(project.id!);
              }}
            >
              ×
            </button>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</div>
