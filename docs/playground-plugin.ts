import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { compileFunction } from 'node:vm';
import { build } from 'esbuild';
import postcss from 'postcss';
import ts from 'typescript';
import type { Plugin } from 'vite';
import { agentDocs } from './agent-docs';
export { agentDocs } from './agent-docs';

function namesIn(node: ts.Node) {
  const names = new Set<string>();
  function walk(child: ts.Node) {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, walk);
  }
  walk(node);
  return names;
}

function samples(file: string, text: string, recordName: string, includeStyles = false) {
  const diagnostics = ts.transpileModule(text, { fileName: file, reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).diagnostics ?? [];
  const error = diagnostics.find((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (error) throw new Error(`Cannot read examples in ${file}: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const definitions = new Map<string, ts.Statement>();
  const imports: ts.ImportDeclaration[] = [];
  let examples: ts.Expression | undefined;
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) imports.push(statement);
    if (ts.isFunctionDeclaration(statement) && statement.name) definitions.set(statement.name.text, statement);
    if (!ts.isVariableStatement(statement)) continue;
    for (const variable of statement.declarationList.declarations) {
      if (!ts.isIdentifier(variable.name)) continue;
      if (variable.name.text === recordName) examples = variable.initializer;
      else definitions.set(variable.name.text, statement);
    }
  }
  if (examples && ts.isSatisfiesExpression(examples)) examples = examples.expression;
  if (!examples || !ts.isObjectLiteralExpression(examples)) throw new Error('Missing example registry in ' + file);
  return Object.fromEntries(examples.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) return [];
    const key = property.name.getText(source).replace(/^['"]|['"]$/g, '');
    const item = property.initializer;
    const propertyValue = (name: string) => ts.isObjectLiteralExpression(item)
      ? item.properties.find((entry): entry is ts.PropertyAssignment =>
        ts.isPropertyAssignment(entry) && entry.name.getText(source) === name)?.initializer : undefined;
    const preview = ts.isCallExpression(item) ? item.arguments[2] : propertyValue('preview');
    const html = ts.isCallExpression(item) ? item.arguments[item.arguments.length - 1] : propertyValue('html');
    const name = ts.isCallExpression(item) ? item.arguments[0] : propertyValue('name');
    const description = ts.isCallExpression(item) ? item.arguments[1] : propertyValue('description');
    if (!preview) throw new Error('Missing preview for ' + key);
    if (!html || html === preview || (ts.isStringLiteralLike(html) && !html.text.trim())) throw new Error('Missing HTML source for ' + key);
    const names = namesIn(preview);
    const fixtures = new Set<ts.Statement>();
    for (const name of names) {
      const definition = definitions.get(name);
      if (!definition || fixtures.has(definition)) continue;
      fixtures.add(definition);
      for (const reference of namesIn(definition)) names.add(reference);
    }
    const selected = imports.flatMap((item) => {
      const clause = item.importClause;
      const moduleName = item.moduleSpecifier.getText(source);
      if (!clause || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) return [];
      const matches = clause.namedBindings.elements.filter((element) => names.has(element.name.text));
      return matches.length ? [`import { ${matches.map((element) => element.getText(source)).join(', ')} } from ${moduleName};`] : [];
    });
    const fixtureText = [...fixtures].sort((a, b) => a.pos - b.pos).map((entry) =>
      entry.getText(source).replace(/^export /, '')).join('\n\n');
    const primary = imports.flatMap((item) => {
      if (!ts.isStringLiteral(item.moduleSpecifier) || item.moduleSpecifier.text !== '@utkristi/ui') return [];
      const bindings = item.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings) || item.importClause?.isTypeOnly) return [];
      return bindings.elements.filter((element) => /^[A-Z]/.test(element.name.text) && !element.isTypeOnly && names.has(element.name.text))
        .map((element) => (element.propertyName ?? element.name).text);
    });
    const code = [
      ...selected,
      "import { ThemeProvider, ToastProvider, type ResolvedTheme } from '@utkristi/ui';",
      includeStyles ? "import '@utkristi/ui/utkristi-ui.css';" : '',
      fixtureText,
      ts.isIdentifier(preview) ? '' : 'const Preview = ' + preview.getText(source) + ';',
      `export default function Example({ theme }: { theme?: ResolvedTheme } = {}) {
  return <ThemeProvider defaultTheme={theme} storageKey={null}>
    <ToastProvider><${ts.isIdentifier(preview) ? preview.text : 'Preview'} /></ToastProvider>
  </ThemeProvider>;
}`,
    ].filter(Boolean).join('\n\n');
    return [[key, { code, components: primary, name: name && ts.isStringLiteralLike(name) ? name.text : key,
      description: description && ts.isStringLiteralLike(description) ? description.text : '',
      html: ts.isStringLiteralLike(html) ? html.text : undefined }]];
  }));
}

function apiFor(docs: string, source: string, examples: ReturnType<typeof samples>) {
  const config = ts.readConfigFile(join(source, '../../tsconfig.json'), ts.sys.readFile);
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, join(source, '../..')).options;
  const entry = join(source, 'index.ts');
  const paths = new Map(Object.entries(examples).map(([key, example]) => [join(docs, 'src', key + '.example.tsx').replaceAll('\\', '/'), example.code]));
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile;
  host.getSourceFile = (fileName, ...args) => {
    const generated = paths.get(fileName.replaceAll('\\', '/')) ?? paths.get(fileName);
    return generated === undefined ? original(fileName, ...args)
      : ts.createSourceFile(fileName, generated, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  };
  const program = ts.createProgram([entry, ...paths.keys()], options, host);
  const failures = [...paths.keys()].flatMap((path) => {
    const sample = program.getSourceFile(path);
    if (!sample) throw new Error('Unable to load example ' + path);
    return [...program.getSyntacticDiagnostics(sample), ...program.getSemanticDiagnostics(sample)];
  });
  if (failures.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(failures, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (name) => name,
    getNewLine: () => '\n',
  }));
  const requested = new Set(Object.values(examples).flatMap((sample) => sample.components));
  const checker = program.getTypeChecker();
  const file = program.getSourceFile(entry);
  const module = file && checker.getSymbolAtLocation(file);
  if (!module) throw new Error('Unable to read the kit exports');
  return Object.fromEntries(checker.getExportsOfModule(module).filter((symbol) => requested.has(symbol.name)).map((exported) => {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    const defaults = new Map<string, string>();
    function findDefaults(node: ts.Node) {
      if ((ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) && node.parameters[0]) {
        const binding = node.parameters[0].name;
        if (ts.isObjectBindingPattern(binding)) for (const item of binding.elements) {
          if (item.initializer) defaults.set(item.name.getText(), item.initializer.getText());
        }
        return;
      }
      ts.forEachChild(node, findDefaults);
    }
    if (declaration) findDefaults(declaration);
    const props = declaration && checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures()[0]?.parameters[0];
    const type = props && declaration ? checker.getTypeOfSymbolAtLocation(props, declaration) : undefined;
    const properties = type?.getProperties().flatMap((property) => {
      const prop = property.declarations?.find((node) => node.getSourceFile().fileName.replaceAll('\\', '/').startsWith(source));
      if (!prop) return [];
      return [{ name: property.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(property, prop), prop),
        required: !(property.flags & ts.SymbolFlags.Optional),
        description: ts.displayPartsToString(property.getDocumentationComment(checker)), defaultValue: defaults.get(property.name) }];
    }) ?? [];
    return [exported.name, properties];
  }));
}

const registries = [
  ['catalog', 'catalog', 'component'], ['examples', 'examples', 'component'], ['variants', 'variants', 'variant'],
  ['navbar-variants', 'navbarVariants', 'variant'], ['component-variants', 'componentVariants', 'variant'],
  ['blocks', 'blocks', 'block'], ['workflow-blocks', 'workflowBlocks', 'block'], ['worklist-blocks', 'worklistBlocks', 'block'],
] as const;

async function exampleMarkup(docs: string, source: string) {
  const imports = registries.map(([file, name], index) => `import { ${name} as samples${index} } from './${file}.tsx';`);
  const samples = registries.map((_, index) => `samples${index}`).join(', ');
  const { outputFiles: [entry] } = await build({
    stdin: {
      contents: `${imports.join('\n')}\nmodule.exports = Object.fromEntries(Object.entries(Object.assign({}, ${samples})).map(([id, example]) => [id, example.html]));`,
      resolveDir: join(docs, 'src'),
      loader: 'ts',
    },
    alias: { '@utkristi/ui': join(source, 'index.ts') },
    packages: 'external', bundle: true, format: 'cjs', platform: 'node', write: false, jsx: 'automatic',
  });
  // Load the authored docs registries once during the build. The markup strings
  // are exported directly and no preview or example script is executed.
  const module: { exports: Record<string, string> } = { exports: {} };
  compileFunction(entry.text, ['require', 'module', 'exports'], { filename: 'utkristi-example-markup.cjs' })(
    createRequire(join(docs, 'index.html')), module, module.exports,
  );
  return module.exports;
}

export async function generateReference(docs: string, source: string) {
  const paths = registries.map(([file]) => join(docs, 'src', file + '.tsx'));
  const tokenPath = join(source, '../styles/tokens.css');
  const cssPath = join(source, '../styles/components.css');
  const [registrations, markup, tokens, css, packageFile] = await Promise.all([
    Promise.all(registries.map(async ([, name, kind], index) => {
      const path = paths[index];
      const extracted = samples(path, await readFile(path, 'utf8'), name, true);
      return Object.fromEntries(Object.entries(extracted).map(([key, example]) => [key, { ...example, kind }]));
    })),
    exampleMarkup(docs, source),
    readFile(tokenPath, 'utf8'),
    readFile(cssPath, 'utf8'),
    readFile(join(source, '../../package.json'), 'utf8'),
  ]);
  const examples = Object.assign({}, ...registrations) as typeof registrations[number];
  for (const [id, example] of Object.entries(examples)) {
    if (!markup[id]?.trim()) throw new Error(`Missing rendered example markup for ${id}`);
    example.html = markup[id];
  }
  const classes = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    for (const [, name] of rule.selector.matchAll(/\.([a-z][a-z0-9-]*)/g)) classes.add(name);
  });
  const tokenIndex = new Map<string, Record<string, string>>();
  postcss.parse(tokens).walkDecls(/^--ut-/, (decl) => {
    if (decl.parent?.type !== 'rule') return;
    const values = tokenIndex.get(decl.prop) ?? {};
    values[decl.parent.selector] = decl.value;
    tokenIndex.set(decl.prop, values);
  });
  return { version: JSON.parse(packageFile).version as string, examples, api: apiFor(docs, source, examples),
    classes: [...classes].sort(), tokens: Object.fromEntries([...tokenIndex].sort(([a], [b]) => a.localeCompare(b))) };
}

export function docsPlayground(docs: string, source: string): Plugin {
  const prefix = 'virtual:utkristi-';
  const domPath = join(source, 'dom.ts');
  const cssFiles = ['tokens', 'base', 'components'].map((file) => join(source, '..', 'styles', file + '.css'));
  const loadKitStyles = () => Promise.all(cssFiles.map((file) => readFile(file, 'utf8')));
  const buildDom = async () => (await build({
    entryPoints: [domPath], bundle: true, write: false, minify: true, format: 'iife', globalName: 'UtkristiDOM',
  })).outputFiles[0].text;
  let reference: ReturnType<typeof generateReference> | undefined;
  const loadReference = () => reference ??= generateReference(docs, source);
  let agentAssets: Promise<Record<string, string>> | undefined;
  const loadAgentAssets = () => agentAssets ??= loadReference().then(agentDocs);
  async function registryItems() {
    const { examples, version } = await loadReference();
    const enterpriseStyles = await readFile(join(docs, 'src', 'enterprise.css'), 'utf8');
    const chatStyles = await readFile(join(docs, 'src', 'conversation-desk.css'), 'utf8');
    return Object.fromEntries(Object.entries(examples).filter(([, item]) => item.kind === 'block').map(([name, item]) => {
      const styles = name === 'conversation-desk' ? { name: 'utkristi-conversation-desk.css', content: chatStyles }
        : ['enterprise-landing', 'execution-desk'].includes(name) ? { name: 'utkristi-enterprise.css', content: enterpriseStyles } : undefined;
      const component = item.code.replace("\n\nimport '@utkristi/ui/utkristi-ui.css';", '');
      const code = ['"use client";', styles ? 'import "./' + styles.name + '";' : '', component].filter(Boolean).join('\n\n');
      const files: { path: string; type: string; content: string; target?: string }[] = [
        { path: `registry/${name}.tsx`, type: 'registry:component', content: code + '\n' },
      ];
      if (styles) files.push({ path: 'registry/' + styles.name, type: 'registry:file',
        target: '@components/' + styles.name, content: styles.content });
      return [name, {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        name, type: 'registry:block', title: item.name, description: item.description,
        dependencies: [`@utkristi/ui@${version}`],
        files,
      }];
    }));
  }
  return {
    name: 'utkristi-docs-playground',
    watchChange() { reference = undefined; agentAssets = undefined; },
    async generateBundle() {
      for (const [id, item] of Object.entries(await registryItems())) {
        this.emitFile({ type: 'asset', fileName: `r/${id}.json`, source: JSON.stringify(item, null, 2) });
      }
      this.emitFile({ type: 'asset', fileName: 'utkristi-dom.js', source: await buildDom() });
      this.emitFile({ type: 'asset', fileName: 'utkristi-ui.css', source: (await loadKitStyles()).join('\n\n') });
      for (const [fileName, source] of Object.entries(await loadAgentAssets())) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0].slice(1);
        if (!path || !/^(?:llms(?:-full)?\.txt|components\/[a-z0-9-]+\.md|component-manifest\.json)$/.test(path)) return next();
        void loadAgentAssets().then((files) => {
          const file = files[path];
          if (!file) return next();
          response.setHeader('Content-Type', path.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8');
          response.end(file);
        }).catch(next);
      });
      server.middlewares.use('/utkristi-ui.css', (_request, response, next) => {
        void loadKitStyles().then((css) => {
          response.setHeader('Content-Type', 'text/css; charset=utf-8');
          response.end(css.join('\n\n'));
        }).catch(next);
      });
      server.middlewares.use('/utkristi-dom.js', (_request, response, next) => {
        void buildDom().then((javascript) => {
          response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          response.end(javascript);
        }).catch(next);
      });
      server.middlewares.use('/r', (request, response, next) => {
        const id = /^\/([a-z0-9-]+)\.json(?:\?|$)/.exec(request.url ?? '')?.[1];
        if (!id) return next();
        void registryItems().then((items) => {
          if (!Object.hasOwn(items, id)) return next();
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify(items[id], null, 2));
        }).catch(next);
      });
    },
    resolveId(id) { if (id.startsWith(prefix)) return '\0' + id; },
    async load(id) {
      if (id === '\0' + prefix + 'examples') {
        for (const [file] of registries) this.addWatchFile(join(docs, 'src', file + '.tsx'));
        const { examples, api } = await loadReference();
        const previews = Object.fromEntries(Object.entries(examples).map(([id, { code, components }]) => [id, { code, components }]));
        return `export const examples = ${JSON.stringify(previews)}; export const api = ${JSON.stringify(api)};`;
      }
      if (id === '\0' + prefix + 'runtime') {
        const path = join(docs, 'src', 'playground-frame.tsx');
        this.addWatchFile(domPath);
        const [result, dom] = await Promise.all([build({
          entryPoints: [path], alias: { '@utkristi/ui': join(source, 'index.ts') }, jsx: 'automatic',
          bundle: true, write: false, minify: true, format: 'iife', define: { 'process.env.NODE_ENV': '"production"' },
        }), buildDom()]);
        for (const asset of [path, ...cssFiles]) this.addWatchFile(asset);
        const css = await loadKitStyles();
        const demoFiles = ['styles.css', 'enterprise.css', 'conversation-desk.css'].map((file) => join(docs, 'src', file));
        for (const file of demoFiles) this.addWatchFile(file);
        const demos = await Promise.all(demoFiles.map((file) => readFile(file, 'utf8')));
        const styles = [...css, ...demos].join('\n').replace(/^@tailwind .*$/gm, '');
        return `export const script = ${JSON.stringify(result.outputFiles[0].text)}; export const styles = ${JSON.stringify(styles)}; export const domScript = ${JSON.stringify(dom)};`;
      }
    },
  };
}
