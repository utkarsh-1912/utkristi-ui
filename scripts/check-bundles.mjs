import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const budgets = { Button: 2000, Badge: 2000, Select: 2500, DataTable: 10000 };
const results = await Promise.all(Object.entries(budgets).map(async ([name, budget]) => {
  const { outputFiles, metafile } = await build({
    stdin: { contents: `export { ${name} } from '@utkristi/ui';`, resolveDir: root },
    bundle: true, minify: true, format: 'esm', write: false, metafile: true,
    external: ['react', 'react-dom', '*.css'],
    tsconfigRaw: {},
  });
  const bytes = gzipSync(outputFiles[0].contents).length;
  const catalog = Object.values(metafile.outputs).some(({ inputs }) =>
    Object.entries(inputs).some(([path, { bytesInOutput }]) =>
      bytesInOutput > 0 && /\/react\/icons(?:\.js|\/generated\/(?:index|renders|manifest)\.js)$/.test(path.replaceAll('\\', '/'))));
  return { name, budget, bytes, catalog };
}));

for (const { name, budget, bytes, catalog } of results) {
  console.log(`${name}: ${bytes} bytes gzipped (budget ${budget})${catalog ? ' · icon catalog retained' : ''}`);
  if (catalog || bytes > budget) process.exitCode = 1;
}
