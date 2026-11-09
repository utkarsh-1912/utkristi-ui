import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, test } from 'vitest';

test('the standalone stylesheet contains every mapped kit component class', () => {
  const contract = readFileSync('DESIGN_TOKENS.md', 'utf8').split('## Component classes')[1];
  const kitColumn = contract.split('\n').filter((line) => line.startsWith('|')).map((line) => line.split('|')[2]).join(' ');
  const classes = new Set<string>();
  for (const [, code] of kitColumn.matchAll(/`([^`]+)`/g)) {
    if (code.startsWith('[') || code.endsWith('*')) continue;
    const [primary, ...variants] = code.split('/');
    for (const name of primary.split('.').filter(Boolean)) classes.add(name);
    const prefix = primary.slice(0, primary.lastIndexOf('-') + 1);
    for (const variant of variants) classes.add(prefix + variant);
  }
  for (const name of ['brand-mark', 'brand-tile', 'brand-ring', 'brand-halo', 'brand-dot', 'brand-name', 'brand-pre', 'brand-co']) classes.add(name);
  const css = readFileSync('dist/utkristi-ui.css', 'utf8');
  const present = new Set<string>();
  postcss.parse(css).walkRules(({ selector }) => {
    for (const [, name] of selector.matchAll(/\.([a-z][\w-]*)/g)) present.add(name);
  });
  expect([...classes].filter((name) => !present.has(name))).toEqual([]);
  expect(css).toContain('[data-tip]');
});
