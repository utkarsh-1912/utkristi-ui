import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type ReactNode, type SVGProps,
} from 'react';
import { useTheme, type ResolvedTheme } from './theme/ThemeProvider.js';
import { cx, type CSSVariables } from './utils/cx.js';
import { iconGlyphs, type IconGlyphName } from './icons/generated/index.js';
import { iconManifest, type IconManifestEntry } from './icons/generated/manifest.js';
import { icon3dRenders } from './icons/generated/renders.js';

export { iconGlyphs, iconManifest, icon3dRenders };
export type { IconGlyphName, IconManifestEntry };
export * from './icons/generated/index.js';

export const iconHues = ['blue', 'lime', 'violet', 'teal', 'amber', 'coral', 'rose', 'graphite'] as const;
export type IconPresetHue = typeof iconHues[number];
export type IconHue = IconPresetHue | 'mono' | 'none' | 'custom';
export type IconVariant = 'line' | 'filled' | 'duotone' | '2.5d' | '3d';

export interface IconHueRoles {
  readonly base: string;
  readonly shade: string;
  readonly hi: string;
  readonly tint: string;
  readonly stroke: string;
  readonly on: string;
}

export const iconPaletteTable: Record<'night' | 'paper' | 'glass', Record<IconPresetHue, IconHueRoles>> = {
  night: {
    blue:     { base: '#9CC3FF', shade: '#5B8DEF', hi: '#D6E6FF', tint: 'rgba(156, 195, 255, .16)', stroke: '#9CC3FF', on: '#0B0B0A' },
    lime:     { base: '#C6F36B', shade: '#8DBA2E', hi: '#E9FFC2', tint: 'rgba(198, 243, 107, .14)', stroke: '#C6F36B', on: '#0B0B0A' },
    violet:   { base: '#C4B1FF', shade: '#8B6FE8', hi: '#E7DEFF', tint: 'rgba(196, 177, 255, .16)', stroke: '#C4B1FF', on: '#0B0B0A' },
    teal:     { base: '#7FE0D0', shade: '#2FA394', hi: '#C9F5EE', tint: 'rgba(127, 224, 208, .14)', stroke: '#7FE0D0', on: '#0B0B0A' },
    amber:    { base: '#FBCB6A', shade: '#D9952B', hi: '#FFE9B8', tint: 'rgba(251, 203, 106, .14)', stroke: '#FBCB6A', on: '#0B0B0A' },
    coral:    { base: '#FF9F87', shade: '#E0664B', hi: '#FFD6CB', tint: 'rgba(255, 159, 135, .14)', stroke: '#FF9F87', on: '#0B0B0A' },
    rose:     { base: '#F7A8C8', shade: '#D6608F', hi: '#FDDDEA', tint: 'rgba(247, 168, 200, .14)', stroke: '#F7A8C8', on: '#0B0B0A' },
    graphite: { base: '#CFCCC3', shade: '#8E8B83', hi: '#F2F0EA', tint: 'rgba(232, 230, 223, .10)', stroke: '#CFCCC3', on: '#0B0B0A' },
  },
  paper: {
    blue:     { base: '#2F62C9', shade: '#1F4699', hi: '#8FB2F2', tint: 'rgba(47, 98, 201, .10)', stroke: '#2F62C9', on: '#FFFFFF' },
    lime:     { base: '#4D7A00', shade: '#365700', hi: '#B5E35A', tint: 'rgba(77, 122, 0, .10)', stroke: '#4D7A00', on: '#FFFFFF' },
    violet:   { base: '#6A4BD1', shade: '#4B30A3', hi: '#B9A6F5', tint: 'rgba(106, 75, 209, .10)', stroke: '#6A4BD1', on: '#FFFFFF' },
    teal:     { base: '#0F7C6E', shade: '#0A5A50', hi: '#7FD3C6', tint: 'rgba(15, 124, 110, .10)', stroke: '#0F7C6E', on: '#FFFFFF' },
    amber:    { base: '#A85C00', shade: '#7A4300', hi: '#F5C065', tint: 'rgba(168, 92, 0, .10)', stroke: '#A85C00', on: '#FFFFFF' },
    coral:    { base: '#C2410C', shade: '#922F07', hi: '#F7A487', tint: 'rgba(194, 65, 12, .10)', stroke: '#C2410C', on: '#FFFFFF' },
    rose:     { base: '#B3306A', shade: '#86204E', hi: '#F0A0C2', tint: 'rgba(179, 48, 106, .10)', stroke: '#B3306A', on: '#FFFFFF' },
    graphite: { base: '#0E1A33', shade: '#050C1C', hi: '#8C97AD', tint: 'rgba(14, 26, 51, .07)', stroke: '#0E1A33', on: '#F5F7FB' },
  },
  glass: {
    lime:     { base: '#A3FF00', shade: '#6FB300', hi: '#DBFF99', tint: 'rgba(163, 255, 0, .28)', stroke: 'var(--ut-ink)', on: '#202021' },
    blue:     { base: '#A8C7FF', shade: '#5E8BE0', hi: '#DCE8FF', tint: 'rgba(168, 199, 255, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    violet:   { base: '#CDB8FF', shade: '#8F6FE6', hi: '#EDE4FF', tint: 'rgba(205, 184, 255, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    teal:     { base: '#8FE3D3', shade: '#3AA897', hi: '#D4F7F0', tint: 'rgba(143, 227, 211, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    amber:    { base: '#FFD27A', shade: '#D99A2B', hi: '#FFEDC2', tint: 'rgba(255, 210, 122, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    coral:    { base: '#FFB09C', shade: '#E26F55', hi: '#FFDCD3', tint: 'rgba(255, 176, 156, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    rose:     { base: '#FFB8D4', shade: '#DB6A97', hi: '#FFE2EE', tint: 'rgba(255, 184, 212, .35)', stroke: 'var(--ut-ink)', on: '#202021' },
    graphite: { base: '#D9D6E0', shade: '#8C8899', hi: '#F3F1F7', tint: 'rgba(35, 30, 43, .08)', stroke: 'var(--ut-ink)', on: '#202021' },
  },
};

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0').slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return [91, 141, 239];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function wcagContrast(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(parseHexRgb(hexA));
  const lumB = relativeLuminance(parseHexRgb(hexB));
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

export interface DerivedCustomPalette {
  base: string;
  shade: string;
  hi: string;
  tint: string;
  stroke: string;
  on: '#0B0B0A' | '#FFFFFF';
  contrastWithBg: number;
  passesStroke: boolean;
  note: string | null;
}

const themeBackgrounds: Record<ResolvedTheme, string> = {
  dark: '#0B0B0A',
  light: '#F5F7FB',
  glass: '#F7F4FB',
};

export function deriveCustomPalette(hex: string, theme: ResolvedTheme = 'dark'): DerivedCustomPalette {
  const [r, g, b] = parseHexRgb(hex);
  const base = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  const bg = themeBackgrounds[theme] ?? '#0B0B0A';
  const contrastWithBg = wcagContrast(base, bg);
  const passesStroke = theme !== 'glass' && contrastWithBg >= 3;
  const stroke = passesStroke ? base : 'var(--ut-ink)';
  const contrastDark = wcagContrast(base, '#0B0B0A');
  const contrastLight = wcagContrast(base, '#FFFFFF');
  const on = contrastDark >= contrastLight ? '#0B0B0A' : '#FFFFFF';
  let note: string | null = null;
  if (theme === 'glass') {
    note = 'Glass uses charcoal ink for outlines and your custom hue for fills.';
  } else if (!passesStroke) {
    note = theme === 'light'
      ? `Too light for paper (${contrastWithBg.toFixed(1)}:1), the outline will use ink.`
      : `Too dark for night (${contrastWithBg.toFixed(1)}:1), the outline will use ink.`;
  }
  return {
    base,
    shade: `color-mix(in oklab, ${base} 70%, black)`,
    hi: `color-mix(in oklab, ${base} 45%, white)`,
    tint: `color-mix(in srgb, ${base} ${theme === 'glass' ? '35%' : '14%'}, transparent)`,
    stroke,
    on,
    contrastWithBg,
    passesStroke,
    note,
  };
}

export interface IconPaletteContextValue {
  hue: IconHue;
  setHue: (hue: IconHue) => void;
  custom: string;
  setCustom: (hex: string) => void;
  derived: DerivedCustomPalette;
}

const defaultStorageKey = 'utkristi-icon-hue';
const IconPaletteContext = createContext<IconPaletteContextValue | null>(null);

function isValidHue(value: unknown): value is IconHue {
  return typeof value === 'string' && (
    (iconHues as readonly string[]).includes(value) || value === 'mono' || value === 'none' || value === 'custom'
  );
}

function useSafeResolvedTheme(): ResolvedTheme {
  try {
    return useTheme().resolvedTheme;
  } catch {
    return 'dark';
  }
}

export interface IconPaletteProviderProps {
  children: ReactNode;
  defaultHue?: IconHue;
  defaultCustom?: string;
  storageKey?: string | null;
  target?: HTMLElement | (() => HTMLElement | null) | null;
}

export function IconPaletteProvider({
  children,
  defaultHue = 'blue',
  defaultCustom = '#5B8DEF',
  storageKey = defaultStorageKey,
  target,
}: IconPaletteProviderProps) {
  const resolvedTheme = useSafeResolvedTheme();
  const [hue, setHueState] = useState<IconHue>(defaultHue);
  const [custom, setCustomState] = useState<string>(defaultCustom);
  const [loadedKey, setLoadedKey] = useState<string | null>();

  useEffect(() => {
    let raw: string | null = null;
    try {
      if (storageKey !== null) raw = localStorage.getItem(storageKey);
    } catch { /* Storage can be blocked. */ }
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { hue?: unknown; custom?: unknown };
        if (isValidHue(parsed.hue)) setHueState(parsed.hue === 'none' ? 'mono' : parsed.hue);
        if (typeof parsed.custom === 'string' && parsed.custom.startsWith('#')) setCustomState(parsed.custom);
      } catch {
        if (isValidHue(raw)) setHueState(raw === 'none' ? 'mono' : raw);
      }
    } else {
      setHueState(defaultHue);
      setCustomState(defaultCustom);
    }
    setLoadedKey(storageKey);
  }, [defaultCustom, defaultHue, storageKey]);

  const derived = deriveCustomPalette(custom, resolvedTheme);

  useEffect(() => {
    if (loadedKey !== storageKey) return;
    const element = typeof target === 'function' ? target() : target === undefined ? document.documentElement : target;
    if (!element) return;
    const normalized = hue === 'none' ? 'mono' : hue;
    element.dataset.iconHue = normalized;
    if (normalized === 'custom') {
      element.style.setProperty('--ut-icon-custom', derived.base);
      element.style.setProperty('--ut-icon-custom-stroke', derived.stroke);
      element.style.setProperty('--ut-icon-custom-on', derived.on);
    } else {
      element.style.removeProperty('--ut-icon-custom');
      element.style.removeProperty('--ut-icon-custom-stroke');
      element.style.removeProperty('--ut-icon-custom-on');
    }
  }, [derived.base, derived.on, derived.stroke, hue, loadedKey, storageKey, target]);

  const persist = (nextHue: IconHue, nextCustom: string) => {
    try {
      if (storageKey !== null) {
        localStorage.setItem(storageKey, JSON.stringify({ hue: nextHue === 'none' ? 'mono' : nextHue, custom: nextCustom }));
      }
    } catch { /* Storage can be blocked. */ }
  };

  return (
    <IconPaletteContext.Provider
      value={{
        hue,
        custom,
        derived,
        setHue(next) {
          const normalized = next === 'none' ? 'mono' : next;
          setHueState(normalized);
          persist(normalized, custom);
        },
        setCustom(nextHex) {
          setCustomState(nextHex);
          setHueState('custom');
          persist('custom', nextHex);
        },
      }}
    >
      {children}
    </IconPaletteContext.Provider>
  );
}

