import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

const isCloudflare =
  process.env.CF_PAGES === '1' ||
  process.env.DEPLOY_TARGET === 'cloudflare' ||
  process.env.CI === 'true';

export default defineConfig({
  output: 'server',
  adapter: isCloudflare ? cloudflare() : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@astrojs/react/client.js',
        'three',
        'gsap',
        'gsap/ScrollTrigger',
        'lenis',
        '@puckeditor/core',
        'handlebars',
      ],
    },
  },
});
