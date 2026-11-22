/** sRGB / OKLCH conversion and WCAG 2 contrast. Dependency-free so it runs in Node, the browser and workers. */

export type Rgb = readonly [number, number, number];

export function parseHex(hex: string): Rgb {
  const value = hex.trim().replace(/^#/, '');
  const full = value.length === 3 ? [...value].map((char) => char + char).join('') : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new TypeError(`Expected a #rgb or #rrggbb colour, got "${hex}"`);
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255) as unknown as Rgb;
}

export function toHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const fromLinear = (channel: number) => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);

export interface Oklch { l: number; c: number; h: number }

export function toOklch(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const hue = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: hue < 0 ? hue + 360 : hue };
}

function oklchToLinear({ l: L, c, h }: Oklch): Rgb {
  const angle = (h * Math.PI) / 180;
  const A = c * Math.cos(angle);
  const B = c * Math.sin(angle);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/** OKLCH to sRGB, reducing chroma (never lightness or hue) until the colour fits the sRGB gamut. */
export function fromOklch(color: Oklch): Rgb {
  const l = Math.min(1, Math.max(0, color.l));
  let low = 0;
  let high = Math.max(0, color.c);
  if (inGamut(oklchToLinear({ ...color, l, c: high }))) low = high;
  else for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToLinear({ ...color, l, c: mid }))) low = mid; else high = mid;
  }
  return oklchToLinear({ ...color, l, c: low }).map((channel) => fromLinear(Math.min(1, Math.max(0, channel)))) as unknown as Rgb;
}

export const oklchHex = (l: number, c: number, h: number) => toHex(fromOklch({ l, c, h }));

export function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Composite `fg` at `alpha` over an opaque `bg`. */
export const blend = (fg: Rgb, bg: Rgb, alpha: number): Rgb => fg.map((channel, i) => channel * alpha + bg[i] * (1 - alpha)) as unknown as Rgb;

export function contrast(a: string | Rgb, b: string | Rgb): number {
  const first = luminance(typeof a === 'string' ? parseHex(a) : a);
  const second = luminance(typeof b === 'string' ? parseHex(b) : b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** Signed perceptual lightness contrast, using the APCA 0.0.98G-4g model. */
export function apcaLc(foreground: Rgb, background: Rgb): number {
  const perceptual = ([red, green, blue]: Rgb) => {
    const y = 0.2126729 * red ** 2.4 + 0.7151522 * green ** 2.4 + 0.072175 * blue ** 2.4;
    return y + Math.max(0, 0.022 - y) ** 1.414;
  };
  const text = perceptual(foreground);
  const surface = perceptual(background);
  if (Math.abs(surface - text) < 0.0005) return 0;
  const lightSurface = surface > text;
  const contrast = 114 * (surface ** (lightSurface ? 0.56 : 0.65) - text ** (lightSurface ? 0.57 : 0.62));
  return Math.abs(contrast) < 10 ? 0 : contrast - Math.sign(contrast) * 2.7;
}
