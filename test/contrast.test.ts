import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, test } from 'vitest';
import { avatarPalette } from '../src/react/Avatar.js';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const rules = postcss.parse(css).nodes.filter((node) => node.type === 'rule');
const palettes = rules.filter((rule) => rule.nodes.some((node) => node.type === 'decl' && node.prop === '--ut-bg')).map((rule) => Object.fromEntries(
  rule.nodes.flatMap((node) => node.type === 'decl' ? [[node.prop, node.value]] : []),
));

function parse(color: string) {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  }
  return color.match(/[\d.]+/g)!.map(Number);
}
function luminance(color: number[]) {
  return [.2126, .7152, .0722].reduce((total, weight, i) => {
    const channel = color[i] / 255;
    return total + weight * (channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  }, 0);
}
function contrast(fg: string, bg: string, canvas = '#FFFFFF') {
  const surface = parse(bg);
  const opacity = surface[3] ?? 1;
  const background = parse(canvas).map((channel, index) => opacity * surface[index] + (1 - opacity) * channel);
  const foreground = parse(fg);
  const alpha = foreground[3] ?? 1;
  const a = luminance(background.map((channel, i) => foreground[i] * alpha + channel * (1 - alpha)));
  const b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

const textPairs = [
  ...['bg', 'bg-2', 'raise'].flatMap((bg) => ['ink', 'ink-2', 'ink-3'].map((fg) => [fg, bg])),
  ['on-solid', 'solid'], ['on-accent', 'accent'], ['on-bad', 'bad'],
  ['ok-ink', 'bg'], ['bad-ink', 'bg'], ['warn-ink', 'bg'], ['accent', 'bg'],
];

test.each(['Night', 'Paper', 'Glass'].map((theme, index) => [theme, index] as const))('%s meets the required text and UI contrast ratios', (_, index) => {
  const palette = palettes[index];
  const ratio = (fg: string, bg: string) => contrast(palette[`--ut-${fg}`], palette[`--ut-${bg}`], palette['--ut-bg']);
  for (const [fg, bg] of textPairs) expect(ratio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  for (const fg of ['mark', 'accent']) expect(ratio(fg, 'bg'), `${fg} on bg`).toBeGreaterThanOrEqual(3);
});

test('all avatar backgrounds have 4.5:1 contrast with white', () => {
  for (const background of avatarPalette) expect(contrast('#FFFFFF', background), background).toBeGreaterThanOrEqual(4.5);
});

test('Glass retains readable surfaces over dark imagery and readable nav over light imagery', () => {
  const glass = palettes[2];
  for (const bg of ['bg-2', 'raise']) {
    for (const ink of ['ink', 'ink-2', 'ink-3']) {
      expect(contrast(glass['--ut-' + ink], glass['--ut-' + bg], '#000000')).toBeGreaterThanOrEqual(4.5);
    }
  }
  for (const ink of ['navbar-ink', 'navbar-muted']) {
    expect(contrast(glass['--ut-' + ink], glass['--ut-navbar-bg'], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(glass['--ut-on-solid-hover'], glass['--ut-solid-hover'])).toBeGreaterThanOrEqual(4.5);
});
