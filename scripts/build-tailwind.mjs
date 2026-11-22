import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import postcss from 'postcss';
import postcssJs from 'postcss-js';

const target = (name) => new URL(`../dist/tailwind/${name}`, import.meta.url);
const sources = await Promise.all(['tokens', 'base', 'components'].map(async (name) => {
  const css = await readFile(new URL(`../src/styles/${name}.css`, import.meta.url), 'utf8');
  return [name, postcssJs.objectify(postcss.parse(css))];
}));

await mkdir(target(''), { recursive: true });
await writeFile(target('styles.js'), `export default ${JSON.stringify(Object.fromEntries(sources), null, 2)};\n`);

const entries = {
  plugin: {
    code: "import styles from './styles.js'; import { createPlugin } from '../../src/tailwind/plugin-core.js'; export default createPlugin(styles);",
    type: "(options?: { base?: boolean }) => NonNullable<import('tailwindcss').Config['plugins']>[number]",
  },
  preset: {
    code: "import styles from './styles.js'; import { createPlugin, night } from '../../src/tailwind/plugin-core.js'; import extend from '../../src/tailwind/theme.js'; export default { darkMode: ['variant', night], theme: { extend }, plugins: [createPlugin(styles)] };",
    type: "Partial<import('tailwindcss').Config>",
  },
};

await Promise.all(Object.entries(entries).flatMap(([name, { code, type }]) =>
  ['esm', 'cjs'].map(async (format) => {
    const esm = format === 'esm';
    const declaration = `declare const ${name}: ${type};\n${esm ? `export default ${name};` : `export = ${name};`}\n`;
    await build({
      stdin: { contents: code, resolveDir: fileURLToPath(target('')) },
      bundle: true,
      platform: 'node',
      format,
      outfile: fileURLToPath(target(`${name}.${esm ? 'js' : 'cjs'}`)),
      external: ['tailwindcss'],
      define: esm ? {} : { 'import.meta.url': 'moduleUrl' },
      banner: esm ? undefined : { js: 'const moduleUrl = require("node:url").pathToFileURL(__filename).href;' },
      footer: esm ? undefined : { js: 'module.exports = module.exports.default;' },
    });
    await writeFile(target(`${name}.${esm ? 'd.ts' : 'd.cts'}`), declaration);
  }),
));


// Tailwind CSS 4 entry, written in v4's native CSS API (the v3 plugin's nested @media components don't load in v4).
// Usage: @import "tailwindcss"; @import "@utkristi/ui/tailwind.css";
{
  const { default: extend } = await import('../src/tailwind/theme.js');
  const read = (name) => readFile(new URL(`../src/styles/${name}.css`, import.meta.url), 'utf8');
  const [tokenCss, baseCss, componentCss] = await Promise.all(['tokens', 'base', 'components'].map(read));
  const v4 = (value) => value.replace('calc(<alpha-value> * 100%)', '100%');
  const block = (prefix, entries) => Object.entries(entries).map(([key, value]) => `  --${prefix}-${key}: ${v4(value)};`);
  const theme = [
    ...block('color', extend.colors),
    ...block('font', extend.fontFamily),
    ...block('font-stretch', extend.fontStretch),
    ...block('radius', extend.borderRadius),
    ...block('shadow', extend.boxShadow),
    ...block('ease', extend.transitionTimingFunction),
    ...block('container', extend.maxWidth),
    ...block('spacing', extend.spacing),
  ];
  const themes = ['glass', 'aurora', 'snow', 'trading', 'sepia', 'midnight', 'forest', 'sunset', 'high-contrast', 'terminal'];
  const variant = (name, cls, attr) => `@custom-variant ${name} (&:where(.${cls}, .${cls} *, [data-theme="${attr}"], [data-theme="${attr}"] *));`;
  const stretches = Object.entries(extend.fontStretch).map(([key, value]) => `@utility stretch-${key} { font-stretch: ${value}; }`);
  await writeFile(new URL('../dist/tailwind.css', import.meta.url), [
    '/* Utkristi UI for Tailwind CSS 4. Import after "tailwindcss". */',
    '@source "./react";',
    '',
    '@theme inline {',
    ...theme,
    '}',
    '',
    variant('light', 'light', 'light'),
    variant('night', 'dark', 'dark'),
    ...themes.map((name) => variant(name, name, name)),
    '',
    '@utility font-condensed { font-stretch: 62%; }',
    ...stretches,
    '',
    `@layer base {\n${tokenCss}\n\n${baseCss}\n}`,
    '',
    `@layer components {\n${componentCss}\n}`,
    '',
  ].join('\n'));
}
