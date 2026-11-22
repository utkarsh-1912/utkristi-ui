// Packs the library, installs it into a throwaway Next.js App Router app, and runs `next build`.
// The page is a React Server Component that imports interactive kit components, so the build fails
// if a module loses its 'use client' directive or uses a pattern Next.js rejects at a client boundary.
// Run with: npm run build && npm run smoke:next
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = join(root, '.npm-cache');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this check with npm run smoke:next.');
const run = (args, cwd) => execFileSync(process.execPath, args, { cwd, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });

await mkdir(cache, { recursive: true });
const resolvedCache = await realpath(cache);
assert.equal(dirname(resolvedCache), await realpath(root));
const app = await mkdtemp(join(resolvedCache, 'next-smoke-'));
try {
  run([npmCli, 'pack', '--silent', '--ignore-scripts', '--pack-destination', app], root);
  await writeFile(join(app, 'package.json'), JSON.stringify({ name: 'utkristi-next-smoke', private: true }));
  await writeFile(join(app, 'next.config.mjs'), `export default { outputFileTracingRoot: ${JSON.stringify(app)} };\n`);
  await mkdir(join(app, 'app'));
  await writeFile(join(app, 'app', 'layout.jsx'), `import '@utkristi/ui/utkristi-ui.css';
export default function RootLayout({ children }) {
  return <html lang="en" data-theme="dark"><body>{children}</body></html>;
}
`);
  await writeFile(join(app, 'app', 'page.jsx'), `// Server Component: no 'use client' here.
import { Badge, Button, Card, Kbd, Stat, Tabs, ThemeProvider, ThemeSwitch } from '@utkristi/ui';
import { Icon } from '@utkristi/ui/icons';

export default function Page() {
  return (
    <ThemeProvider>
      <Card>
        <Badge tone="ok">Server rendered</Badge>
        <Stat value="12" label="Themes" />
        <p>Press <Kbd>K</Kbd> to search. <Icon name="search" /></p>
        <Button variant="solid">Client button</Button>
        <Tabs items={[{ id: 'a', label: 'One', content: 'First' }, { id: 'b', label: 'Two', content: 'Second' }]} />
        <ThemeSwitch />
      </Card>
    </ThemeProvider>
  );
}
`);
  run([npmCli, 'install', '--no-audit', '--no-fund', `./utkristi-ui-${pkg.version}.tgz`, 'next@15.5.29', 'react@19.3.1', 'react-dom@19.3.1'], app);
  run([join(app, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], app);
  const html = await readFile(join(app, '.next', 'server', 'app', 'index.html'), 'utf8');
  assert.match(html, /Server rendered/);
  assert.match(html, /class="btn btn-solid/);
  process.stdout.write('Next.js App Router build imported the kit from a server component.\n');
} finally {
  if (!process.env.KEEP_SMOKE) await rm(app, { recursive: true, force: true });
}
