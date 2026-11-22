import type { ThemeOptions } from '../../src/react/theme-engine/index';

export function studioSettings(params: URLSearchParams): ThemeOptions {
  const brand = params.get('brand') ?? '';
  const radius = Number(params.get('radius') ?? 16);
  const card = Number.isFinite(radius) ? Math.max(0, Math.min(32, radius)) : 16;
  return {
    name: 'studio',
    brand: /^#[a-f\d]{6}$/i.test(brand) ? brand.toUpperCase() : '#7C3AED',
    scheme: params.get('scheme') === 'light' ? 'light' : 'dark',
    contrast: params.get('contrast') === 'AAA' ? 'AAA' : 'AA',
    radius: { card, panel: card + 6, field: Math.max(0, card - 4) },
    density: params.get('density') === 'compact' ? 'compact' : 'comfortable',
  };
}
