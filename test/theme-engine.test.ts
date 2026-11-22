import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, test } from 'vitest';
import { checkTheme, createTheme, toCSS, toDTCG, toTailwindV4, type ThemeScheme } from '../src/react/theme-engine/index.js';

const night = postcss.parse(readFileSync('src/styles/tokens.css', 'utf8')).nodes
  .find((node): node is postcss.Rule => node.type === 'rule' && node.selector.includes('[data-theme="dark"]') && node.selector.startsWith(':root'))!;
const nightKeys = night.nodes.flatMap((node) => (node.type === 'decl' && node.prop.startsWith('--ut-') ? [node.prop] : []));

// Deterministic pseudo-random brands so failures reproduce.
function* brands(count: number) {
  let seed = 7;
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    yield '#' + (seed % 0xffffff).toString(16).padStart(6, '0');
  }
}

test('generated themes define every token the built-in Night theme defines', () => {
  const theme = createTheme({ brand: '#7C3AED', name: 'violet' });
  expect(nightKeys.filter((key) => !(key in theme.tokens))).toEqual([]);
});

test.each<[ThemeScheme, 'AA' | 'AAA', number]>([['dark', 'AA', 500], ['light', 'AA', 500], ['dark', 'AAA', 150], ['light', 'AAA', 150]])(
  'random brands produce zero contrast failures (%s, %s, %i brands)', (scheme, level, count) => {
    const failures: string[] = [];
    for (const brand of brands(count)) {
      const theme = createTheme({ brand, scheme, contrast: level });
      for (const check of theme.report) if (!check.pass) failures.push(`${brand} ${check.pair} ${check.ratio} < ${check.target}`);
    }
    expect(failures.slice(0, 10)).toEqual([]);
  });

test('extreme brands (white, black, pure primaries) still pass', () => {
  for (const brand of ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#808080']) {
    for (const scheme of ['dark', 'light'] as const) {
      const failing = createTheme({ brand, scheme }).report.filter((check) => !check.pass);
      expect(failing, `${brand} ${scheme}`).toEqual([]);
    }
  }
});

test('the checker agrees with the built-in Night theme', () => {
  const tokens = Object.fromEntries(night.nodes.flatMap((node) => (node.type === 'decl' ? [[node.prop, node.value]] : [])));
  const failing = checkTheme(tokens).filter((check) => !check.pass && !check.pair.startsWith('hue-'));
  expect(failing).toEqual([]);
});

test('exporters produce CSS, Tailwind 4 and DTCG output', () => {
  const theme = createTheme({ brand: '#0EA5E9', name: 'Ocean Blue', scheme: 'light', radius: { card: 10 } });
  expect(theme.name).toBe('ocean-blue');
  const css = toCSS(theme);
  expect(css).toContain('.ocean-blue, [data-theme="ocean-blue"] {');
  expect(css).toContain('--ut-r: 10px;');
  expect(() => postcss.parse(css)).not.toThrow();
  expect(toTailwindV4(theme)).toContain('@custom-variant ocean-blue');
  const dtcg = toDTCG(theme) as Record<string, { color: Record<string, { $type: string; $value: string }> }>;
  expect(dtcg['ocean-blue'].color.accent).toEqual({ $type: 'color', $value: theme.tokens['--ut-accent'] });
});

test('invalid brand colours are rejected with a clear message', () => {
  expect(() => createTheme({ brand: 'blue' })).toThrow(/#rgb or #rrggbb/);
});
