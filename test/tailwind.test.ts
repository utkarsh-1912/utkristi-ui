import { createRequire } from 'node:module';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import type { Config } from 'tailwindcss';
import { expect, test } from 'vitest';

const require = createRequire(import.meta.url);

test('published preset emits used component classes ahead of utilities', async () => {
  const preset = require('../dist/tailwind/preset.cjs');
  const result = await postcss([tailwind({
    content: [{ raw: '<button class="btn btn-solid card p-0 font-condensed stretch-condensed bg-accent/50 light:p-2 glass:p-4">' }],
    presets: [preset],
  })]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
  expect(result.css).toContain('.btn {');
  expect(result.css).toContain('var(--ut-solid)');
  expect(result.css).not.toMatch(/\.modal\s*\{/);
  expect(result.css.indexOf('.card {')).toBeLessThan(result.css.indexOf('.p-0 {'));
  expect(result.css).toContain('.font-condensed');
  expect(result.css).toContain('.stretch-condensed');
  expect(result.css).toContain('calc(0.5 * 100%)');
  expect(result.css).toContain('glass\\:p-4');
  expect(result.css).toContain('[data-theme="glass"]');
});

test('plugin works on its own, can skip base defaults, and respects a prefix', async () => {
  const plugin = require('../dist/tailwind/plugin.cjs');
  const config: Config = {
    prefix: 'x-', content: [{ raw: '<button class="x-btn x-btn-solid x-stretch-condensed">' }],
    plugins: [plugin({ base: false })],
  };
  const { css } = await postcss([tailwind(config)]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
  expect(css).toContain('--ut-bg: #0B0B0A');
  expect(css).not.toContain('-webkit-font-smoothing');
  expect(css).toContain('.x-btn-solid:hover');
  expect(css).toContain('.x-stretch-condensed');
});
