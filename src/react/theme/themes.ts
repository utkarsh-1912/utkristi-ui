/** Built-in appearances. To add a theme, give it a token block in tokens.css first (see docs/planning/THEME_INSTRUCTIONS.md). */
export const themes = [
  { id: 'dark', label: 'Night', scheme: 'dark' },
  { id: 'light', label: 'Paper', scheme: 'light' },
  { id: 'glass', label: 'Glass', scheme: 'light' },
  { id: 'trading', label: 'Trading', scheme: 'dark' },
  { id: 'snow', label: 'Snow', scheme: 'light' },
  { id: 'aurora', label: 'Aurora', scheme: 'dark' },
  { id: 'sepia', label: 'Sepia', scheme: 'light' },
  { id: 'midnight', label: 'Midnight', scheme: 'dark' },
  { id: 'forest', label: 'Forest', scheme: 'dark' },
  { id: 'sunset', label: 'Sunset', scheme: 'light' },
  { id: 'high-contrast', label: 'High Contrast', scheme: 'dark' },
  { id: 'terminal', label: 'Terminal', scheme: 'dark' },
] as const;

export type ResolvedTheme = (typeof themes)[number]['id'];
export type Theme = ResolvedTheme | 'system';

export const themeIds: readonly ResolvedTheme[] = themes.map((theme) => theme.id);

export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return typeof value === 'string' && (themeIds as readonly string[]).includes(value);
}

export function isTheme(value: unknown): value is Theme {
  return value === 'system' || isResolvedTheme(value);
}

export function themeLabel(id: Theme): string {
  return id === 'system' ? 'Auto' : themes.find((theme) => theme.id === id)?.label ?? id;
}

/** Raster artwork is shared by appearances with a compatible color scheme. */
export function iconThemeKey(id: ResolvedTheme): 'night' | 'paper' | 'glass' {
  return id === 'glass' ? 'glass' : themes.find((theme) => theme.id === id)?.scheme === 'light' ? 'paper' : 'night';
}
