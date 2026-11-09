const colors = [
  'bg', 'bg-2', 'bg-3', 'raise', 'ink', 'ink-2', 'ink-3', 'line', 'line-2', 'tint',
  'accent', 'mark', 'solid', 'on-solid', 'on-accent', 'ok', 'bad', 'warn',
  'pane', 'pane-2', 'pane-ink', 'pane-ink-2', 'pane-line',
];

export default {
  colors: Object.fromEntries(colors.map((color) => [
    color, `color-mix(in srgb, var(--ut-${color}) calc(<alpha-value> * 100%), transparent)`,
  ])),
  fontFamily: {
    display: 'var(--ut-font-display)',
    sans: 'var(--ut-font-text)',
    text: 'var(--ut-font-text)',
    mono: 'var(--ut-font-mono)',
  },
  fontStretch: { condensed: '62%', semi: '87.5%', normal: '100%' },
  borderRadius: { ut: 'var(--ut-r)', 'ut-lg': 'var(--ut-r-lg)', field: 'var(--ut-r-field)', pill: '999px' },
  boxShadow: { ut: 'var(--ut-shadow)' },
  transitionTimingFunction: { ut: 'var(--ut-ease)', curve: 'var(--ut-curve)', 'inout-ut': 'var(--ut-inout)' },
  maxWidth: { page: 'var(--ut-max)' },
  spacing: { side: 'var(--ut-side)' },
};
