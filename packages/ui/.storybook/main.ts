import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|ts|svelte)"
  ],

  "addons": [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-essentials",
    "@storybook/addon-themes",
  ],

  "framework": {
    "name": "@storybook/sveltekit",
    "options": {}
  },

  docs: {}
};
export default config;
