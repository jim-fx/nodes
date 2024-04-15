import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [sveltekit(), glsl(), wasm()],
  ssr: {
    noExternal: ['three'],
  }
})
