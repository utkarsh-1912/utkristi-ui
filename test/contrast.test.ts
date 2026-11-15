import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, test } from 'vitest';
import { themes } from '../src/react/theme/themes.js';
import { avatarPalette } from '../src/react/Avatar.js';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const rules = postcss.parse(css).nodes.filter((node) => node.type === 'rule');
const palettes = Object.fromEntries(rules.filter((rule) => rule.nodes.some((node) => node.type === 'decl' && node.prop === '--ut-bg')).map((rule) => [
  [...rule.selector.matchAll(/data-theme="([^"]+)"/g)].at(-1)?.[1],
  Object.fromEntries(rule.nodes.flatMap((node) => node.type === 'decl' ? [[node.prop, node.value]] : [])),
]));
const canvases: Record<string, string[]> = {
  glass: ['#B2A6F2', '#DCEDAB', '#E9E6F6'],
  aurora: ['#100E20', '#2A1D49', '#12262C'],
  snow: ['#EDF3F9'],
  sunset: ['#FFF6F0', '#F9DCE5'],
};

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
  ...['bg', 'bg-2', 'bg-3', 'raise'].flatMap((bg) => ['ink', 'ink-2', 'ink-3'].map((fg) => [fg, bg])),
  ['on-solid', 'solid'], ['on-accent', 'accent'], ['on-bad', 'bad'], ['on-mark', 'mark'],
  ['ok-ink', 'bg'], ['bad-ink', 'bg'], ['warn-ink', 'bg'], ['accent', 'bg'],
];

test.each(themes)('$label meets text, control and focus contrast', ({ id }) => {
  const palette = palettes[id];
  const value = (key: string) => palette['--ut-' + key];
  for (const key of Object.keys(palettes.dark)) expect(palette[key], key).toBeDefined();

  for (const canvas of canvases[id] ?? [value('bg')]) {
    const backgrounds = ['bg', 'bg-2', 'raise', 'bg-3'];
    for (const [fg, bg] of textPairs) {
      const surface = bg === 'bg' ? canvas : value(bg);
      const goal = id === 'high-contrast' && ['ink', 'ink-2', 'ink-3'].includes(fg) ? 7 : 4.5;
      expect(contrast(value(fg), surface, canvas), fg + ' on ' + bg + ' over ' + canvas).toBeGreaterThanOrEqual(goal);
    }
    for (const bg of backgrounds) {
      expect(contrast(value('accent'), bg === 'bg' ? canvas : value(bg), canvas), 'focus on ' + bg).toBeGreaterThanOrEqual(3);
      expect(contrast(value('line-2'), bg === 'bg' ? canvas : value(bg), canvas), 'control border on ' + bg).toBeGreaterThanOrEqual(3);
    }
    const paneFocus = value('pane-focus');
    expect(contrast(paneFocus && paneFocus !== 'initial' ? paneFocus : value('pane-ink'), value('pane'), canvas), 'pane focus').toBeGreaterThanOrEqual(3);
  }
});

test('all avatar backgrounds have 4.5:1 contrast with white', () => {
  for (const background of avatarPalette) expect(contrast('#FFFFFF', background), background).toBeGreaterThanOrEqual(4.5);
});

test('Glass navigation retains contrast over light imagery', () => {
  const glass = palettes.glass;
  for (const ink of ['navbar-ink', 'navbar-muted']) {
    expect(contrast(glass['--ut-' + ink], glass['--ut-navbar-bg'], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(glass['--ut-on-solid-hover'], glass['--ut-solid-hover'])).toBeGreaterThanOrEqual(4.5);
});
