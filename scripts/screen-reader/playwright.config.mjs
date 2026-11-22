import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import { withGuidepup } from '@guidepup/playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
export default withGuidepup(defineConfig({
  testDir: '.',
  testMatch: 'nvda.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:4174', reducedMotion: 'reduce' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --config docs/vite.config.ts --host 127.0.0.1 --port 4174 --strictPort',
    cwd: root, url: 'http://127.0.0.1:4174', timeout: 60_000,
  },
}));
