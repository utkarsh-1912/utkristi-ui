#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { createTheme, toCSS, toDTCG, tokensToDTCG2025, tokensToTokensStudio, toTailwindV4 } from '../dist/react/theme-engine/index.js';

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i += 1) {
  const key = rest[i];
  if (!key.startsWith('--')) continue;
  const next = rest[i + 1];
  args[key.slice(2)] = next && !next.startsWith('--') ? (i += 1, next) : 'true';
}

if (command !== 'theme' || !args.brand) {
  process.stderr.write('Usage: utkristi-ui theme --brand "#7C3AED" [--neutral hex] [--name violet] [--scheme dark|light] [--contrast AA|AAA] [--density comfortable|compact] [--format css|tailwind|dtcg|dtcg-2025|figma] [--out file]\n');
  process.exit(command === 'theme' || command === undefined ? 1 : 2);
}

const theme = createTheme({ brand: args.brand, neutral: args.neutral, name: args.name,
  scheme: args.scheme === 'light' ? 'light' : 'dark', contrast: args.contrast === 'AAA' ? 'AAA' : 'AA',
  density: ['compact', 'comfortable'].includes(args.density) ? args.density : undefined });
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const formats = new Map([
  ['css', () => toCSS(theme)], ['tailwind', () => toTailwindV4(theme)], ['dtcg', () => json(toDTCG(theme))],
  ['dtcg-2025', () => json(tokensToDTCG2025({ [theme.name]: theme.tokens }))],
  ['figma', () => json(tokensToTokensStudio(theme.name, theme.tokens))],
]);
const output = (formats.get(args.format) ?? formats.get('css'))();
if (args.out) writeFileSync(args.out, output); else process.stdout.write(output);

const failing = theme.report.filter((check) => !check.pass);
process.stderr.write(failing.length
  ? `Warning: ${failing.length} contrast pair(s) below target:\n${failing.map((check) => `  ${check.pair}: ${check.ratio} < ${check.target}`).join('\n')}\n`
  : `"${theme.name}" (${theme.scheme}): all ${theme.report.length} contrast checks pass.\n`);
