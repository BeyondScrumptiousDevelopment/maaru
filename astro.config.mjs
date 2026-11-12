// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Make values from .env visible here (Cloudflare passes its variables as real env vars).
const fileEnv = loadEnv(process.env.NODE_ENV === 'development' ? 'development' : 'production', process.cwd(), '');
for (const [k, v] of Object.entries(fileEnv)) if (process.env[k] === undefined) process.env[k] = v;

const { projectId, dataset, sanityEnabled } = await import('./src/sanity/env.ts');

/** Sanity + its embedded Studio at /admin — only once a project ID is set (src/sanity/env.ts). */
const sanityIntegrations = [];
if (sanityEnabled) {
  const { default: sanity } = await import('@sanity/astro');
  const { default: react } = await import('@astrojs/react');
  sanityIntegrations.push(sanity({ projectId, dataset, useCdn: false, studioBasePath: '/admin' }), react());
}

export default defineConfig({
  site: 'https://maaru.me',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [...sanityIntegrations, sitemap({ filter: (page) => !page.includes('/admin') })],
  devToolbar: { enabled: false },
});
