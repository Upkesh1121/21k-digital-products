// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://21k.in',
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
});
