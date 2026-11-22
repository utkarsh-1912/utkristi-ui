import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const [testLog, bundleLog, benchmark] = await Promise.all([
  read('dist/verification-tests.json'), read('dist/verification-bundles.json'), read('dist/verification-benchmark.txt'),
]);
const { numTotalTests, numPassedTests, numFailedTests } = JSON.parse(testLog.replace(/^\uFEFF/, ''));
const verification = {
  recordedAt: new Date().toISOString(),
  tests: { total: numTotalTests, passed: numPassedTests, failed: numFailedTests },
  bundles: JSON.parse(bundleLog.replace(/^\uFEFF/, '')),
  benchmark: benchmark.trim(),
};
await writeFile(new URL('docs/dist/verification.json', root), JSON.stringify(verification, null, 2) + '\n');
