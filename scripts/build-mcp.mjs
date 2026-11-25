import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const directory = new URL('../packages/ui-mcp/dist/', import.meta.url);
const generator = fileURLToPath(new URL('generate-reference.mjs', directory));
const docs = fileURLToPath(new URL('../docs/', import.meta.url)).replaceAll('\\', '/');
const source = fileURLToPath(new URL('../src/react/', import.meta.url)).replaceAll('\\', '/');
await mkdir(directory, { recursive: true });
await copyFile(new URL('../LICENSE', import.meta.url), new URL('LICENSE', directory));
await build({ entryPoints: [new URL('../docs/playground-plugin.ts', import.meta.url)].map(fileURLToPath),
  platform: 'node', format: 'esm', bundle: true, packages: 'external', outfile: generator });
try {
  const { generateReference, agentDocs } = await import(pathToFileURL(generator).href);
  const manifest = agentDocs(await generateReference(docs, source))['component-manifest.json'];
  await writeFile(new URL('component-manifest.json', directory), manifest);
} finally {
  await rm(generator, { force: true });
}
await build({ entryPoints: [fileURLToPath(new URL('../packages/ui-mcp/server.mjs', import.meta.url))],
  platform: 'node', format: 'esm', target: 'node18', bundle: true,
  outfile: fileURLToPath(new URL('server.mjs', directory)) });

const require = createRequire(import.meta.url);
const parser = require.resolve('parse5');
const packages = [['parse5', parser], ['entities', createRequire(parser).resolve('entities')]];
const notices = await Promise.all(packages.map(async ([name, entry]) => {
  let folder = dirname(entry);
  while (dirname(folder) !== folder) {
    try { return `${name}\n\n${(await readFile(join(folder, 'LICENSE'), 'utf8')).trim()}`; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    folder = dirname(folder);
  }
  throw new Error(`Missing license for bundled package ${name}`);
}));
await writeFile(new URL('THIRD-PARTY-LICENSES.txt', directory), notices.join('\n\n') + '\n');

