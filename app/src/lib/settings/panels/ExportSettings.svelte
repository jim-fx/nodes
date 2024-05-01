<script lang="ts">
  import type { Scene } from "three";
  import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
  import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
  import FileSaver from "file-saver";

  // Download
  const download = (
    data: string,
    name: string,
    mimetype: string,
    extension: string,
  ) => {
    if (typeof data !== "string") data = JSON.stringify(data);
    const blob = new Blob([data], { type: mimetype + ";charset=utf-8" });
    FileSaver.saveAs(blob, name + "." + extension);
  };

  // export const json = (data, name = 'default') => {
  //   download(JSON.stringify(data), name, 'application/json', 'json');
  // };
  //
  // export const obj = (data, name = 'default') => {
  // };

  export let scene: Scene;

  function exportGltf() {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        // download .gltf file
        download(gltf, "plant", "text/plain", "gltf");
      },
      (err) => {
        console.log(err);
      },
    );
  }

  function exportObj() {
    const exporter = new OBJExporter();
    const result = exporter.parse(scene);
    // download .obj file
    download(result, "plant", "text/plain", "obj");
  }
</script>

<div class="p-2">
  <button on:click={exportObj}> export obj </button>
  <button on:click={exportGltf}> export gltf </button>
</div>
