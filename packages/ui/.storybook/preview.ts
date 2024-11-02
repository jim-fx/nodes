import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from '@storybook/svelte';

import "../src/lib/app.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withThemeByClassName({
    themes: {
      dark: 'theme-dark',
      light: 'theme-light',
      catppuccin: 'theme-catppuccin',
      solarized: 'theme-solarized',
      high: 'theme-high-contrast',
      nord: 'theme-nord',
      dracula: 'theme-dracula',
    },
    defaultTheme: 'light',
  })],
};

export default preview;
