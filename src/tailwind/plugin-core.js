import { createRequire } from 'node:module';
import extend from './theme.js';

const tailwindPlugin = createRequire(import.meta.url)('tailwindcss/plugin');

export const night = '&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *)';
const light = '&:where(.light, .light *, [data-theme="light"], [data-theme="light"] *)';

export function createPlugin({ tokens, base, components }) {
  return tailwindPlugin.withOptions(
    (options = {}) => ({ addBase, addComponents, addUtilities, matchUtilities, addVariant, theme }) => {
      addBase(tokens);
      if (options.base !== false) addBase(base);
      addComponents(components);
      addUtilities({ '.font-condensed': { fontStretch: '62%' } });
      matchUtilities({ stretch: (value) => ({ fontStretch: value }) }, { values: theme('fontStretch') });
      addVariant('light', light);
      addVariant('night', night);
      addVariant('glass', '&:where(.glass, .glass *, [data-theme="glass"], [data-theme="glass"] *)');
    },
    () => ({ theme: { extend } }),
  );
}
