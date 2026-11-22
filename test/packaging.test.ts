import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import postcss from 'postcss';
import { expect, test } from 'vitest';

const reactDir = join(process.cwd(), 'src', 'react');
const clientOnly = /\buse[A-Z][A-Za-z]*\(|createContext|createPortal|\bon[A-Z][a-z]+=\{|addEventListener|window\.|document\./;

function modules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'generated') return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return modules(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

test('every React module that needs the browser is marked for Next.js server components', () => {
  const missing = modules(reactDir).filter((file) => {
    const source = readFileSync(file, 'utf8');
    return clientOnly.test(source) && !source.startsWith("'use client';");
  });
  expect(missing.map((file) => file.slice(reactDir.length + 1))).toEqual([]);
});

test("'use client' modules avoid export *, which Next.js rejects at a client boundary", () => {
  const offenders = modules(reactDir).filter((file) => {
    const source = readFileSync(file, 'utf8');
    return source.startsWith("'use client';") && /^export \*/m.test(source);
  });
  expect(offenders.map((file) => file.slice(reactDir.length + 1))).toEqual([]);
});

test('the built React output keeps the client directive', () => {
  const built = readFileSync(join(process.cwd(), 'dist', 'react', 'Modal.js'), 'utf8');
  expect(built.startsWith("'use client';")).toBe(true);
});

test('the layered stylesheet puts every kit rule inside a cascade layer', () => {
  const sheet = postcss.parse(readFileSync(join(process.cwd(), 'dist', 'utkristi-ui.layered.css'), 'utf8'));
  const unlayered = sheet.nodes.filter((node) => node.type !== 'atrule' || node.name !== 'layer');
  expect(unlayered).toEqual([]);
  expect(sheet.first?.toString()).toBe('@layer utkristi.tokens, utkristi.base, utkristi.components');
});

test('component CSS uses logical properties so it mirrors in right-to-left pages', () => {
  const css = readFileSync(join(process.cwd(), 'src', 'styles', 'components.css'), 'utf8');
  const sheet = postcss.parse(css);
  // Centred overlays (left: 50% + translateX(-50%)) and the LTR slider are direction-neutral on purpose.
  const allowed = /^(\.slider|\.tooltip|\[data-tip\])/;
  const physical: string[] = [];
  sheet.walkDecls(/^(left|right|margin-left|margin-right|padding-left|padding-right|border-left|border-right)$/, (decl) => {
    const rule = decl.parent as postcss.Rule;
    if (!rule.selector || allowed.test(rule.selector)) return;
    physical.push(`${rule.selector} { ${decl.prop} }`);
  });
  sheet.walkDecls('text-align', (decl) => {
    if (/^(left|right)$/.test(decl.value)) physical.push(`${(decl.parent as postcss.Rule).selector} { text-align: ${decl.value} }`);
  });
  expect(physical).toEqual([]);
});

test('per-component CSS covers every component class and keeps the button file small', async () => {
  const dir = join(process.cwd(), 'dist', 'css');
  const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as Record<string, { file: string }>;
  const split = Object.values(manifest).map(({ file }) => readFileSync(join(process.cwd(), 'dist', file), 'utf8')).join('\n');
  const source = readFileSync(join(process.cwd(), 'src', 'styles', 'components.css'), 'utf8');
  const classes = new Set<string>();
  postcss.parse(source).walkRules((rule) => {
    for (const [, name] of rule.selector.matchAll(/\.([a-z][a-z0-9-]*)/g)) classes.add(name);
  });
  const missing = [...classes].filter((name) => !split.includes(`.${name}`));
  expect(missing).toEqual([]);
  const button = readFileSync(join(dir, 'button.css'), 'utf8');
  expect(button).toContain('.btn-solid');
  const { gzipSync } = await import('node:zlib');
  expect(gzipSync(button).length).toBeLessThan(4096);
});

test('the Tailwind 4 entry uses only v4 native directives', () => {
  const css = readFileSync(join(process.cwd(), 'dist', 'tailwind.css'), 'utf8');
  expect(css).not.toContain('@plugin');
  expect(css).toContain('@theme inline {');
  expect(css).toContain('--color-accent: color-mix(in srgb, var(--ut-accent) 100%, transparent);');
  expect(css).toContain('@custom-variant glass (');
  expect(css).toContain('@utility stretch-condensed');
  expect(css).toContain('@layer components {');
  expect(() => postcss.parse(css)).not.toThrow();
});

test('token exports include every appearance', async () => {
  const tokens = await import(pathToFileURL(join(process.cwd(), 'dist', 'tokens.js')).href);
  for (const name of ['night', 'paper', 'glass', 'trading', 'snow', 'aurora', 'sepia', 'midnight', 'forest', 'sunset', 'highContrast', 'terminal']) {
    expect(tokens[name]?.['--ut-bg'], name).toBeTruthy();
  }
});
