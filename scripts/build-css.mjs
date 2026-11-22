import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import postcss from 'postcss';

const source = (name) => new URL(`../src/styles/${name}.css`, import.meta.url);
const target = (name) => new URL(`../dist/${name}`, import.meta.url);
const [tokens, base, components] = await Promise.all(
  ['tokens', 'base', 'components'].map((name) => readFile(source(name), 'utf8')),
);

const css = [tokens, base, components].join('\n\n');
const { code } = await transform(css, { loader: 'css', minify: true, legalComments: 'none' });

// Opt-in build wrapped in cascade layers: any unlayered app CSS overrides the kit without !important.
const layered = [
  '@layer utkristi.tokens, utkristi.base, utkristi.components;',
  `@layer utkristi.tokens {\n${tokens}\n}`,
  `@layer utkristi.base {\n${base}\n}`,
  `@layer utkristi.components {\n${components}\n}`,
].join('\n\n');
const { code: layeredMin } = await transform(layered, { loader: 'css', minify: true, legalComments: 'none' });

const scope = ':where([data-ut-scope])';
function scopedStyles(source, kind) {
  const sheet = postcss.parse(source);
  sheet.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
    if (kind === 'base' && rule.selector === 'body') {
      rule.walkDecls(/^(margin|min-height)$/, (declaration) => declaration.remove());
    }
    rule.selectors = rule.selectors.flatMap((selector) => {
      if (selector === ':root' || (kind === 'base' && /^(html|body)$/.test(selector))) return [scope];
      if (kind === 'tokens') return [scope + selector, `${scope} ${selector}`];
      if (kind === 'base' && selector.startsWith('*')) return [scope + selector.slice(1), `${scope} ${selector}`];
      if (kind === 'components' && /^(\[data-ut-|:where\(\[data-ut-)/.test(selector)) return [scope + selector, `${scope} ${selector}`];
      return [`${scope} ${selector}`];
    });
  });
  return sheet.toString();
}
const scoped = [scopedStyles(tokens, 'tokens'), scopedStyles(base, 'base'), scopedStyles(components, 'components')].join('\n\n');

const rules = postcss.parse(tokens).nodes.filter((node) => node.type === 'rule');
const [shared, night, paper] = rules;
const values = (...rules) => Object.fromEntries(
  rules.flatMap((rule) => rule.nodes.filter((node) => node.type === 'decl' && node.prop.startsWith('--ut-'))
    .map(({ prop, value }) => [prop, value])),
);
// Every `.name, [data-theme="name"]` block after night and paper is an extra appearance.
const camel = (id) => id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const extra = rules
  .map((rule) => [rule, /^\.([a-z-]+), \[data-theme="\1"\]$/.exec(rule.selector)?.[1]])
  .filter(([, id]) => id);
const themes = {
  night: values(shared, night),
  paper: values(shared, paper),
  ...Object.fromEntries(extra.map(([rule, id]) => [camel(id), values(shared, rule)])),
};
const names = Object.keys(themes);
const declarations = Object.entries(themes).map(([name, data]) =>
  `export declare const ${name}: {\n${Object.keys(data).map((key) => `  readonly "${key}": string;`).join('\n')}\n};`,
).join('\n');
const exports = Object.entries(themes).map(([name, data]) =>
  `const ${name} = Object.freeze(${JSON.stringify(data, null, 2)});`,
).join('\n');

// Per-component files: dist/css/core.css (tokens, base, type helpers, shared rules) plus one file per component family.
// A rule goes to every family its selector names, so shared rules such as focus rings are repeated where needed.
const families = {
  button: ['btn', 'button', 'icon-btn', 'split-button'],
  forms: ['input', 'textarea', 'select', 'field', 'fieldset', 'search', 'checkbox', 'radio', 'switch', 'choice', 'combobox', 'date', 'file', 'floating'],
  badge: ['badge', 'chip', 'dot'],
  menu: ['menu', 'pop', 'popover', 'context'],
  navbar: ['navbar', 'header', 'strip', 'burger', 'sheet', 'brand', 'mega', 'bottom'],
  segmented: ['seg'],
  tabs: ['tabs', 'tab'],
  steps: ['steps', 'step'],
  stat: ['stats', 'stat', 'num'],
  'rich-text': ['rich-text'],
  table: ['table', 'cell', 'data', 'pagination'],
  core: ['display', 'lede', 'label', 'mono', 'muted', 'faint', 'link', 'type', 'typography', 'page', 'section', 'rule', 'grain', 'kit', 'ut', 'theme', 'hover', 'is'],
};
const prefixes = Object.entries(families)
  .flatMap(([file, names]) => names.map((name) => [name, file]))
  .sort((a, b) => b[0].length - a[0].length);
const familyOf = (className) => {
  for (const [name, file] of prefixes) if (className === name || className.startsWith(`${name}-`)) return file;
  return className.split('-')[0];
};
const componentSheet = postcss.parse(components);
const buckets = new Map();
const bucket = (name) => buckets.get(name) ?? buckets.set(name, postcss.root()).get(name);
const keyframes = new Map();
componentSheet.walkAtRules(/keyframes$/, (rule) => { keyframes.set(rule.params, rule); });
componentSheet.walkAtRules('property', (rule) => { bucket('core').append(rule.clone()); });
componentSheet.walkRules((rule) => {
  if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
  const names = new Set([...rule.selector.matchAll(/\.([a-z][a-z0-9-]*)/g)].map(([, name]) => familyOf(name)));
  if (!names.size) names.add('core');
  for (const name of names) {
    // Rebuild the at-rule chain (@media, @supports, @container) around a copy of the rule.
    let node = rule.clone();
    for (let parent = rule.parent; parent && parent.type === 'atrule'; parent = parent.parent) {
      node = parent.clone({ nodes: [] }).append(node);
    }
    bucket(name).append(node);
  }
});
const perComponent = new Map();
for (const [name, root] of buckets) {
  const text = root.toString();
  const used = [...keyframes.keys()].filter((key) => new RegExp(`\\b${key}\\b`).test(text));
  const frames = used.map((key) => keyframes.get(key).toString()).join('\n');
  perComponent.set(name, [name === 'core' ? `${tokens}\n\n${base}` : '', text, frames].filter(Boolean).join('\n\n'));
}
const cssManifest = Object.fromEntries([...perComponent.keys()].sort().map((name) => [name, {
  file: `css/${name}.css`,
  requires: name === 'core' ? [] : ['core'],
}]));

const { outputFiles: [formatter] } = await build({
  entryPoints: [fileURLToPath(new URL('../src/react/theme-engine/token-format.ts', import.meta.url))],
  bundle: true, format: 'esm', target: 'node18', write: false,
});
const { tokensToDTCG2025 } = await import(`data:text/javascript;base64,${Buffer.from(formatter.contents).toString('base64')}`);
const dtcg = tokensToDTCG2025({
  night: values(shared, night), paper: values(shared, night, paper),
  ...Object.fromEntries(extra.map(([rule, id]) => [id, values(shared, night, rule)])),
});

await mkdir(target(''), { recursive: true });
await mkdir(target('css'), { recursive: true });
await Promise.all([...perComponent].map(async ([name, text]) => {
  const { code: minified } = await transform(text, { loader: 'css', minify: true, legalComments: 'none' });
  await writeFile(target(`css/${name}.css`), minified);
}));
await writeFile(target('css/manifest.json'), JSON.stringify(cssManifest, null, 2) + '\n');
await Promise.all([
  writeFile(target('utkristi-ui.css'), css),
  writeFile(target('utkristi-ui.min.css'), code),
  writeFile(target('utkristi-ui.layered.css'), layered),
  writeFile(target('utkristi-ui.layered.min.css'), layeredMin),
  writeFile(target('scoped.css'), scoped),
  copyFile(source('tokens'), target('tokens.css')),
  copyFile(source('fonts'), target('fonts.css')),
  writeFile(target('tokens.js'), `${exports}\nexport { ${names.join(', ')} };\n`),
  writeFile(target('tokens.json'), JSON.stringify(dtcg, null, 2) + '\n'),
  writeFile(target('style-dictionary.config.json'), JSON.stringify({
    source: ['tokens.json'],
    usesDtcg: true,
    platforms: { css: { transformGroup: 'css', buildPath: 'build/',
      files: [{ destination: 'utkristi-tokens.css', format: 'css/variables', options: { outputReferences: true } }] } },
  }, null, 2) + '\n'),
  writeFile(target('tokens.cjs'), `${exports}\nmodule.exports = { ${names.join(', ')} };\n`),
  ...['d.ts', 'd.cts'].map((extension) => writeFile(target(`tokens.${extension}`), declarations + '\n')),
]);
