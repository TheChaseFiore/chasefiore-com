import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.chasefiore.com',
  output: 'static',
  vite: {
    build: { chunkSizeWarningLimit: 1000 },
  },
});