export function useIconPalette(): IconPaletteContextValue {
  const context = useContext(IconPaletteContext);
  const resolvedTheme = useSafeResolvedTheme();
  const [fallbackHue, setFallbackHue] = useState<IconHue>('blue');
  const [fallbackCustom, setFallbackCustom] = useState<string>('#5B8DEF');
  if (context) return context;
  return {
    hue: fallbackHue,
    setHue: setFallbackHue,
    custom: fallbackCustom,
    setCustom(hex: string) {
      setFallbackCustom(hex);
      setFallbackHue('custom');
    },
    derived: deriveCustomPalette(fallbackCustom, resolvedTheme),
  };
}

export function iconPaletteScript(key = defaultStorageKey) {
  const literal = JSON.stringify(key).replace(/</g, '\\u003c');
  return `(()=>{try{const r=localStorage.getItem(${literal});if(!r)return;const p=r.startsWith("{")?JSON.parse(r):{hue:r};const e=document.documentElement;if(p.hue)e.dataset.iconHue=p.hue==="none"?"mono":p.hue;if(p.hue==="custom"&&p.custom)e.style.setProperty("--ut-icon-custom",p.custom)}catch{}})()`;
}

export function opticalStrokeWidth(size: number): number {
  if (size <= 16) return 1.75;
  if (size <= 20) return 1.875;
  return 2;
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconGlyphName;
  variant?: IconVariant;
  size?: number;
  hue?: IconHue;
  customColor?: string;
  inColour?: boolean;
  label?: string;
  /** Theme override when the icon is rendered in a themed preview or embedded surface. */
  renderTheme?: ResolvedTheme;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, variant: requestedVariant = 'line', size, hue, customColor, inColour, label, renderTheme, strokeWidth, className, style, ...props },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const contextTheme = useSafeResolvedTheme();
  const resolvedTheme = renderTheme ?? contextTheme;
  const contextPalette = useContext(IconPaletteContext);
  const glyph = iconGlyphs[name] ?? iconGlyphs.info;
  const variant = requestedVariant === '3d' || requestedVariant === '2.5d'
    ? glyph.has3d ? requestedVariant : (glyph.styles as readonly string[]).includes('duotone') ? 'duotone' : 'line'
    : (glyph.styles as readonly string[]).includes(requestedVariant) ? requestedVariant : 'line';
  const resolvedSize = size ?? (variant === '3d' || variant === '2.5d' ? 64 : 16);
  const sw = strokeWidth ?? opticalStrokeWidth(resolvedSize);
  const effectiveHue = hue ?? contextPalette?.hue;
  const normalizedHue = effectiveHue === 'none' ? 'mono' : effectiveHue;
  const hueClass = hue ? `icon-hue-${hue === 'none' ? 'mono' : hue}` : undefined;

  const customVars: CSSVariables = {};
  if (normalizedHue === 'custom' && (customColor || contextPalette?.custom)) {
    const derived = deriveCustomPalette(customColor ?? contextPalette!.custom, resolvedTheme);
    customVars['--ut-icon-custom'] = derived.base;
    customVars['--ut-icon-custom-stroke'] = derived.stroke;
    customVars['--ut-icon-custom-on'] = derived.on;
  }

  const a11yProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': 'true' as const };

  // Determine if 3D raster can be used or if we swap to 2.5D layered SVG
  if (variant === '3d') {
    const themeKey = resolvedTheme === 'light' ? 'paper' : resolvedTheme === 'glass' ? 'glass' : 'night';
    const defaultThemeHue: IconPresetHue = resolvedTheme === 'glass' ? 'lime' : 'blue';
    const rasterHue: IconPresetHue | null = !normalizedHue
      ? defaultThemeHue
      : (iconHues as readonly string[]).includes(normalizedHue)
        ? (normalizedHue as IconPresetHue)
        : null;
    const renderEntry = rasterHue
      ? (icon3dRenders as Record<string, Record<string, Record<string, { png1x: string; png2x: string; avif?: string; webp?: string }>>>)[glyph.name]?.[themeKey]?.[rasterHue]
      : undefined;

    if (renderEntry) {
      return (
        <span
          className={cx('icon', 'icon-3d', hueClass, className)}
          style={{ width: resolvedSize, height: resolvedSize, ...customVars, ...style }}
          {...a11yProps}
        >
          <picture>
            {renderEntry.avif && <source type="image/avif" srcSet={renderEntry.avif} />}
            {renderEntry.webp && <source type="image/webp" srcSet={renderEntry.webp} />}
            <img
              src={renderEntry.png1x}
              srcSet={`${renderEntry.png1x} 1x, ${renderEntry.png2x} 2x`}
              width={resolvedSize}
              height={resolvedSize}
              loading="lazy"
              decoding="async"
              alt=""
            />
          </picture>
          <svg
            ref={ref}
            viewBox="0 0 24 24"
            width={resolvedSize}
            height={resolvedSize}
            fill="none"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon-3d-fallback"
            aria-hidden="true"
          >
            <path d={glyph.line} />
          </svg>
        </span>
      );
    }
    // Custom hue, monochrome, or non-3D icon swaps automatically to 2.5D layered SVG
  }

  if (variant === '2.5d' || variant === '3d') {
    const faceId = `ut-face-${uid}`;
    const shadowId = `ut-shadow-${uid}`;
    const detailPath = 'detail' in glyph ? glyph.detail : undefined;
    return (
      <svg
        ref={ref}
        viewBox="-2 -2 31 31"
        width={resolvedSize}
        height={resolvedSize}
        fill="none"
        className={cx('icon', 'icon-2d5', hueClass, className)}
        style={{ ...customVars, ...style } as CSSVariables}
        {...a11yProps}
        {...props}
      >
        <defs>
          <linearGradient id={faceId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--ut-icon-hi)" />
            <stop offset="55%" stopColor="var(--ut-icon-base)" />
            <stop offset="100%" stopColor="var(--ut-icon-shade)" />
          </linearGradient>
          <filter id={shadowId} x="-25%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="var(--ut-icon-shadow, rgba(0,0,0,.35))" />
          </filter>
        </defs>
        <path
          fill="var(--ut-icon-shadow, rgba(0,0,0,.35))"
          transform="translate(0 2)"
          filter={`url(#${shadowId})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d={glyph.filled}
        />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={glyph.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={glyph.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={glyph.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={glyph.filled} />
        </g>
        <path
          fill={`url(#${faceId})`}
          stroke="var(--ut-icon-hi)"
          strokeOpacity={0.7}
          strokeWidth={0.85}
          fillRule="evenodd"
          clipRule="evenodd"
          d={glyph.filled}
        />
        {detailPath && (
          <path
            fill="var(--ut-icon-on)"
            stroke="var(--ut-icon-on)"
            strokeWidth={0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={detailPath}
          />
        )}
      </svg>
    );
  }

  if (variant === 'duotone') {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={resolvedSize}
        height={resolvedSize}
        fill="none"
        className={cx('icon', 'icon-duotone', hueClass, className)}
        style={{ '--ut-icon-sw': String(sw), ...customVars, ...style } as CSSVariables}
        {...a11yProps}
        {...props}
      >
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={glyph.plate} />
        <path
          className="icon-stroke"
          stroke="var(--ut-icon-stroke, currentColor)"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={glyph.line}
        />
      </svg>
    );
  }

  if (variant === 'filled') {
    const isLineOnly = (glyph.styles as readonly string[]).length === 1 && glyph.styles[0] === 'line';
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={resolvedSize}
        height={resolvedSize}
        fill={isLineOnly ? 'none' : 'currentColor'}
        stroke={isLineOnly ? 'currentColor' : undefined}
        strokeWidth={isLineOnly ? sw : undefined}
        strokeLinecap={isLineOnly ? 'round' : undefined}
        strokeLinejoin={isLineOnly ? 'round' : undefined}
        className={cx('icon', 'icon-filled', inColour && 'icon-in-colour', hueClass, className)}
        style={{ ...customVars, ...style } as CSSVariables}
        {...a11yProps}
        {...props}
      >
        <path fillRule="evenodd" clipRule="evenodd" d={glyph.filled} />
      </svg>
    );
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={resolvedSize}
      height={resolvedSize}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('icon', 'icon-line', inColour && 'icon-in-colour', hueClass, className)}
      style={{ '--ut-icon-sw': String(sw), ...customVars, ...style } as CSSVariables}
      {...a11yProps}
      {...props}
    >
      <path d={glyph.line} />
    </svg>
  );
});

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  name: IconGlyphName;
  hue?: IconHue;
  customColor?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'duotone' | 'line' | 'filled' | '2.5d';
  solid?: boolean;
  label?: string;
}

