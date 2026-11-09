import plugin from './plugin.js';
import { night } from './plugin-core.js';
import extend from './theme.js';

export default {
  darkMode: ['variant', night],
  theme: { extend },
  plugins: [plugin],
};
