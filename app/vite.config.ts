import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";
import comlink from 'vite-plugin-comlink';
import UnoCSS from 'unocss/vite'

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
