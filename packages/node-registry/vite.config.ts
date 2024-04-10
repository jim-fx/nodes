import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [sveltekit(), wasm()],

  server: {
    port: 3001,
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
