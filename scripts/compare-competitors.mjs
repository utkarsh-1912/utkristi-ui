// Measures the gzipped JS (and shipped CSS) each library adds for the same six components, bundled
// the same way: esbuild, minified ESM, React and React DOM external. Writes docs/src/efficiency.json.
//
// Setup (any empty folder, outside the repo):
//   npm i react@18.3.1 react-dom@18.3.1 @mui/material@6 @emotion/react@11 @emotion/styled@11 \
//     @mantine/core@7 @mantine/hooks@7 react-aria-components@1 @radix-ui/react-dialog@1 \
//     @radix-ui/react-dropdown-menu@2 @radix-ui/react-tabs@1 @radix-ui/react-tooltip@1 \
//     @radix-ui/react-select@2 @radix-ui/react-slot@1 class-variance-authority@0.7 antd@5
// Then, after `npm run build` here:
//   node scripts/compare-competitors.mjs --dir <that folder>
import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const dirFlag = process.argv.indexOf('--dir');
const dir = dirFlag > -1 ? process.argv[dirFlag + 1] : process.env.COMPARE_DIR;
if (!dir || !existsSync(join(dir, 'node_modules'))) {
  console.error('Pass --dir <folder with the competitor packages installed>. See the setup notes at the top of this file.');
  process.exit(1);
}
const kit = pathToFileURL(join(root, 'dist/react/index.js')).href.replace('file:///', '');
const kitCss = (name) => join(root, 'dist/css', `${name}.css`);
const version = (name) => JSON.parse(readFileSync(join(dir, 'node_modules', name, 'package.json'), 'utf8')).version;
const mantineCss = (file) => join(dir, 'node_modules', '@mantine', 'core', 'styles', `${file}.css`);

const components = ['Button', 'Dialog', 'Menu', 'Tabs', 'Tooltip', 'Select'];
const libraries = [
  {
    id: 'utkristi', name: 'Utkristi UI', version: JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version,
    styling: 'Prebuilt CSS (per-component files)',
    code: {
      Button: `export { Button } from '${kit}';`,
      Dialog: `export { Modal } from '${kit}';`,
      Menu: `export { Menu } from '${kit}';`,
      Tabs: `export { Tabs } from '${kit}';`,
      Tooltip: `export { Tooltip } from '${kit}';`,
      Select: `export { Select } from '${kit}';`,
    },
    css: { base: [kitCss('core')], Button: [kitCss('button')], Dialog: [kitCss('modal')], Menu: [kitCss('menu')], Tabs: [kitCss('tabs')], Tooltip: [kitCss('tooltip')], Select: [kitCss('forms')] },
  },
  {
    id: 'mui', name: 'MUI (Material UI)', package: '@mui/material', styling: 'CSS-in-JS (Emotion, counted in JS)',
    code: Object.fromEntries(components.map((name) => [name, `export { default as ${name} } from '@mui/material/${name}';`])),
  },
  {
    id: 'mantine', name: 'Mantine', package: '@mantine/core', styling: 'Prebuilt CSS (per-component files)',
    code: Object.fromEntries(components.map((name) => [name, `export { ${name === 'Dialog' ? 'Modal' : name}, MantineProvider } from '@mantine/core';`])),
    css: { base: ['baseline', 'default-css-variables', 'global'].map(mantineCss), Button: [mantineCss('Button')], Dialog: ['ModalBase', 'Modal', 'Overlay', 'CloseButton'].map(mantineCss), Menu: ['Menu', 'Popover'].map(mantineCss), Tabs: [mantineCss('Tabs')], Tooltip: [mantineCss('Tooltip')], Select: ['Input', 'Combobox', 'Popover'].map(mantineCss) },
  },
  {
    id: 'react-aria', name: 'React Aria Components', package: 'react-aria-components', styling: 'Unstyled (you write the CSS)',
    code: {
      Button: "export { Button } from 'react-aria-components';",
      Dialog: "export { Dialog, Modal, ModalOverlay, DialogTrigger, Heading } from 'react-aria-components';",
      Menu: "export { MenuTrigger, Menu, MenuItem, Popover } from 'react-aria-components';",
      Tabs: "export { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';",
      Tooltip: "export { TooltipTrigger, Tooltip } from 'react-aria-components';",
      Select: "export { Select, SelectValue, ListBox, ListBoxItem, Popover, Button, Label } from 'react-aria-components';",
    },
  },
  {
    id: 'radix', name: 'shadcn/ui (Radix primitives)', package: '@radix-ui/react-dialog', styling: 'Tailwind classes in your app (not counted)',
    code: {
      Button: "export { Slot } from '@radix-ui/react-slot'; export { cva } from 'class-variance-authority';",
      Dialog: "export * as Dialog from '@radix-ui/react-dialog';",
      Menu: "export * as DropdownMenu from '@radix-ui/react-dropdown-menu';",
      Tabs: "export * as Tabs from '@radix-ui/react-tabs';",
      Tooltip: "export * as Tooltip from '@radix-ui/react-tooltip';",
      Select: "export * as Select from '@radix-ui/react-select';",
    },
  },
  {
    id: 'antd', name: 'Ant Design', package: 'antd', styling: 'CSS-in-JS (counted in JS)',
    code: Object.fromEntries(components.map((name) => [name, `export { ${{ Dialog: 'Modal', Menu: 'Dropdown' }[name] ?? name} } from 'antd';`])),
  },
];

