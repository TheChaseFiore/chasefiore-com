import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    // This tells Astro NOT to try and find a KV database for sessions
    platformProxy: {
      enabled: true,
    },
    imageService: 'compile'
  }),
});