import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";
import comlink from 'vite-plugin-comlink';

export default defineConfig({
  plugins: [
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
