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

async function connect(address) {
  const socket = new WebSocket(address);
  await new Promise((accept, reject) => {
    socket.addEventListener('open', accept, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
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
    client = await connect(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    const { send } = client;
    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    };
    const size = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const load = async (hash, title) => {
      await send('Page.navigate', { url: `${url}/#${hash}` });
      await retry(() => evaluate(`document.querySelector('h1')?.textContent.trim() === ${JSON.stringify(title)}`), title);
    };
    await size(viewport.width, viewport.height);
    for (const [theme, file] of themes) {
      await load(`/showcase?theme=${theme}`, 'Build together.');
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}'`), theme);
      await evaluate('Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(resolve, 4000))])');
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      await writeFile(join(screenshots, `${file}.png`), Buffer.from(data, 'base64'));
    }

    await size(375, 812);
    await load('/getting-started', 'Getting started');
    const links = await evaluate(`Array.from(document.querySelectorAll('.doc-sidebar a'), link => [link.hash.slice(1), link.textContent])`);
    const routes = [['/overview', 'Utkristi UI'], ['/showcase', 'Build together.'], ...links];
    const overflow = [];
    for (const [path, title] of routes) {
      await load(`${path}?theme=glass`, title);
      await retry(() => evaluate("document.documentElement.dataset.theme === 'glass'"), "Glass theme");
      const width = await evaluate('document.documentElement.scrollWidth');
      if (width > 375) overflow.push(`${path} (${width}px)`);
    }
    if (overflow.length) throw new Error(`Horizontal overflow at 375px: ${overflow.join(', ')}`);
    process.stdout.write(`Checked ${routes.length} docs routes at 375px.\n`);
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
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    for (const [theme, file] of themes) {
      await page.goto(`${url}/#/showcase?theme=${theme}`);
      await page.locator(`html[data-theme="${theme}"] .showcase`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(screenshots, `${file}.png`) });
    }
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
