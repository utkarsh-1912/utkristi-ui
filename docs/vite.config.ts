import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { docsPlayground } from './playground-plugin';
import { docsStatusRoutes } from './status-routes';
// @ts-expect-error The development preset is handwritten ESM.
import preset from '../src/tailwind/preset.js';

const docs = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/');
const source = fileURLToPath(new URL('../src/react/', import.meta.url)).replaceAll('\\', '/');

export default defineConfig({
  root: docs,
  base: './',
  appType: 'mpa',
  plugins: [react(), docsPlayground(docs, source), docsStatusRoutes],
  resolve: { alias: { '@utkristi/ui': `${source}index.ts` } },
  css: {
    postcss: { plugins: [tailwindcss({
      content: [`${docs}index.html`, `${docs}src/**/*.{ts,tsx}`, `${source}**/*.{ts,tsx}`],
      presets: [preset],
    }), autoprefixer()] },
  },
});
