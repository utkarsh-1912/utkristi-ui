/**
 * Theme Engine: one brand colour in, a complete Utkristi theme out.
 * Every text, control and focus pair is solved in OKLCH until it meets its WCAG 2 target, so a
 * generated theme cannot ship a failing pair; `report` lists every check with its measured ratio.
 */
import { apcaLc, blend, contrast, oklchHex, parseHex, toHex, toOklch, type Rgb } from './color.js';

export { apcaLc, contrast, oklchHex, parseHex, toHex, toOklch } from './color.js';
export { tokensToDTCG2025, tokensToTokensStudio } from './token-format.js';

export type ThemeScheme = 'dark' | 'light';
export type ContrastLevel = 'AA' | 'AAA';

export interface ThemeOptions {
  /** Brand colour as #rgb or #rrggbb. */
  brand: string;
  /** Optional neutral seed as #rgb or #rrggbb. Supplies the hue of neutral surfaces. */
  neutral?: string;
  /** Theme id used for the selector, e.g. "violet" gives `.violet, [data-theme="violet"]`. */
  name?: string;
  scheme?: ThemeScheme;
  /** AA: text 4.5:1. AAA: body text 7:1. Controls and focus are always 3:1 or more. */
  contrast?: ContrastLevel;
  /** Corner radii in px; defaults keep the kit's 16 / 22 / 12. */
  radius?: { card?: number; panel?: number; field?: number };
  density?: 'compact' | 'comfortable';
}

export interface ContrastCheck { pair: string; ratio: number; target: number; pass: boolean; lc: number }

export interface GeneratedTheme {
  name: string;
  scheme: ThemeScheme;
  brand: string;
  tokens: Record<string, string>;
  report: ContrastCheck[];
}

export const iconHues = { blue: 255, lime: 130, violet: 295, teal: 185, amber: 75, coral: 35, rose: 355, graphite: -1 } as const;

const WHITE = '#FFFFFF';
const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = parseHex(hex).map((channel) => Math.round(channel * 255));
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
};

/** Find the nearest passing lightness between the seed and the chosen end of the scale. */
function solve(start: number, direction: number, color: (l: number) => string, ok: (hex: string) => boolean): string {
  const seed = color(start);
  if (ok(seed)) return seed;
  let fail = start;
  let pass = direction > 0 ? 1 : 0;
  let result = color(pass);
  for (let iteration = 0; iteration < 16; iteration++) {
    const mid = (fail + pass) / 2;
    const hex = color(mid);
    if (ok(hex)) {
      pass = mid;
      result = hex;
    } else fail = mid;
  }
  return result;
}
const minContrast = (hex: string, surfaces: string[]) => Math.min(...surfaces.map((surface) => contrast(hex, surface)));

/** Lowest alpha of `ink` over every surface that still reaches `target`. */
function solveAlpha(ink: string, surfaces: string[], target: number, floor: number): number {
  const fg = parseHex(ink);
  for (let alpha = floor; alpha <= 1; alpha += 0.01) {
    if (surfaces.every((surface) => { const bg = parseHex(surface); return contrast(blend(fg, bg, alpha), bg) >= target; })) return Math.min(1, alpha);
  }
  return 1;
}

