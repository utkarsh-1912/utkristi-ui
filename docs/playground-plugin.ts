import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';
import ts from 'typescript';
import type { Plugin } from 'vite';

function namesIn(node: ts.Node) {
  const names = new Set<string>();
  function walk(child: ts.Node) {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, walk);
  }
  walk(node);
  return names;
}

function samples(file: string, text: string, recordName: string) {
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
    const preview = ts.isCallExpression(item) ? item.arguments[2] : ts.isObjectLiteralExpression(item)
      ? item.properties.find((entry): entry is ts.PropertyAssignment =>
        ts.isPropertyAssignment(entry) && entry.name.getText(source) === 'preview')?.initializer : undefined;
    if (!preview) throw new Error('Missing preview for ' + key);
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
    const kitImport = imports.find((item) => ts.isStringLiteral(item.moduleSpecifier) && item.moduleSpecifier.text === '@utkristi/ui');
    const components = kitImport?.importClause?.namedBindings;
    const primary = components && ts.isNamedImports(components)
      ? components.elements.filter((element) => /^[A-Z]/.test(element.name.text) && !element.isTypeOnly && names.has(element.name.text))
        .map((element) => element.name.text) : [];
    const code = [
      ...selected,
      "import { ThemeProvider, ToastProvider, type ResolvedTheme } from '@utkristi/ui';",
      fixtureText,
      ts.isIdentifier(preview) ? '' : 'const Preview = ' + preview.getText(source) + ';',
      `export default function Example({ theme }: { theme?: ResolvedTheme } = {}) {
  return <ThemeProvider defaultTheme={theme} storageKey={null}>
    <ToastProvider><${ts.isIdentifier(preview) ? preview.text : 'Preview'} /></ToastProvider>
  </ThemeProvider>;
}`,
    ].filter(Boolean).join('\n\n');
    return [[key, { code, components: primary }]];
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
    const props = declaration && checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures()[0]?.parameters[0];
    const type = props && declaration ? checker.getTypeOfSymbolAtLocation(props, declaration) : undefined;
    const properties = type?.getProperties().flatMap((property) => {
      const prop = property.declarations?.find((node) => node.getSourceFile().fileName.replaceAll('\\', '/').startsWith(source));
      if (!prop) return [];
      return [{ name: property.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(property, prop), prop),
        required: !(property.flags & ts.SymbolFlags.Optional),
        description: ts.displayPartsToString(property.getDocumentationComment(checker)) }];
    }) ?? [];
    return [exported.name, properties];
  }));
}

export function docsPlayground(docs: string, source: string): Plugin {
  const prefix = 'virtual:utkristi-';
  return {
    name: 'utkristi-docs-playground',
    resolveId(id) { if (id.startsWith(prefix)) return '\0' + id; },
    async load(id) {
      if (id === '\0' + prefix + 'examples') {
        const entries = await Promise.all(['catalog', 'examples'].map(async (file) => {
          const path = join(docs, 'src', file + '.tsx');
          this.addWatchFile(path);
          return samples(path, await readFile(path, 'utf8'), file);
        }));
        const examples = Object.assign({}, ...entries) as ReturnType<typeof samples>;
        const api = apiFor(docs, source, examples);
        return `export const examples = ${JSON.stringify(examples)}; export const api = ${JSON.stringify(api)};`;
      }
      if (id === '\0' + prefix + 'runtime') {
        const path = join(docs, 'src', 'playground-frame.tsx');
        const result = await build({
          entryPoints: [path], alias: { '@utkristi/ui': join(source, 'index.ts') }, jsx: 'automatic',
          bundle: true, write: false, minify: true, format: 'iife', define: { 'process.env.NODE_ENV': '"production"' },
        });
        for (const asset of [path, ...['tokens', 'base', 'components'].map((file) => join(source, '..', 'styles', file + '.css'))]) this.addWatchFile(asset);
        const css = await Promise.all(['tokens', 'base', 'components'].map((file) => readFile(join(source, '..', 'styles', file + '.css'), 'utf8')));
        const demos = await readFile(join(docs, 'src', 'styles.css'), 'utf8');
        return `export const script = ${JSON.stringify(result.outputFiles[0].text)}; export const styles = ${JSON.stringify(css.join('\n') + demos.replace(/^@tailwind .*$/gm, ''))};`;
      }
    },
  };
}
