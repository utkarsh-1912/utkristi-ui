import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { join, resolve, sep } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const screenshots = join(root, 'docs', 'screenshots');
const url = 'http://127.0.0.1:4173';
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const themes = [['dark', 'night'], ['light', 'paper'], ['glass', 'glass']];
const viewport = { width: 1440, height: 1800 };
const mobileViewport = { width: 390, height: 900 };
const captureOnly = process.argv.includes('--capture-only');

async function run(args) {
  const child = spawn(process.execPath, [vite, ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error(`Vite ${args[0]} exited with code ${code}`);
}

async function retry(work, description, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const result = await work();
      if (result) return result;
    } catch {
      // Startup is asynchronous.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function connect(address, onEvent) {
  const socket = new WebSocket(address);
  await new Promise((accept, reject) => {
    socket.addEventListener('open', accept, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method) onEvent?.(message);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.accept(message.result);
  });
  socket.addEventListener('close', () => {
    for (const request of pending.values()) request.reject(new Error('Edge disconnected'));
    pending.clear();
  });
  return {
    close: () => socket.close(),
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((accept, reject) => {
        pending.set(id, { accept, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function captureEdge() {
  const profile = await mkdtemp(join(root, '.edge-preview-'));
  const browser = spawn(edge, ['--headless', '--hide-scrollbars', '--no-first-run', '--disable-extensions', '--disable-background-networking',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { cwd: root, stdio: 'ignore', windowsHide: true });
  const exited = once(browser, 'exit').catch(() => {});
  let client;
  try {
    const port = await retry(async () => (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0], 'Edge');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const exceptions = [];
    client = await connect(targets.find((target) => target.type === 'page').webSocketDebuggerUrl, ({ method, params }) => {
      if (method === 'Runtime.exceptionThrown') {
        const detail = params.exceptionDetails;
        exceptions.push(detail.exception?.description ?? detail.text);
      }
    });
    const { send } = client;
    await send('Runtime.enable');
    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    };
    const size = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const load = async (hash, title) => {
      await send('Page.navigate', { url: `${url}/#${hash}` });
      try { await retry(() => evaluate(`document.querySelector('h1')?.textContent.trim() === ${JSON.stringify(title)}`), title); }
      catch (error) {
        if (exceptions.length) throw new Error('Browser error on ' + hash + ': ' + exceptions.join('\n'), { cause: error });
        throw error;
      }
    };
    const fontsReady = () => evaluate('Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(resolve, 4000))])');
    const screenshot = async (file, fullPage = false) => {
      const clip = fullPage ? { x: 0, y: 0, width: viewport.width, height: Math.ceil((await send('Page.getLayoutMetrics')).cssContentSize.height), scale: 1 } : undefined;
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: fullPage, clip });
      await writeFile(join(screenshots, `${file}.png`), Buffer.from(data, 'base64'));
    };
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await size(viewport.width, viewport.height);
    for (const [theme, file] of themes) {
      await load(`/showcase?theme=${theme}`, 'Build together.');
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}'`), theme);
      await retry(() => evaluate('getComputedStyle(document.querySelector(".header-dock .navbar-links")).display === "flex"'), 'desktop dock links');
      await fontsReady();
      await screenshot(file, true);
    }
    await size(mobileViewport.width, mobileViewport.height);
    await load('/components/command?theme=glass', 'Command');
    await retry(() => evaluate('document.documentElement.dataset.theme === "glass" && !!document.querySelector(".command [role=listbox]")'), 'mobile Command example');
    await fontsReady();
    await screenshot('mobile-docs');
    await evaluate('document.querySelector(".docs-navbar .burger").click()');
    await retry(() => evaluate('!!document.querySelector(".sheet-dock [aria-current=page]")'), 'mobile navigation screenshot');
    await screenshot('mobile-menu');
    await evaluate(`document.querySelector('.sheet-dock [aria-label="Close menu"]').click()`);
    process.stdout.write('Captured full showcases in Night, Paper, and Glass and both mobile views.\n');
    if (captureOnly) return;
    await send('Emulation.setEmulatedMedia', { features: [] });

    await size(1280, 860);
    await load('/showcase?theme=glass', 'Build together.');
    await retry(() => evaluate('document.querySelector(".docs-navbar select").value === "glass"'), 'theme dropdown reflects preview');
    await evaluate(`(() => {
      const select = document.querySelector('.docs-navbar select');
      select.value = 'light';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await retry(() => evaluate('document.documentElement.dataset.theme === "light" && localStorage.getItem("utkristi-theme") === "light" && !location.hash.includes("theme=") && document.querySelector(".docs-footer select").value === "light"'), 'theme dropdown persists and stays in sync');
    await evaluate(`(() => {
      document.querySelector('.docs-navbar .navbar-search').focus();
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
    })()`);
    await retry(() => evaluate('document.activeElement?.getAttribute("aria-label") === "Find a component or guide"'), 'search keyboard shortcut');
    await evaluate(`(() => {
      const field = document.activeElement;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, 'grid rows');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await retry(() => evaluate('document.querySelector(".docs-search-dialog [aria-selected=true]")?.getAttribute("aria-label") === "Data Table"'), 'search matches multiple keywords');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Data Table" && !document.querySelector(".docs-search-dialog")'), 'search Enter opens the result');

    await size(375, 812);
    await load('/showcase?theme=glass', 'Build together.');
    await retry(() => evaluate('getComputedStyle(document.querySelector(".header-dock .burger")).display !== "none"'), 'mobile dock button');
    await evaluate('(() => { const button = document.querySelector(".header-dock .burger"); button.focus(); button.click(); })()');
    await retry(() => evaluate('document.activeElement?.getAttribute("aria-label") === "Close menu" && !!document.querySelector(".sheet-dock [aria-current=page]")'), 'focused mobile dock');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
    await retry(() => evaluate('document.activeElement === document.querySelector(".header-dock .burger") && !document.querySelector(".sheet-dock")'), 'restored dock focus');
    await evaluate('document.querySelector(".header-dock .burger").click()');
    await retry(() => evaluate('!!document.querySelector(".sheet-dock-backdrop")'), 'mobile menu backdrop');
    await size(1024, 812);
    await retry(() => evaluate('!document.querySelector(".sheet-dock") && getComputedStyle(document.querySelector(".docs-navbar .navbar-links")).display === "flex"'), 'menu closes when the desktop links fit');
    await size(375, 812);
    await evaluate('document.querySelector(".header-dock .burger").click()');
    await retry(() => evaluate('!!document.querySelector(".sheet-dock-backdrop")'), 'mobile menu after resizing');
    await evaluate('document.querySelector(".sheet-dock-backdrop").dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))');
    await retry(() => evaluate('!document.querySelector(".sheet-dock")'), 'backdrop dismisses the mobile menu');
    await evaluate('document.querySelector(".header-dock .burger").click()');
    await retry(() => evaluate('!!document.querySelector(".sheet-dock .sheet-search")'), 'dock search button');
    await evaluate('document.querySelector(".sheet-dock .sheet-search").click()');
    await retry(() => evaluate('document.activeElement?.getAttribute("aria-label") === "Find a component or guide"'), 'focused docs search');
    await evaluate(`document.querySelector('.docs-search-dialog [role=option][aria-label="Carousel"]').click()`);
    await retry(() => evaluate('document.querySelector("h1")?.textContent.trim() === "Carousel" && !document.querySelector(".sheet-dock, .modal")'), 'docs search navigation');
    await load('/getting-started', 'Getting started');
    const links = await evaluate(`Array.from(document.querySelectorAll('.doc-sidebar a'), link => [link.hash.slice(1), link.textContent])`);
    const routes = [['/overview', 'Utkristi UI'], ['/showcase', 'Build together.'], ...links];
    const overflow = [];
    for (const [theme] of themes) {
      for (const [path, title] of routes) {
        await load(path + '?theme=' + theme, title);
        await retry(() => evaluate('document.documentElement.dataset.theme === ' + JSON.stringify(theme)), theme);
        if (path.startsWith('/components/')) await retry(() => evaluate('!!document.querySelector(".component-api")'), path + ' generated example');
        const width = await evaluate('document.documentElement.scrollWidth');
        if (width > 375) overflow.push(path + ' (' + theme + ', ' + width + 'px)');
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow at 375px: ${overflow.join(', ')}`);
    const responsiveRoutes = [
      ['/overview', 'Utkristi UI'], ['/icons', 'Icons'], ['/tokens', 'Tokens'], ['/showcase', 'Build together.'],
      ['/components/command', 'Command'], ['/components/data-table', 'Data Table'], ['/components/file-input', 'File Input'],
      ['/sandbox?component=command', 'Sandbox'],
    ];
    for (const width of [320, 390, 768, 981, 1024, 1440]) {
      await size(width, width >= 1024 ? 900 : 740);
      for (const [theme] of themes) {
        for (const [path, title] of responsiveRoutes) {
          await load(path + (path.includes('?') ? '&' : '?') + 'theme=' + theme, title);
          const actual = await evaluate('document.documentElement.scrollWidth');
          if (actual > width) overflow.push(`${path} (${theme}, ${actual}px at ${width}px)`);
          const fits = await evaluate(`(() => {
            const bar = document.querySelector('.docs-navbar');
            const links = bar.querySelector('.navbar-links');
            const burger = bar.querySelector('.burger');
            const desktop = getComputedStyle(links).display !== 'none';
            if (!desktop) return ${width} <= 980 && getComputedStyle(burger).display !== 'none';
            const rows = new Set(Array.from(links.querySelectorAll('a'), link => Math.round(link.getBoundingClientRect().top)));
            return ${width} > 980 && getComputedStyle(burger).display === 'none' && rows.size === 1 && links.scrollWidth <= links.clientWidth;
          })()`);
          if (!fits) overflow.push(`${path} (${theme}, navigation does not fit at ${width}px)`);
        }
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow: ${overflow.join(', ')}`);
    await size(375, 812);
    await load('/getting-started?theme=glass', 'Getting started');
    await evaluate('document.querySelector(".doc-index-toggle").click()');
    await retry(() => evaluate('document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "true"'), 'open mobile docs index');
    await evaluate(`document.querySelector('.doc-index a[href="#/components/command"]').click()`);
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Command" && document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "false"'), 'mobile index navigation');
    await load('/icons?theme=glass', 'Icons');
    await evaluate('Array.from(document.querySelectorAll(\'[aria-label="Icon style"] button\')).find(button => button.textContent.trim() === "3D").click()');
    await retry(() => evaluate(`['dark', 'light', 'glass'].every((theme, index) => {
      const icon = document.querySelector('.theme-preview[data-theme="' + theme + '"] .icon-3d img');
      return icon?.getAttribute('src').includes('/' + ['night', 'paper', 'glass'][index] + '/');
    })`), 'independent Night, Paper and Glass icon renders');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
    await retry(() => evaluate('getComputedStyle(document.querySelector(".icon-3d-fallback")).display !== "none"'), 'forced-colour icon fallback');
    await send('Emulation.setEmulatedMedia', { features: [] });
    for (const [theme] of themes) {
      await load('/components/carousel?theme=' + theme, 'Carousel');
      const selector = '.theme-preview[data-theme="' + theme + '"] .carousel';
      const frame = JSON.stringify(selector);
      const next = JSON.stringify('[aria-label="Next slide"]');
      await evaluate('document.querySelector(' + frame + ').querySelector(' + next + ').click()');
      await retry(() => evaluate(`(() => {
        const carousel = document.querySelector(${frame});
        const viewport = carousel.querySelector(".carousel-viewport");
        return Math.abs(viewport.scrollLeft - viewport.clientWidth) < 2 &&
          carousel.querySelector("[role=status]").textContent.includes("Slide 2 of");
      })()`), theme + ' carousel movement');
      await load('/components/data-table?theme=' + theme, 'Data Table');
      const tablePreview = JSON.stringify('.theme-preview[data-theme="' + theme + '"]');
      await evaluate(`document.querySelector(${tablePreview}).querySelector('[aria-label="Select Design"]').click()`);
      await retry(() => evaluate(`(() => {
        const preview = document.querySelector(${tablePreview});
        return preview.querySelector('.data-table-controls input[type=checkbox]').indeterminate &&
          preview.querySelector('[role=status]').textContent === '1 selected';
      })()`), theme + ' table selection');
      await evaluate(`document.querySelector(${tablePreview}).querySelector('[aria-label="Next page"]').click()`);
      await evaluate(`document.querySelector(${tablePreview}).querySelector('.data-table-controls input[type=checkbox]').click()`);
      await retry(() => evaluate(`document.querySelector(${tablePreview}).querySelector('[role=status]').textContent === '2 selected'`), theme + ' table page selection');
    }
    await load('/sandbox?component=carousel&theme=glass', 'Sandbox');
    const ready = () => evaluate('document.querySelector(".playground [role=status]")?.textContent === "React preview ready"');
    await retry(ready, 'initial React sandbox');
    await evaluate('Array.from(document.querySelectorAll(".playground-devices button")).find(button => button.textContent.trim() === "Phone").click()');
    await retry(() => evaluate('document.querySelector(".playground-stage").dataset.viewport === "phone"'), 'sandbox phone preview');
    async function setSource(source) {
      await evaluate(`(() => {
        const editor = document.querySelector("#sandbox-source");
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(editor, ${JSON.stringify(source)});
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      })()`);
    }
    async function runSource(source) {
      await setSource(source);
      const before = await evaluate('document.querySelector(".playground iframe")?.dataset.previewRun');
      return evaluate(`new Promise((resolve, reject) => {
        const start = performance.now();
        const area = document.querySelector(".playground");
        const observer = new MutationObserver(() => {
          const status = area.querySelector("[role=status]")?.textContent;
          const run = area.querySelector("iframe")?.dataset.previewRun;
          const error = area.querySelector(".playground-error")?.textContent;
          if (error) { finish(); reject(new Error(error)); }
          else if (run && run !== ${JSON.stringify(before)} && status === "React preview ready") {
            finish(); resolve(performance.now() - start);
          }
        });
        function finish() { clearTimeout(timeout); observer.disconnect(); }
        const timeout = setTimeout(() => { finish(); reject(new Error("Sandbox run timed out")); }, 8000);
        observer.observe(area, { childList: true, subtree: true, characterData: true });
        Array.from(area.querySelectorAll("button")).find(button => button.textContent.trim() === "Run").click();
      })`);
    }
    const edited = 'export default function Example() { return <p>Edited sandbox example</p>; }';
    await runSource(edited);
    if (process.argv.includes('--stress')) {
      await send('Emulation.setCPUThrottlingRate', { rate: 4 });
      try {
        const times = [];
        for (let index = 0; index < 12; index++) {
          const data = index % 2 === 0
            ? 'import { DataTable } from "@utkristi/ui"; const rows = Array.from({ length: 5000 }, (_, id) => ({ id, name: "Workspace " + id })); export default function Example() { return <DataTable rows={rows} columns={[{ key: "name", header: "Workspace", sortValue: row => row.name }]} getRowKey={row => row.id} pageSize={20} />; }'
            : 'import { Carousel } from "@utkristi/ui"; const slides = Array.from({ length: 60 }, (_, id) => ({ id: String(id), content: <p>Slide {id + 1}</p> })); export default function Example() { return <Carousel slides={slides} />; }';
          times.push(await runSource(data));
          const frames = await evaluate('document.querySelectorAll(".playground iframe").length');
          if (frames !== 1) throw new Error('Sandbox left an extra preview frame mounted');
        }
        let invalid = false;
        try { await runSource('export default function {'); }
        catch (error) { invalid = !String(error).includes('timed out'); }
        if (!invalid) throw new Error('The sandbox did not report invalid TSX');
        await runSource(edited);
        times.sort((a, b) => a - b);
        process.stdout.write('4× CPU stress: 12 runs with 5,000 table rows or 60 slides, median ' +
          Math.round((times[5] + times[6]) / 2) + ' ms, p95 ' + Math.round(times[11]) + ' ms. Invalid TSX recovered.\n');
      } finally {
        await send('Emulation.setCPUThrottlingRate', { rate: 1 });
      }
    }
    await evaluate(`(() => {
      const select = document.querySelector('.playground select[id$="-mode"]');
      select.value = "html";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await retry(() => evaluate('document.querySelector(".playground iframe")?.srcdoc.includes("carousel-viewport") && document.querySelector(".playground [role=status]")?.textContent === "HTML preview ready"'), 'HTML sandbox');
    if (exceptions.length) throw new Error('Unhandled browser errors: ' + exceptions.join('\n'));
    process.stdout.write('Verified React and HTML sandbox previews.\n');
    process.stdout.write(`Checked ${routes.length} docs routes in Night, Paper, and Glass at 375px.\n`);
    process.stdout.write(`Checked ${responsiveRoutes.length} key routes at 320, 390, 768, 981, 1024, and 1440px in all themes.\n`);
  } finally {
    client?.close();
    browser.kill();
    await exited;
    const absoluteProfile = resolve(profile);
    if (absoluteProfile.startsWith(join(resolve(root), '.edge-preview-')) && !absoluteProfile.slice(resolve(root).length + 1).includes(sep)) {
      await rm(absoluteProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
  }
}

async function capturePlaywright() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    for (const [theme, file] of themes) {
      await page.goto(`${url}/#/showcase?theme=${theme}`);
      await page.locator(`html[data-theme="${theme}"] .showcase`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(screenshots, `${file}.png`), fullPage: true });
    }
    await page.setViewportSize(mobileViewport);
    await page.goto(`${url}/#/components/command?theme=glass`);
    await page.locator('html[data-theme="glass"] .command [role="listbox"]').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(screenshots, 'mobile-docs.png') });
    await page.locator('.docs-navbar .burger').click();
    await page.locator('.sheet-dock [aria-current="page"]').waitFor();
    await page.screenshot({ path: join(screenshots, 'mobile-menu.png') });
  } finally {
    await browser.close();
  }
}

await run(['build', '--config', 'docs/vite.config.ts']);
await mkdir(screenshots, { recursive: true });
const server = spawn(process.execPath, [vite, 'preview', '--config', 'docs/vite.config.ts', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { cwd: root, stdio: 'inherit', windowsHide: true });
const stopped = once(server, 'exit').catch(() => {});
try {
  await retry(async () => !server.exitCode && (await fetch(url)).ok, 'Vite preview');
  if (existsSync(edge)) await captureEdge();
  else await capturePlaywright();
} finally {
  server.kill();
  await stopped;
}