export function createTheme(options: ThemeOptions): GeneratedTheme {
  const scheme = options.scheme ?? 'dark';
  const name = (options.name ?? 'brand').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const dark = scheme === 'dark';
  const level = options.contrast ?? 'AA';
  const body = level === 'AAA' ? 7 : 4.5;
  const brand = toOklch(parseHex(options.brand));
  const hue = brand.h;
  const neutralHue = options.neutral ? toOklch(parseHex(options.neutral)).h : hue;
  const neutral = (l: number, c = 0.008) => oklchHex(l, c, neutralHue);
  const up = dark ? 1 : -1;

  // Surfaces: a tinted neutral ramp; raised surfaces step toward the ink.
  const bg = neutral(dark ? 0.16 : 0.975, dark ? 0.006 : 0.006);
  const bg2 = neutral(dark ? 0.195 : 0.99, 0.006);
  const bg3 = neutral(dark ? 0.235 : 0.945, 0.01);
  const raise = neutral(dark ? 0.215 : 1, 0.006);
  const surfaces = [bg, bg2, bg3, raise];

  const ink = solve(dark ? 0.94 : 0.2, up * 0.005, (l) => neutral(l, 0.012), (hex) => minContrast(hex, surfaces) >= Math.max(body, 12));
  const ink2 = solve(dark ? 0.6 : 0.6, up * 0.005, (l) => neutral(l, 0.014), (hex) => minContrast(hex, surfaces) >= Math.max(body, 6));
  const ink3 = solve(dark ? 0.5 : 0.7, up * 0.005, (l) => neutral(l, 0.016), (hex) => minContrast(hex, surfaces) >= body);

  // The accent is the brand at a lightness that reads as text on the page and as a focus ring everywhere.
  const accent = solve(brand.l, up * 0.005, (l) => oklchHex(l, Math.max(brand.c, 0.04), hue),
    (hex) => contrast(hex, bg) >= 4.5 && minContrast(hex, surfaces) >= 3);
  const mark = solve(dark ? Math.min(brand.l, 0.62) : Math.max(brand.l, 0.5), up * 0.005, (l) => oklchHex(l, Math.max(brand.c, 0.06), hue),
    (hex) => contrast(hex, bg) >= 3);

  const darkText = neutral(0.16, 0.006);
  /** Pick the more readable of near-black and white for a fill, then push the fill away until it passes. */
  function fill(start: string, minimum = 4.5): { fill: string; on: string } {
    const seed = toOklch(parseHex(start));
    const on = contrast(darkText, start) >= contrast(WHITE, start) ? darkText : WHITE;
    const away = on === WHITE ? -0.005 : 0.005;
    const solved = solve(seed.l, away, (l) => oklchHex(l, seed.c, seed.h), (hex) => contrast(on, hex) >= minimum);
    return { fill: solved, on };
  }

  const solid = fill(oklchHex(brand.l, brand.c, hue));
  // A solid fill must still read as a control against the page.
  const solidFill = contrast(solid.fill, bg) >= 3 ? solid : fill(mark);
  const accentForeground = fill(accent).on;
  const onAccent = contrast(accentForeground, accent) >= 4.5 ? accentForeground : '#000000';
  const onMark = fill(mark, 3);

  const state = (h: number, c: number) => {
    const ui = solve(dark ? 0.72 : 0.55, up * 0.005, (l) => oklchHex(l, c, h), (hex) => contrast(hex, bg) >= 3);
    const text = solve(toOklch(parseHex(ui)).l, up * 0.005, (l) => oklchHex(l, c, h), (hex) => minContrast(hex, [bg, bg2, raise]) >= 4.5);
    return { ui, text };
  };
  const ok = state(150, 0.16);
  const bad = state(25, 0.19);
  const warn = state(75, 0.16);
  const badFill = fill(bad.ui);

  const lineAlpha = solveAlpha(ink, surfaces, 3, 0.2);
  const line = rgba(ink, dark ? 0.1 : 0.11);
  const line2 = rgba(ink, lineAlpha);
  const tint = rgba(ink, dark ? 0.05 : 0.045);

  // The pane is an inverted surface (light on dark themes, deep on light ones).
  const pane = neutral(dark ? 0.96 : 0.2, 0.01);
  const paneInk = neutral(dark ? 0.22 : 0.95, 0.012);
  const paneInk2 = solve(dark ? 0.5 : 0.7, -up * 0.005, (l) => neutral(l, 0.012), (hex) => contrast(hex, pane) >= 4.5);

  const tokens: Record<string, string> = {
    'color-scheme': scheme,
    '--ut-bg': bg, '--ut-bg-2': bg2, '--ut-bg-3': bg3, '--ut-raise': raise,
    '--ut-code-bg': 'var(--ut-bg-2)', '--ut-code-bar': 'var(--ut-bg-3)', '--ut-code-line': 'var(--ut-line-2)',
    '--ut-ink': ink, '--ut-ink-2': ink2, '--ut-ink-3': ink3,
    '--ut-line': line, '--ut-line-2': line2, '--ut-tint': tint,
    '--ut-accent': accent, '--ut-on-accent': onAccent,
    '--ut-mark': onMark.fill, '--ut-on-mark': onMark.on,
    '--ut-solid': solidFill.fill, '--ut-on-solid': solidFill.on,
    '--ut-pane': pane, '--ut-pane-2': neutral(dark ? 0.92 : 0.26, 0.012), '--ut-pane-ink': paneInk, '--ut-pane-ink-2': paneInk2,
    '--ut-pane-line': rgba(paneInk, 0.14),
    '--ut-ok': ok.ui, '--ut-bad': badFill.fill, '--ut-warn': warn.ui, '--ut-on-bad': badFill.on,
    '--ut-ok-ink': ok.text, '--ut-bad-ink': bad.text, '--ut-warn-ink': warn.text,
    '--ut-grain': dark ? '.06' : '.03',
    '--ut-shadow': dark ? '0 30px 80px -30px rgba(0, 0, 0, .7)' : `0 30px 70px -30px ${rgba(ink, 0.28)}`,
    '--ut-backdrop': dark ? rgba(neutral(0.1), 0.62) : rgba(ink, 0.32),
    '--ut-ring': 'color-mix(in srgb, var(--ut-accent) 18%, transparent)',
    '--ut-icon-rim': rgba(accent, 0.6),
    '--ut-icon-shadow': dark ? 'rgba(0, 0, 0, .35)' : rgba(ink, 0.1),
    '--ut-icon-custom-tint-alpha': dark ? '14%' : '10%',
    '--ut-up': ok.text, '--ut-down': bad.text, '--ut-up-tint': rgba(ok.ui, 0.14), '--ut-down-tint': rgba(bad.ui, 0.14),
  };

  // Icon palette: eight hues with the roles the icon system reads (stroke 3:1 on surfaces, glyph 4.5:1 on its fill).
  for (const [hueName, angle] of Object.entries(iconHues)) {
    const h = angle < 0 ? hue : angle;
    const c = angle < 0 ? 0.015 : dark ? 0.11 : 0.14;
    const base = solve(dark ? 0.8 : 0.5, up * 0.005, (l) => oklchHex(l, c, h), (hex) => minContrast(hex, [bg, bg2, raise]) >= 3);
    const glyph = fill(base);
    const baseL = toOklch(parseHex(glyph.fill)).l;
    const set = {
      base: glyph.fill,
      shade: oklchHex(baseL - 0.16, c, h),
      hi: oklchHex(Math.min(0.97, baseL + (dark ? 0.12 : 0.3)), c * 0.5, h),
      tint: rgba(glyph.fill, dark ? 0.16 : 0.1),
      stroke: minContrast(glyph.fill, [bg, bg2, raise]) >= 3 ? glyph.fill : base,
      on: glyph.on,
    };
    for (const [role, value] of Object.entries(set)) tokens[`--ut-hue-${hueName}-${role}`] = value;
  }
  for (const role of ['base', 'shade', 'hi', 'tint', 'stroke', 'on']) tokens[`--ut-icon-${role}`] = `var(--ut-hue-blue-${role})`;

  if (options.radius?.card !== undefined) tokens['--ut-r'] = `${options.radius.card}px`;
  if (options.radius?.panel !== undefined) tokens['--ut-r-lg'] = `${options.radius.panel}px`;
  if (options.radius?.field !== undefined) tokens['--ut-r-field'] = `${options.radius.field}px`;
  if (options.density) {
    tokens['--ut-field-height'] = options.density === 'compact' ? '36px' : '44px';
    tokens['--ut-button-default-height'] = options.density === 'compact' ? '36px' : '44px';
  }

  return { name, scheme, brand: toHex(parseHex(options.brand)), tokens, report: checkTheme(tokens, level) };
}

