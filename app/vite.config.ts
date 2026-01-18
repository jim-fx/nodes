import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import comlink from 'vite-plugin-comlink';
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [
    tailwindcss(),
    comlink(),
    sveltekit(),
    glsl(),
    wasm()
  ],
  worker: {
    plugins: () => ([
      comlink()
    ])
  },
  ssr: {
    noExternal: ['three'],
  }
})