export const IconTile = forwardRef<HTMLSpanElement, IconTileProps>(function IconTile(
  { name, hue, customColor, size = 'md', variant = 'duotone', solid, label, className, style, ...props },
  ref,
) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const hueClass = hue ? `icon-hue-${hue === 'none' ? 'mono' : hue}` : undefined;
  return (
    <span
      ref={ref}
      className={cx('icon-tile', size !== 'md' && `icon-tile-${size}`, solid && 'icon-tile-solid', hueClass, className)}
      style={style}
      {...props}
    >
      <Icon
        name={name}
        variant={solid ? 'filled' : variant}
        size={iconSize}
        hue={hue}
        customColor={customColor}
        label={label}
      />
    </span>
  );
});

const pickerItems: ReadonlyArray<{ id: IconHue; label: string }> = [
  { id: 'blue', label: 'Blue' },
  { id: 'lime', label: 'Lime' },
  { id: 'violet', label: 'Violet' },
  { id: 'teal', label: 'Teal' },
  { id: 'amber', label: 'Amber' },
  { id: 'coral', label: 'Coral' },
  { id: 'rose', label: 'Rose' },
  { id: 'graphite', label: 'Graphite' },
  { id: 'mono', label: 'None' },
  { id: 'custom', label: 'Custom' },
];