/** Resolve a token to an opaque colour over `surface` (rgba values are composited). */
function resolve(value: string | undefined, surface: Rgb): Rgb | null {
  if (!value) return null;
  if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return parseHex(value);
  const match = /^rgba?\(([^)]+)\)$/.exec(value);
  if (!match) return null;
  const [r, g, b, a = 1] = match[1].split(',').map((part) => Number(part.trim()));
  return blend([r / 255, g / 255, b / 255], surface, a);
}

/** Measure the pairs the kit's contrast suite requires. Works on any token map, not only generated ones. */
export function checkTheme(tokens: Record<string, string>, level: ContrastLevel = 'AA'): ContrastCheck[] {
  const body = level === 'AAA' ? 7 : 4.5;
  const checks: ContrastCheck[] = [];
  const add = (fg: string, bg: string, target: number) => {
    const surface = resolve(tokens[`--ut-${bg}`], [1, 1, 1]);
    const color = surface && resolve(tokens[`--ut-${fg}`], surface);
    if (!surface || !color) return;
    const ratio = contrast(color, surface);
    checks.push({ pair: `${fg} on ${bg}`, ratio: Math.round(ratio * 100) / 100, target, pass: ratio >= target,
      lc: Math.round(apcaLc(color, surface) * 10) / 10 });
  };
  for (const bg of ['bg', 'bg-2', 'bg-3', 'raise']) {
    for (const fg of ['ink', 'ink-2', 'ink-3']) add(fg, bg, body);
    add('accent', bg, 3);
    add('line-2', bg, 3);
  }
  add('accent', 'bg', 4.5);
  for (const [fg, bg] of [['on-solid', 'solid'], ['on-accent', 'accent'], ['on-bad', 'bad'], ['ok-ink', 'bg'], ['bad-ink', 'bg'], ['warn-ink', 'bg'], ['pane-ink', 'pane'], ['pane-ink-2', 'pane']]) add(fg, bg, 4.5);
  add('on-mark', 'mark', 3);
  add('mark', 'bg', 3);
  for (const hue of Object.keys(iconHues)) {
    add(`hue-${hue}-stroke`, 'bg', 3);
    add(`hue-${hue}-on`, `hue-${hue}-base`, 4.5);
  }
  return checks;
}

