import { parseHex, toHex } from './color.js';

type Token = { $type: string; $value: unknown };
const hex = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const rgba = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/;
const dimension = /^(-?[\d.]+)(px|rem)$/;

function typed(value: string): Token | undefined {
  if (hex.test(value)) {
    const short = value.length <= 5;
    const rgb = value.slice(0, short ? 4 : 7);
    const components = parseHex(rgb);
    const alpha = value.slice(short ? 4 : 7);
    return { $type: 'color', $value: { colorSpace: 'srgb', components, hex: toHex(components),
      ...(alpha && { alpha: Number.parseInt(short ? alpha.repeat(2) : alpha, 16) / 255 }) } };
  }
  const color = rgba.exec(value);
  if (color) return { $type: 'color', $value: { colorSpace: 'srgb', components: color.slice(1, 4).map((value) => Number(value) / 255), alpha: Number(color[4] ?? 1) } };
  const length = dimension.exec(value);
  if (length) return { $type: 'dimension', $value: { value: Number(length[1]), unit: length[2] } };
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return { $type: 'number', $value: Number(value) };
}

export function tokensToDTCG2025(themes: Record<string, Record<string, string>>) {
  const groups = Object.fromEntries(Object.entries(themes).map(([name, values]) => {
    const tokens = Object.fromEntries(Object.entries(values).flatMap(([key, value]) => {
      if (!key.startsWith('--ut-')) return [];
      const token = typed(value);
      return token ? [[key.slice(5), token]] : [];
    }));
    for (const [key, value] of Object.entries(values)) {
      const alias = /^var\(--ut-([a-z0-9-]+)\)$/.exec(value)?.[1];
      if (key.startsWith('--ut-') && alias && Object.hasOwn(tokens, alias)) {
        tokens[key.slice(5)] = { $type: tokens[alias].$type, $value: `{${name}.${alias}}` };
      }
    }
    return [name, { ...tokens, $extensions: { 'com.utkristi.css': values } }];
  }));
  return { $schema: 'https://www.designtokens.org/schemas/2025.10/format.json', ...groups };
}

export function tokensToTokensStudio(name: string, values: Record<string, string>) {
  return { [name]: Object.fromEntries(Object.entries(values).flatMap(([key, value]) => {
    if (!key.startsWith('--ut-')) return [];
    const token = typed(value);
    if (!token) return [];
    return [[key.slice(5), { type: token.$type === 'dimension' ? 'sizing' : token.$type, value }]];
  })) };
}
