import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import postcss from 'postcss';

const source = (name) => new URL(`../src/styles/${name}.css`, import.meta.url);
const target = (name) => new URL(`../dist/${name}`, import.meta.url);
const [tokens, base, components] = await Promise.all(
  ['tokens', 'base', 'components'].map((name) => readFile(source(name), 'utf8')),
);

const css = [tokens, base, components].join('\n\n');
const { code } = await transform(css, { loader: 'css', minify: true, legalComments: 'none' });

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
const glass = rules.find((rule) => rule.selector.startsWith('.glass,'));
const values = (...rules) => Object.fromEntries(
  rules.flatMap((rule) => rule.nodes.filter((node) => node.type === 'decl' && node.prop.startsWith('--ut-'))
    .map(({ prop, value }) => [prop, value])),
);
const themes = { night: values(shared, night), paper: values(shared, paper), glass: values(shared, glass) };
const declarations = Object.entries(themes).map(([name, data]) =>
  `export declare const ${name}: {\n${Object.keys(data).map((key) => `  readonly "${key}": string;`).join('\n')}\n};`,
).join('\n');
const exports = Object.entries(themes).map(([name, data]) =>
  `const ${name} = Object.freeze(${JSON.stringify(data, null, 2)});`,
).join('\n');

await mkdir(target(''), { recursive: true });
await Promise.all([
  writeFile(target('utkristi-ui.css'), css),
  writeFile(target('utkristi-ui.min.css'), code),
  writeFile(target('scoped.css'), scoped),
  copyFile(source('tokens'), target('tokens.css')),
  copyFile(source('fonts'), target('fonts.css')),
  writeFile(target('tokens.js'), `${exports}\nexport { night, paper, glass };\n`),
  writeFile(target('tokens.cjs'), `${exports}\nmodule.exports = { night, paper, glass };\n`),
  ...['d.ts', 'd.cts'].map((extension) => writeFile(target(`tokens.${extension}`), declarations + '\n')),
]);
