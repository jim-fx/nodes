<script lang="ts">
  import type { Group } from "three";
  import type { OBJExporter } from "three/addons/exporters/OBJExporter.js";
  import type { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
  import FileSaver from "file-saver";
  import { appSettings } from "../app-settings.svelte";

  // Download
  const download = (
    data: ArrayBuffer | string,
    name: string,
    mimetype: string,
    extension: string,
  ) => {
    const blob = new Blob([data], { type: mimetype + ";charset=utf-8" });
    FileSaver.saveAs(blob, name + "." + extension);
  };

  export let scene: Group;

  let gltfExporter: GLTFExporter;
  async function exportGltf() {
    const exporter =
      gltfExporter ||
      (await import("three/addons/exporters/GLTFExporter.js").then((m) => {
        gltfExporter = new m.GLTFExporter();
        return gltfExporter;
      }));

    exporter.parse(
      scene,
      (gltf) => {
        // download .gltf file
        download(gltf as ArrayBuffer, "plant", "text/plain", "gltf");
      },
      (err) => {
        console.log(err);
      },
    );
  }

  let objExporter: OBJExporter;

  async function exportObj() {
    const exporter =
      objExporter ||
      (await import("three/addons/exporters/OBJExporter.js").then((m) => {
        objExporter = new m.OBJExporter();
        return objExporter;
      }));
    const result = exporter.parse(scene);
    // download .obj file
    download(result, "plant", "text/plain", "obj");
  }


</script>

<div class="p-2">
  <button on:click={exportObj}> export obj </button>
  <button on:click={exportGltf}> export gltf </button>
</div>