const previewIcons: readonly IconGlyphName[] = ['rocket', 'palette', 'bell', 'folder', 'ai-spark', 'shield'];

export interface IconPalettePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: IconHue;
  onValueChange?: (hue: IconHue) => void;
  customColor?: string;
  onCustomColorChange?: (hex: string) => void;
  showPreview?: boolean;
  label?: string;
}

export const IconPalettePicker = forwardRef<HTMLDivElement, IconPalettePickerProps>(function IconPalettePicker(
  { value, onValueChange, customColor, onCustomColorChange, showPreview = true, label = 'Icon colour palette', className, ...props },
  ref,
) {
  const palette = useIconPalette();
  const resolvedTheme = useSafeResolvedTheme();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const activeHue = (value ?? palette.hue) === 'none' ? 'mono' : (value ?? palette.hue);
  const activeCustom = customColor ?? palette.custom;
  const [hexDraft, setHexDraft] = useState(activeCustom);

  useEffect(() => {
    setHexDraft(activeCustom);
  }, [activeCustom]);

  const selectHue = (next: IconHue) => {
    const normalized = next === 'none' ? 'mono' : next;
    palette.setHue(normalized);
    onValueChange?.(normalized);
  };

  const updateCustom = (hex: string) => {
    setHexDraft(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex.trim())) {
      palette.setCustom(hex.trim());
      onCustomColorChange?.(hex.trim());
      onValueChange?.('custom');
    }
  };

  const derived = deriveCustomPalette(
    /^#[0-9a-fA-F]{6}$/.test(hexDraft.trim()) ? hexDraft.trim() : activeCustom,
    resolvedTheme,
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = Math.max(0, pickerItems.findIndex((item) => item.id === activeHue));
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % pickerItems.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + pickerItems.length) % pickerItems.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = pickerItems.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const targetItem = pickerItems[nextIndex];
    selectHue(targetItem.id);
    buttons.current[nextIndex]?.focus();
  };

  return (
    <div ref={ref} className={cx('icon-picker', className)} {...props}>
      <div
        role="radiogroup"
        aria-label={label}
        className="icon-picker-swatches"
      >
        {pickerItems.map((item, index) => {
          const checked = activeHue === item.id;
          const isPreset = (iconHues as readonly string[]).includes(item.id);
          const swatchStyle: CSSVariables | undefined = isPreset
            ? { '--ut-swatch-color': `var(--ut-hue-${item.id}-base)` }
            : item.id === 'custom'
              ? { '--ut-swatch-color': derived.base }
              : undefined;
          return (
            <button
              key={item.id}
              ref={(node) => { buttons.current[index] = node; }}
              type="button"
              role="radio"
              aria-label={item.label}
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => selectHue(item.id)}
              onKeyDown={onKeyDown}
              className={cx(
                'icon-swatch',
                item.id === 'mono' && 'icon-swatch-none',
                item.id === 'custom' && 'icon-swatch-custom',
                checked && 'is-active',
              )}
              style={swatchStyle}
              title={item.label}
            />
          );
        })}
      </div>

      {activeHue === 'custom' && (
        <div className="icon-picker-custom">
          <input
            type="color"
            aria-label="Custom icon colour"
            className="icon-picker-color-input"
            value={derived.base}
            onChange={(event) => updateCustom(event.target.value)}
          />
          <input
            type="text"
            aria-label="Custom hex colour"
            className="input icon-picker-hex"
            value={hexDraft}
            onChange={(event) => updateCustom(event.target.value)}
            placeholder="#5B8DEF"
          />
          {derived.note && (
            <span role="status" className="icon-picker-note">
              {derived.note}
            </span>
          )}
        </div>
      )}

      {showPreview && (
        <div
          className={cx('icon-picker-preview', `icon-hue-${activeHue}`)}
          style={activeHue === 'custom' ? {
            '--ut-icon-custom': derived.base,
            '--ut-icon-custom-stroke': derived.stroke,
            '--ut-icon-custom-on': derived.on,
          } as CSSVariables : undefined}
          aria-label="Icon style preview"
        >
          {previewIcons.map((iconName, idx) => (
            <Icon
              key={`${iconName}-${idx}`}
              name={iconName}
              variant={idx < 2 ? 'line' : idx < 4 ? 'duotone' : '2.5d'}
              inColour={idx < 2 && activeHue !== 'mono'}
              hue={activeHue}
              customColor={activeHue === 'custom' ? derived.base : undefined}
              size={idx >= 4 ? 32 : 22}
            />
          ))}
        </div>
      )}
    </div>
  );
});