async function jsBytes(contents) {
  const { outputFiles } = await build({
    stdin: { contents, resolveDir: dir, loader: 'js' },
    bundle: true, minify: true, format: 'esm', write: false, logLevel: 'silent',
    platform: 'browser', define: { 'process.env.NODE_ENV': '"production"' },
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
    loader: { '.css': 'empty' },
  });
  return gzipSync(outputFiles[0].contents).length;
}
/** Merge several entry snippets into one module, de-duplicating names shared between components (e.g. Popover). */
function combine(snippets) {
  const named = new Map();
  const namespaces = new Map();
  for (const statement of snippets.join('\n').split(/;\s*/).filter(Boolean)) {
    const star = /export \* as (\w+) from '([^']+)'/.exec(statement);
    if (star) { namespaces.set(star[1], star[2]); continue; }
    const list = /export \{([^}]+)\} from '([^']+)'/.exec(statement);
    if (!list) throw new Error(`Unrecognised entry: ${statement}`);
    const set = named.get(list[2]) ?? named.set(list[2], new Set()).get(list[2]);
    for (const specifier of list[1].split(',').map((part) => part.trim()).filter(Boolean)) set.add(specifier);
  }
  const seen = new Set();
  const lines = [...namespaces].map(([name, source]) => `export * as ${name} from '${source}';`);
  for (const [source, specifiers] of named) {
    const unique = [...specifiers].filter((specifier) => {
      const exported = specifier.split(/\s+as\s+/).at(-1);
      if (seen.has(exported)) return false;
      seen.add(exported);
      return true;
    });
    if (unique.length) lines.push(`export { ${unique.join(', ')} } from '${source}';`);
  }
  return lines.join('\n');
}

const cssBytes = (files) => (files?.length ? gzipSync(files.map((file) => readFileSync(file, 'utf8')).join('\n')).length : 0);

const results = [];
for (const library of libraries) {
  const row = { id: library.id, name: library.name, version: library.version ?? version(library.package), styling: library.styling, js: {}, css: {} };
  for (const component of components) {
    row.js[component] = await jsBytes(library.code[component]);
    row.css[component] = library.css ? cssBytes([...library.css.base, ...library.css[component]]) : 0;
  }
  row.js.all = await jsBytes(combine(components.map((component) => library.code[component])));
  row.css.all = library.css ? cssBytes([...new Set([...library.css.base, ...components.flatMap((component) => library.css[component])])]) : 0;
  results.push(row);
  console.log(`${library.name.padEnd(30)} JS all six: ${(row.js.all / 1024).toFixed(1)} KB gz · CSS: ${(row.css.all / 1024).toFixed(1)} KB gz`);
}

const out = { measured: new Date().toISOString().slice(0, 10), method: 'esbuild bundle, minified ESM, React external, gzip level 9 default; CSS is the library\'s own shipped stylesheet for those components', components, results };
writeFileSync(join(root, 'docs/src/efficiency.json'), JSON.stringify(out, null, 2) + '\n');
console.log('Wrote docs/src/efficiency.json');
