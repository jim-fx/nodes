import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import comlink from 'vite-plugin-comlink';
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [
    comlink(),
    UnoCSS(),
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
