import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    build: { chunkSizeWarningLimit: 1000 },
  },
});