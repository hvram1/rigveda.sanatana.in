import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  // GitHub Pages configuration
  site: 'https://hvram1.github.io',
  base: '/rigveda.sanatana.in/',
  vite: {
    css: {
      postcss: {
        plugins: [],
      },
    },
  },
});
