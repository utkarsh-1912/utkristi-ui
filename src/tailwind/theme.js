const colors = [
  'bg', 'bg-2', 'bg-3', 'raise', 'ink', 'ink-2', 'ink-3', 'line', 'line-2', 'tint',
  'accent', 'mark', 'solid', 'on-solid', 'on-accent', 'ok', 'bad', 'warn',
  'pane', 'pane-2', 'pane-ink', 'pane-ink-2', 'pane-line',
  'icon-base', 'icon-shade', 'icon-hi', 'icon-tint', 'icon-stroke', 'icon-on',
];
const hues = ['blue', 'lime', 'violet', 'teal', 'amber', 'coral', 'rose', 'graphite'];

export default {
  colors: {
    ...Object.fromEntries(colors.map((color) => [
      color, `color-mix(in srgb, var(--ut-${color}) calc(<alpha-value> * 100%), transparent)`,
    ])),
    ...Object.fromEntries(hues.flatMap((hue) => [
      [`hue-${hue}`, `color-mix(in srgb, var(--ut-hue-${hue}-base) calc(<alpha-value> * 100%), transparent)`],
      [`hue-${hue}-shade`, `color-mix(in srgb, var(--ut-hue-${hue}-shade) calc(<alpha-value> * 100%), transparent)`],
      [`hue-${hue}-hi`, `color-mix(in srgb, var(--ut-hue-${hue}-hi) calc(<alpha-value> * 100%), transparent)`],
      [`hue-${hue}-tint`, `var(--ut-hue-${hue}-tint)`],
      [`hue-${hue}-stroke`, `var(--ut-hue-${hue}-stroke)`],
      [`hue-${hue}-on`, `var(--ut-hue-${hue}-on)`],
    ])),
  },
  fontFamily: {
    display: 'var(--ut-font-display)',
    sans: 'var(--ut-font-text)',
    text: 'var(--ut-font-text)',
    mono: 'var(--ut-font-mono)',
    geist: 'var(--ut-font-geist)',
    inter: 'var(--ut-font-inter)',
    manrope: 'var(--ut-font-manrope)',
    serif: 'var(--ut-font-serif)',
  },
  fontStretch: { condensed: '62%', semi: '87.5%', normal: '100%' },
  borderRadius: {
    ut: 'var(--ut-shape-radius, var(--ut-r))', 'ut-lg': 'var(--ut-shape-radius, var(--ut-r-lg))',
    field: 'var(--ut-shape-radius, var(--ut-r-field))', pill: '999px',
  },
  boxShadow: { ut: 'var(--ut-shadow)' },
  transitionTimingFunction: { ut: 'var(--ut-ease)', curve: 'var(--ut-curve)', 'inout-ut': 'var(--ut-inout)' },
  maxWidth: { page: 'var(--ut-max)' },
  spacing: { side: 'var(--ut-side)' },
};
