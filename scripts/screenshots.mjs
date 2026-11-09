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
    for (const [theme] of themes) {
      for (const [path, title] of routes) {
        await load(path + '?theme=' + theme, title);
        await retry(() => evaluate('document.documentElement.dataset.theme === ' + JSON.stringify(theme)), theme);
        const width = await evaluate('document.documentElement.scrollWidth');
        if (width > 375) overflow.push(path + ' (' + theme + ', ' + width + 'px)');
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow at 375px: ${overflow.join(', ')}`);
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
    }
    await load('/sandbox?component=carousel&theme=glass', 'Sandbox');
    const ready = () => evaluate('document.querySelector(".playground [role=status]")?.textContent === "React preview ready"');
    await retry(ready, 'initial React sandbox');
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
