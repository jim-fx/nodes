import { defineConfig } from 'histoire'
import { HstSvelte } from '@histoire/plugin-svelte'

export default defineConfig({
  setupFile: '/src/histoire.setup.ts',
  storyMatch: [
    './src/lib/**/*.story.svelte',
  ],
  plugins: [
    HstSvelte(),
  ],
})
