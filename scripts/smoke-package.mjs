import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = join(root, '.npm-cache');
const registry = JSON.parse(await readFile(join(root, 'docs/dist/r/project-worklist.json'), 'utf8'));
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
assert.deepEqual(registry.dependencies, [`${pkg.name}@${pkg.version}`]);
assert.equal(registry.files.length, 1);
const code = registry.files[0].content;
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this check with npm run smoke:package.');
const npm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], { cwd, stdio: 'inherit' });

await mkdir(cache, { recursive: true });
const resolvedCache = await realpath(cache);
assert.equal(dirname(resolvedCache), await realpath(root));
const fixture = await mkdtemp(join(resolvedCache, 'package-smoke-'));
try {
  npm(['pack', '--silent', '--ignore-scripts', '--pack-destination', fixture], root);
  await writeFile(join(fixture, 'package.json'), JSON.stringify({ name: 'utkristi-package-smoke', private: true, type: 'module' }));
  npm(['install', '--ignore-scripts', '--no-audit', '--no-fund',
    `./utkristi-ui-${pkg.version}.tgz`, 'react@18.3.1', 'react-dom@18.3.1', 'vue@3.5.13'], fixture);
  const built = await transform(code, { loader: 'tsx', jsx: 'automatic', format: 'esm' });
  await writeFile(join(fixture, 'project-worklist.mjs'), built.code);
  await writeFile(join(fixture, 'check.mjs'), `
    import assert from 'node:assert/strict';
    import { readFile } from 'node:fs/promises';
    import { fileURLToPath } from 'node:url';
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import { JSDOM } from 'jsdom';
    import { initTabs } from '@utkristi/ui/dom';
    import Worklist from './project-worklist.mjs';

    const resolved = fileURLToPath(import.meta.resolve('@utkristi/ui'));
    assert.ok(resolved.startsWith(fileURLToPath(new URL('./node_modules/', import.meta.url))));
    assert.match(renderToStaticMarkup(createElement(Worklist)), /Loading rows/);
    const css = await readFile(new URL(import.meta.resolve('@utkristi/ui/css')), 'utf8');
    assert.match(css, /worklist-filters/);

    const dom = new JSDOM('<div id="app"></div>');
    for (const name of ['document', 'Element', 'HTMLElement', 'SVGElement', 'KeyboardEvent']) {
      globalThis[name] = dom.window[name];
    }
    const { createApp, h, onMounted, onUnmounted, ref } = await import('vue');
    const app = createApp({
      setup() {
        const root = ref();
        let clean;
        onMounted(() => { clean = initTabs(root.value); });
        onUnmounted(() => clean());
        const tab = (id, active) => h('button', {
          type: 'button', role: 'tab', id: 'tab-' + id, 'aria-controls': id,
          'aria-selected': String(active), tabindex: active ? 0 : -1,
        }, id);
        const panel = (id, active) => h('div', {
          role: 'tabpanel', id, 'aria-labelledby': 'tab-' + id, hidden: !active,
        }, id + ' content');
        return () => h('section', { ref: root, 'data-theme': 'glass' }, [
          h('div', { role: 'tablist', 'data-ut-tabs': '', class: 'tabs' }, [tab('overview', true), tab('activity', false)]),
          panel('overview', true), panel('activity', false),
        ]);
      },
    });
    app.mount('#app');
    const tab = document.querySelector('#tab-overview');
    tab.focus();
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert.equal(document.activeElement.id, 'tab-activity');
    assert.equal(document.querySelector('#activity').hidden, false);
    assert.equal(document.querySelector('#overview').hidden, true);
    app.unmount();
    dom.window.close();
    console.log('Verified packed CSS, React registry rendering, and Vue tabs with the standalone DOM runtime.');
  `);
  execFileSync(process.execPath, [join(fixture, 'check.mjs')], { cwd: fixture, stdio: 'inherit' });
} finally {
  const resolved = await realpath(fixture);
  if (dirname(resolved) === resolvedCache && resolved.startsWith(join(resolvedCache, 'package-smoke-'))) {
    await rm(resolved, { recursive: true, force: true });
  }
}
