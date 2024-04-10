import { sveltekit } from '@sveltejs/kit/vite';
import glsl from "vite-plugin-glsl";
import { defineConfig } from 'vite';
import { exec } from 'child_process';
const dev = import.meta.env;

export default defineConfig({
  plugins: [sveltekit(), glsl(), {
    name: 'postbuild-commands', // the name of your custom plugin. Could be anything.
    closeBundle: async () => {
      return;
      // run pnpm run package
      exec('pnpm run package', (err, stdout, stderr) => {
        console.log(stdout);
      });
    }
  },]
});