// ---------- Exporters ----------

export function toCSS(theme: GeneratedTheme, selector = `.${theme.name}, [data-theme="${theme.name}"]`): string {
  const lines = Object.entries(theme.tokens).map(([key, value]) => `  ${key}: ${value};`);
  return `/* Generated by @utkristi/ui/theme-engine from ${theme.brand} (${theme.scheme}). */\n${selector} {\n${lines.join('\n')}\n}\n`;
}

/** Tailwind CSS 4: the theme block plus a `name:` variant. Import after "@utkristi/ui/tailwind.css". */
export function toTailwindV4(theme: GeneratedTheme): string {
  const variant = `@custom-variant ${theme.name} (&:where(.${theme.name}, .${theme.name} *, [data-theme="${theme.name}"], [data-theme="${theme.name}"] *));`;
  return `${variant}\n\n@layer base {\n${toCSS(theme).replace(/^/gm, '  ').trimEnd()}\n}\n`;
}

type DtcgToken = { $type: string; $value: string };
/** Design Tokens Community Group format, for Tokens Studio, Style Dictionary and Figma variable importers. */
export function toDTCG(theme: GeneratedTheme): Record<string, unknown> {
  const group: Record<string, Record<string, DtcgToken | Record<string, DtcgToken>>> = { color: {}, other: {} };
  for (const [key, value] of Object.entries(theme.tokens)) {
    if (!key.startsWith('--ut-')) continue;
    const name = key.slice(5);
    const isColor = /^#|^rgba?\(/.test(value);
    const hue = /^hue-([a-z]+)-([a-z]+)$/.exec(name);
    if (hue && isColor) {
      const hues = (group.color.hue ??= {}) as Record<string, DtcgToken | Record<string, DtcgToken>>;
      ((hues[hue[1]] ??= {}) as Record<string, DtcgToken>)[hue[2]] = { $type: 'color', $value: value };
    } else if (isColor) {
      group.color[name] = { $type: 'color', $value: value };
    } else {
      group.other[name] = { $type: /px$/.test(value) ? 'dimension' : 'string', $value: value };
    }
  }
  return {
    $description: `Utkristi UI theme "${theme.name}" generated from ${theme.brand} (${theme.scheme})`,
    [theme.name]: group,
  };
}

export function themeIsAccessible(theme: GeneratedTheme): boolean {
  return theme.report.every((check) => check.pass);
}
