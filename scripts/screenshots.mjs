import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { join, resolve, sep } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const screenshots = join(root, 'docs', 'screenshots');
const url = 'http://127.0.0.1:4173';
const browserPath = process.env.CHROMIUM_PATH || (process.platform === 'linux'
  ? '/usr/bin/google-chrome' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
const themes = [['dark', 'night'], ['light', 'paper'], ['glass', 'glass']];
const newThemes = ['trading', 'snow', 'aurora', 'sepia', 'midnight', 'forest', 'sunset', 'high-contrast', 'terminal'];
const viewport = { width: 1440, height: 1800 };
const mobileViewport = { width: 390, height: 900 };
const captureOnly = process.argv.includes('--capture-only');
const verifyOnly = process.argv.includes('--verify-only');
const themesOnly = process.argv.includes('--themes-only');
const workspacesOnly = process.argv.includes('--workspaces-only');
const catalogOnly = process.argv.includes('--catalog-only');
const reuseBuild = process.argv.includes('--reuse-build');
const visualMatrix = process.argv.includes('--visual-matrix');
const iconsOnly = process.argv.includes('--icons-only');
const updateVisualBaselines = process.argv.includes('--update-visual-baselines');
const innovationOnly = process.argv.includes('--innovation-only');
const require = createRequire(import.meta.url);

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
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      return new Promise((accept, reject) => {
        pending.set(id, { accept, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
  };
}

async function captureEdge() {
  const profile = await mkdtemp(join(root, '.edge-preview-'));
  const browser = spawn(browserPath, ['--headless', '--hide-scrollbars', '--no-first-run', '--disable-extensions', '--disable-background-networking',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { cwd: root, stdio: 'ignore', windowsHide: true });
  const exited = once(browser, 'exit').catch(() => {});
  let client;
  try {
    const port = await retry(async () => (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0], 'Edge');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const exceptions = [];
    let fault;
    let faultRequests = 0;
    let entryRequest;
    client = await connect(targets.find((target) => target.type === 'page').webSocketDebuggerUrl, ({ method, params }) => {
      if (method === 'Runtime.exceptionThrown') {
        const detail = params.exceptionDetails;
        exceptions.push(detail.exception?.description ?? detail.text);
      }
      if (method !== 'Fetch.requestPaused') return;
      if (fault) {
        faultRequests++;
        client.send('Fetch.fulfillRequest', { requestId: params.requestId, ...fault })
          .catch((error) => exceptions.push(error.message));
      } else entryRequest = params.requestId;
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
      if (verifyOnly) return;
      const clip = fullPage ? { x: 0, y: 0, width: viewport.width, height: Math.ceil((await send('Page.getLayoutMetrics')).cssContentSize.height), scale: 1 } : undefined;
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: fullPage, clip });
      await writeFile(join(screenshots, `${file}.png`), Buffer.from(data, 'base64'));
    };
    const verifyFrameFocus = async (probe, name) => {
      await retry(() => evaluate(`(() => {
        const run = [...document.querySelectorAll('.playground-actions button')].find(button => button.textContent.trim() === 'Run');
        if (!run || run.disabled) return false;
        run.click();
        return true;
      })()`), name + ' run action');
      await retry(() => evaluate(`document.querySelector('.playground-run-status')?.textContent === 'HTML preview ready' &&
        document.querySelector('.playground iframe')?.getBoundingClientRect().width > 0`), name + ' rendered frame');
      const tree = await send('Page.getFrameTree');
      let frame = tree.frameTree.childFrames?.find(({ frame }) => frame.url === 'about:srcdoc')?.frame;
      let sessionId;
      try {
        if (!frame) {
          const { targetInfos } = await send('Target.getTargets');
          const target = targetInfos.find(({ type, url }) => type === 'iframe' && url === 'about:srcdoc');
          if (!target) throw new Error('The HTML preview frame is missing.');
          ({ sessionId } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }));
          frame = (await send('Page.getFrameTree', {}, sessionId)).frameTree.frame;
        }
        const { executionContextId } = await send('Page.createIsolatedWorld', { frameId: frame.id, worldName: 'utkristi-verification' }, sessionId);
        const result = await send('Runtime.evaluate', {
          contextId: executionContextId, userGesture: true, returnByValue: true,
          expression: `(() => { const parent = { postMessage: (report) => report }; ${probe.replace('parent.postMessage(', 'return parent.postMessage(')} })()`,
        }, sessionId);
        if (result.exceptionDetails) throw new Error(name + ': ' + (result.exceptionDetails.exception?.description ?? result.exceptionDetails.text));
        if (!result.result.value?.passed) throw new Error(name + ' failed inside the HTML frame: ' + JSON.stringify(result.result.value?.detail));
      } finally {
        if (sessionId) await send('Target.detachFromTarget', { sessionId });
      }
    };
    const disclosureProbe = `
      const mobile = document.querySelector('.navbar-html-mobile');
      if (getComputedStyle(mobile).display !== 'none') mobile.querySelector('summary').click();
      const nav = getComputedStyle(mobile).display === 'none' ? document.querySelector('.navbar-links') : mobile;
      const resources = [...nav.querySelectorAll('summary')].find(summary => summary.textContent.includes('Resources'));
      resources.click();
      const teams = [...resources.parentElement.querySelectorAll('summary')].find(summary => summary.textContent.includes('Teams'));
      teams.click();
      const target = teams.parentElement.querySelector('a');
      target.focus();
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const detail = { focus: document.activeElement === teams, active: document.activeElement?.tagName, inner: teams.parentElement.open,
        outer: resources.parentElement.open, motion: document.documentElement.dataset.utMotion };
      parent.postMessage({ kind: 'utkristi-verification', passed: detail.focus && !detail.inner && detail.outer &&
        detail.motion === 'fade', detail }, '*');
    `;
    // Keep motion assertions independent of the runner's OS accessibility settings.
    const setMotion = (value) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
    if (verifyOnly) {
      await send('Page.navigate', { url: url + '/operations.html' });
      await retry(() => evaluate(`document.title === 'Operations dashboard · Utkristi UI' &&
        document.scripts.length === 0 && document.querySelectorAll('tbody tr').length === 3 &&
        getComputedStyle(document.body).getPropertyValue('--ut-bg').trim() !== ''`), 'standalone operations dashboard');
    }
    if (process.argv.includes('--glass-nav')) {
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
      for (const width of [320, 360, 390]) {
        await size(width, 740);
        await load('/getting-started?theme=glass', 'Getting started');
        await retry(() => evaluate(`getComputedStyle(document.querySelector('.docs-navbar .burger')).display !== 'none'`), 'Glass menu trigger');
        await evaluate(`(() => {
          const trigger = document.querySelector('.docs-navbar .burger');
          trigger.focus();
          trigger.click();
        })()`);
        await retry(() => evaluate(`(() => {
          const sheet = document.querySelector('.sheet-dock');
          if (!sheet || document.activeElement?.getAttribute('aria-label') !== 'Close menu') return false;
          const style = getComputedStyle(sheet);
          return style.backdropFilter === 'none' && style.backgroundColor === 'rgb(233, 230, 246)' &&
            style.backgroundImage.startsWith('linear-gradient') &&
            sheet.getBoundingClientRect().left >= 0 && sheet.getBoundingClientRect().right <= innerWidth;
        })()`), 'Glass sheet surface and focus at ' + width + 'px');
        await evaluate(`document.querySelector('.sheet-dock [aria-label="Close menu"]').click()`);
        await retry(() => evaluate(`!document.querySelector('.sheet-dock') && document.activeElement === document.querySelector('.docs-navbar .burger')`), 'Glass menu closes and restores focus');
      }
      console.log('Verified Glass mobile navigation at 320, 360 and 390px.');
      return;
    }
    if (process.argv.includes('--mobile-catalog')) {
      const { entries } = JSON.parse(await readFile(join(root, 'docs/public/component-coverage.json'), 'utf8'));
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
      await setMotion('reduce');
      await size(320, 740);
      await load('/blocks?theme=light', 'Blocks');
      const blocks = await evaluate(`[...document.querySelectorAll('.block-link')].map(link => [link.hash.slice(1), link.querySelector('strong').textContent])`);
      const routes = [...entries.map(({ slug, name }) => ['/components/' + slug, name]), ...blocks];
      const failures = [];
      for (const [path, title] of routes) {
        await load(path + '?theme=light', title);
        const width = await evaluate('document.documentElement.scrollWidth');
        if (width > 320) failures.push(path + ' (' + width + 'px)');
      }
      await load('/blocks/conversation-desk?theme=light', 'Conversation desk');
      const controls = await evaluate(`(() => {
        const actions = document.querySelector('.desk-chat-actions');
        const buttons = [...actions.querySelectorAll('button')].map(button => button.getBoundingClientRect());
        return buttons.length === 3 && buttons.every(rect => rect.height >= 44 && rect.width >= 44 && rect.y === buttons[0].y) &&
          getComputedStyle(document.querySelector('.desk-chat-composer textarea')).fontSize === '16px';
      })()`);
      if (!controls) failures.push('Conversation Desk composer sizing');
      if (failures.length) throw new Error('Mobile catalog failures: ' + failures.join(', '));
      console.log('Verified ' + routes.length + ' component and block pages at 320px with touch emulation.');
      return;
    }
    if (process.argv.includes('--conversation-audit')) {
      const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
      await setMotion('reduce');
      for (const [theme] of themes) {
        await load('/blocks/audit-explorer?theme=' + theme, 'Audit explorer');
        await evaluate(axeSource);
        for (const pressed of ['false', 'true']) {
          await retry(() => evaluate(`document.querySelector('button[aria-label="RTL preview"]')?.getAttribute('aria-pressed') === '${pressed}'`), 'RTL toggle state');
          const violations = await evaluate(`axe.run('.docs-example', { runOnly: { type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }).then(({ violations }) =>
            violations.map(({ id, nodes }) => [id, nodes.map(({ target }) => target)]))`);
          if (violations.length) throw new Error('Audit explorer (' + theme + ', RTL ' + pressed + '): ' + JSON.stringify(violations));
          await evaluate(`document.querySelector('button[aria-label="RTL preview"]').click()`);
        }
      }
      await load('/blocks/conversation-desk?theme=light', 'Conversation desk');
      await size(1440, 900);
      await retry(() => evaluate(`document.querySelector('.desk-chat-thread-list')?.getBoundingClientRect().width > 0`), 'desktop conversation sidebar');
      await evaluate(`[...document.querySelectorAll('.desk-chat-prompts button')].find(button => button.textContent === 'Inspect a signal').click()`);
      await retry(() => evaluate(`document.querySelector('[aria-label="Reply model"]').textContent.includes('Analyst') &&
        document.activeElement === document.querySelector('.desk-chat-composer textarea')`), 'starter sets model and focuses composer');
      await evaluate(`document.querySelector('.desk-chat-send').click()`);
      await retry(() => evaluate(`document.querySelector('.desk-chat-reply')?.textContent.includes('Analyst')`), 'reply renders');
      await size(320, 850);
      await retry(() => evaluate(`document.querySelector('.desk-chat-thread-select')?.getBoundingClientRect().width > 0 &&
        document.documentElement.scrollWidth <= 320`), 'mobile history and no overflow');
      await evaluate(`document.querySelector('button[aria-label="Reply model"]').click()`);
      await retry(() => evaluate(`(() => {
        const option = [...document.querySelectorAll('[role=option]')].find(node => node.getAttribute('aria-label') === 'Editor');
        if (!option) return false;
        option.scrollIntoView({ block: 'nearest' });
        const bounds = option.getBoundingClientRect();
        return option.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
      })()`), 'mobile model menu remains clickable');
      await evaluate(`document.querySelector('[role=option][aria-label=Editor]').click()`);
      await retry(() => evaluate(`document.querySelector('button[aria-label="Reply model"]').textContent.includes('Editor')`), 'mobile model selection');
      console.log('Verified Conversation Desk and the Audit Explorer axe check in both RTL states across all three themes.');
      return;
    }
    if (process.argv.includes('--landing-alignment')) {
      await load('/overview?theme=light', 'Interfaces for live, dense, shared work.');
      await setMotion('reduce');
      for (const width of [1920, 1440, 1024, 768, 375, 320]) {
        await size(width, 900);
        for (const offset of [0, 500]) {
          await evaluate(`window.scrollTo({ top: ${offset}, behavior: 'instant' })`);
          await retry(() => evaluate(`(() => {
            const rect = selector => document.querySelector(selector).getBoundingClientRect();
            const page = rect('.mk-engine'), nav = rect('.docs-navbar .navbar-left');
            const end = rect('.docs-navbar .navbar-right').right;
            const notes = rect('.mk-footnote p'), table = rect('.mk-matrix-wrap');
            const inputs = [...document.querySelectorAll('.mk-brand-values')].map(node => node.getBoundingClientRect());
            return document.documentElement.scrollWidth <= ${width} &&
              Math.abs(page.left - nav.left) < 2 && Math.abs(page.right - end) < 2 &&
              Math.abs(notes.width - table.width) < 2 && Math.abs(inputs[0].left - inputs[1].left) < 2;
          })()`), 'navbar, controls and notes alignment at ' + width + ' / ' + offset);
        }
      }
      console.log('Verified landing alignment at six viewport widths before and after scroll.');
      return;
    }
    if (process.argv.includes('--charts-chat-only')) {
      await size(390, 850);
      await load('/blocks/signal-monitor', 'Signal monitor');
      const preview = '.theme-preview';
      const click = label => evaluate(`[...document.querySelectorAll('${preview} button')].find(node => node.textContent.trim() === ${JSON.stringify(label)}).click()`);
      await click('Start feed');
      await retry(() => evaluate("!!document.querySelector('.theme-preview polygon')"), 'stream range');
      await evaluate(`const control=document.querySelector('.theme-preview select[aria-label="Chart view"]'); control.value='candlestick'; control.dispatchEvent(new Event('change',{bubbles:true}))`);
      await retry(() => evaluate("document.querySelectorAll('.theme-preview svg g rect').length > 10"), 'candlestick aggregation');
      await click('Pause feed');
      await retry(() => evaluate("[...document.querySelectorAll('.theme-preview button')].some(node => node.textContent === 'Start feed')"), 'paused state');
      const value = await evaluate("document.querySelector('.theme-preview figcaption').textContent");
      await sleep(120);
      if (value !== await evaluate("document.querySelector('.theme-preview figcaption').textContent")) throw new Error('Paused feed changed');
      await load('/blocks/conversation-desk', 'Conversation desk');
      await retry(() => evaluate("!!document.querySelector('.theme-preview textarea') && document.documentElement.scrollWidth <= 390"), 'mobile conversation composer');
      console.log('Verified live chart switching, pause and mobile conversation layout.');
      return;
    }
    if (iconsOnly) {
      await size(1440, 900);
      await setMotion('reduce');
      for (const [path, type] of [
        ['/icons/sprite.svg', 'image/svg+xml'],
        ['/icons/svg/line/rocket.svg', 'image/svg+xml'],
        ['/icons/3d/render/glass/blue/rocket@1x.png', 'image/png'],
      ]) {
        const response = await fetch(url + path);
        await response.body?.cancel();
        if (!response.ok || !response.headers.get('content-type')?.startsWith(type)) {
          throw new Error(`Invalid static icon response for ${path}: ${response.status}`);
        }
      }
      const scrollToIcon = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: 'center' })`);
      const tray = '.showcase-icon-tray .icon-3d';
      await load('/showcase?theme=glass', 'Build together.');
      await retry(() => evaluate(`!!document.querySelector(${JSON.stringify(tray)})`), '3D tray icons');
      await scrollToIcon(tray);
      await retry(() => evaluate(`[...document.querySelectorAll(${JSON.stringify(tray)})].filter(icon =>
        icon.querySelector('picture[data-icon-raster-ready] img')?.naturalWidth > 0).length === 6`), 'all tray images load');
      await load('/icons?theme=glass', 'Icons');
      await retry(() => evaluate('!!document.querySelector(".icons-cell")'), 'icon catalog');
      await evaluate(`(() => {
        const style = document.querySelector('select[aria-label="Icon style"]');
        style.value = '3d';
        style.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await retry(() => evaluate('document.querySelector(".icons-cell picture[data-icon-raster-ready] img")?.naturalWidth > 0'), '3D icon catalog artwork');

      await load('/overview?theme=glass', 'Interfaces for live, dense, shared work.');
      const inspect = (label) => evaluate(`[...document.querySelectorAll('.mk-bench button')].find(button => button.textContent.trim() === ${JSON.stringify(label)}).click()`);
      await inspect('Review access');
      await evaluate("document.querySelector('.mk-bench input[type=checkbox]').click()");
      await inspect('Mark reviewed');
      await retry(() => evaluate("document.querySelector('.mk-bench [role=status]')?.textContent.includes('1 requests reviewed')"), 'workbench access review');
      await inspect('Checkbox');
      await retry(() => evaluate("document.querySelector('.mk-bench-caption a')?.hash === '#/components/checkbox'"), 'component inspection');
      await inspect('Whole block');
      await retry(() => evaluate("document.querySelector('.mk-bench [role=status]')?.textContent.includes('1 requests reviewed')"), 'review state survives inspection');
      await inspect('Reconcile invoices');
      await retry(() => evaluate("!!document.querySelector('.mk-bench select')"), 'billing block');
      const database = '.marketing-icon-tile .icon-3d';
      await scrollToIcon(database);
      await retry(() => evaluate(`(() => {
        const image = document.querySelector('${database} picture[data-icon-raster-ready] img');
        return image?.naturalWidth > 0 && image.currentSrc.includes('/database@');
      })()`), 'landing database render');
      await size(375, 900);
      await retry(() => evaluate(`(() => {
        const region = document.querySelector('.mk-matrix-wrap');
        const notes = document.querySelector('#efficiency-notes');
        if (!region || !notes || region.clientWidth >= region.scrollWidth) return false;
        region.focus();
        const header = region.querySelector('tbody th');
        const start = header.getBoundingClientRect().left;
        region.scrollLeft = 100;
        return document.activeElement === region && region.scrollLeft > 0 &&
          Math.abs(header.getBoundingClientRect().left - start) < 2 &&
          notes.getBoundingClientRect().top >= region.getBoundingClientRect().bottom &&
          notes.scrollWidth === notes.clientWidth && document.documentElement.scrollWidth <= 375;
      })()`), 'landing comparison scroll and notes at 375px');
      await size(1440, 900);

      await send('Network.enable');
      await send('Network.setCacheDisabled', { cacheDisabled: true });
      await send('Network.setBlockedURLs', { urls: ['*://*/icons/3d/render/*'] });
      const checkFallback = async (selector) => {
        await retry(() => evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), 'fallback icon');
        await scrollToIcon(selector);
        await retry(() => evaluate(`(() => {
          const icon = document.querySelector(${JSON.stringify(selector)});
          const image = icon?.querySelector('img');
          const fallback = icon?.querySelector('.icon-3d-fallback');
          return image?.complete && image.naturalWidth === 0 && fallback?.getBoundingClientRect().width > 0 &&
            getComputedStyle(fallback).visibility === 'visible';
        })()`), 'vector icon stays visible when the raster request fails');
      };
      await load('/overview?theme=light', 'Interfaces for live, dense, shared work.');
      await checkFallback('.marketing-icon-tile .icon-3d');
      await load('/showcase?theme=dark', 'Build together.');
      await checkFallback(tray);
      await load('/blocks/creative-workspace?theme=glass', 'Creative studio');
      await retry(() => evaluate(`document.querySelector('.theme-preview svg.icon-2d5 path')?.getAttribute('d')?.length > 0`), 'block icon artwork');
      console.log('Verified static icon assets, 3D tray and catalog loading, block artwork, and raster fallbacks.');
      return;
    }
    if (innovationOnly) {
      await size(375, 900);
      await setMotion('reduce');
      const previewWidth = () => evaluate('document.documentElement.scrollWidth');
      await load('/theme-studio?brand=%230EA5E9&scheme=light&contrast=AAA&dir=rtl', 'Theme Studio');
      await retry(() => evaluate('document.documentElement.dir === "rtl" && [...document.querySelectorAll(".theme-studio [role=status]")].some(node => node.textContent.includes("checks pass"))'), 'Theme Studio contrast report');
      if (await previewWidth() > 375) throw new Error('Theme Studio exceeds 375px.');
      await load('/components/collaboration?dir=rtl', 'Collaboration');
      await evaluate('Array.from(document.querySelectorAll(".theme-preview button")).find(button => button.textContent.includes("cursor")).click()');
      await retry(() => evaluate('!!document.querySelector(".collab-cursor[aria-hidden=true]")'), 'simulated collaborator cursor');
      if (await previewWidth() > 375) throw new Error('Collaboration preview exceeds 375px.');
      await load('/components/live-data?dir=rtl', 'Live data');
      await evaluate('Array.from(document.querySelectorAll(".theme-preview button")).find(button => button.textContent.includes("price update")).click()');
      await retry(() => evaluate('!!document.querySelector(".data-table .flash-up .market-up")'), 'streamed numeric update');
      if (await previewWidth() > 375) throw new Error('Live data preview exceeds 375px.');
      await load('/components/accessibility-preferences?dir=rtl', 'Accessibility preferences');
      await evaluate(`(() => {
        const field = document.querySelector('.ut-a11y-scope select');
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(field, '200');
        field.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await retry(() => evaluate(`!!document.querySelector('[data-ut-a11y-text="200"]')`), '200% text preference');
      if (await previewWidth() > 375) throw new Error('Accessibility preferences exceed 375px at 200%.');
      await load('/components/menu', 'Menu');
      await evaluate('document.querySelector(".theme-preview .menu-anchor button").click()');
      await retry(() => evaluate(`!CSS.supports('position-area: block-end span-inline-end') ||
        !!document.querySelector('.theme-preview [role=menu]:popover-open')`), 'native top-layer menu');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await retry(() => evaluate('!document.querySelector(".theme-preview [role=menu]")'), 'native menu dismissal');
      await load('/sandbox?component=navbar-multilevel&editor=html&motion=fade&theme=glass', 'Sandbox');
      await verifyFrameFocus(disclosureProbe, 'HTML nested disclosure');
      if (exceptions.length) throw new Error('Innovation preview errors: ' + exceptions.join('\n'));
      console.log('Verified Theme Studio, collaboration, live data, adaptive preferences, and native menu behavior.');
      return;
    }
    if (visualMatrix) {
      const folder = join(screenshots, 'matrix');
      if (updateVisualBaselines) await mkdir(folder, { recursive: true });
      const { examples } = JSON.parse(await readFile(join(root, 'docs/dist/component-manifest.json'), 'utf8'));
      const direction = ['ltr', 'rtl'];
      const failures = [];
      await setMotion('reduce');
      const difference = (before, after) => evaluate(`(async () => {
        async function bytes(data) {
          const image = new Image();
          image.src = 'data:image/png;base64,' + data;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, canvas.width, canvas.height).data;
        }
        const [before, after] = await Promise.all([bytes(${JSON.stringify(before)}), bytes(${JSON.stringify(after)})]);
        if (before.length !== after.length) return 1;
        let changed = 0;
        for (let index = 0; index < after.length; index += 4) {
          if ([0, 1, 2].some((channel) => Math.abs(before[index + channel] - after[index + channel]) > 20)) changed++;
        }
        return changed * 4 / after.length;
      })()`);
      const selected = process.env.UTKRISTI_VISUAL_SLUG;
      if (selected && !Object.hasOwn(examples, selected)) throw new Error('Unknown visual matrix slug: ' + selected);
      for (const [id, example] of Object.entries(examples)) {
        if (selected && selected !== id) continue;
        for (const theme of [...themes.map(([id]) => id), ...newThemes]) {
          for (const width of [375, 768, 1440]) {
            await size(width, 900);
            for (const dir of direction) {
              const name = `${id}-${theme}-${width}-${dir}.png`;
              const baselinePath = join(folder, name);
              if (!updateVisualBaselines && !existsSync(baselinePath)) {
                failures.push(`${name}: missing baseline`);
                continue;
              }
              const route = example.kind === 'variant' ? `/sandbox?component=${id}&editor=react`
                : `/${example.kind === 'block' ? 'blocks' : 'components'}/${id}?`;
              await send('Page.navigate', { url: `${url}/#${route}&theme=${theme}&dir=${dir}` });
              const selector = example.kind === 'variant' ? '.playground-run-status' : '.theme-preview';
              await retry(() => evaluate(`document.documentElement.dir === "${dir}" &&
                document.documentElement.dataset.theme === "${theme}" &&
                ${example.kind === 'variant' ? 'document.querySelector(".playground-run-status")?.textContent === "React preview ready"' :
                  `document.querySelector('h1')?.textContent.trim() === ${JSON.stringify(example.name)} && !!document.querySelector(${JSON.stringify(selector)})`}`), name);
              await fontsReady();
              const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
              if (updateVisualBaselines) await writeFile(baselinePath, Buffer.from(data, 'base64'));
              else {
                const baseline = (await readFile(baselinePath)).toString('base64');
                const change = baseline === data ? 0 : await difference(baseline, data);
                if (change > .005) failures.push(`${name}: ${(change * 100).toFixed(2)}% pixels changed`);
              }
            }
          }
        }
        console.log(`Checked visual matrix for ${id}`);
      }
      if (failures.length) throw new Error(`${failures.length} visual matrix failures:\n${failures.slice(0, 25).join('\n')}`);
      return;
    }
    if (catalogOnly) {
      const coverage = JSON.parse(await readFile(join(root, 'docs/public/component-coverage.json'), 'utf8'));
      const failures = [];
      await size(1440, 1000);
      await setMotion('reduce');
      for (const [index, entry] of coverage.entries.entries()) {
        for (const slug of [entry.slug, ...entry.variants.map(variant => variant.slug)]) {
          for (const editor of ['react', 'html']) {
            await load('/sandbox?component=' + slug + '&editor=' + editor + '&theme=snow', 'Sandbox');
            const expected = editor === 'react' ? 'React preview ready' : 'HTML preview ready';
            try {
              await retry(() => evaluate(`document.querySelector('.playground-run-status')?.textContent === ${JSON.stringify(expected)} || !!document.querySelector('.playground-error')`), slug + ' ' + editor);
              const error = await evaluate('document.querySelector(".playground-error")?.textContent');
              if (error) failures.push({ slug, editor, error });
            } catch (error) { failures.push({ slug, editor, error: error.message }); }
          }
        }
        process.stdout.write('Checked ' + (index + 1) + '/' + coverage.entries.length + ': ' + entry.name + '\n');
      }
      await writeFile(join(root, '.npm-cache/component-browser-results.json'), JSON.stringify({ failures, exceptions }, null, 2));
      if (failures.length || exceptions.length) throw new Error('Catalog verification failed: ' + JSON.stringify({ failures, exceptions }));
      return;
    }
    if (workspacesOnly) {
      await setMotion('reduce');
      const samples = [
        ['execution-desk', 'trading', 'Execution desk'],
        ['console-workspace', 'terminal', 'Operations console'],
        ['creative-workspace', 'aurora', 'Creative studio'],
        ['office-workspace', 'snow', 'Team operations'],
      ];
      for (const [slug, theme, title] of samples) {
        await size(1440, 1000);
        await load('/blocks/' + slug + '?theme=' + theme, title);
        await fontsReady();
        const activeShadow = await evaluate('getComputedStyle(document.querySelector(".workspace-navigation [aria-current=page]")).boxShadow');
        if (activeShadow !== 'none') throw new Error(slug + ' still has a decorative active edge: ' + activeShadow);
        await screenshot(slug);
        {
          await evaluate('document.querySelectorAll(".workspace-navigation button")[1].click()');
          await retry(() => evaluate('document.querySelectorAll(".workspace-navigation button")[1].getAttribute("aria-current") === "page"'), slug + ' navigation');
        }
        await size(375, 830);
        await retry(() => evaluate('document.documentElement.scrollWidth <= innerWidth'), slug + ' mobile width');
        await screenshot(slug + '-mobile');
        process.stdout.write('Checked ' + slug + ' at desktop and mobile widths.\n');
      }
      await size(1440, 1000);
      await load('/overview?theme=glass', 'Interfaces for live, dense, shared work.');
      await fontsReady();
      await screenshot('overview', true);
      await load('/icons?theme=glass', 'Icons');
      await retry(() => evaluate('!!document.querySelector(".icons-cell")'), 'expanded icon catalog');
      await screenshot('icons');
      await load('/sandbox?component=workspace&theme=trading', 'Sandbox');
      await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "React preview ready"'), 'workspace sandbox');
      await screenshot('workspace-sandbox');
      for (const slug of ['workspace', 'console-workspace', 'creative-workspace', 'office-workspace']) {
        await load('/sandbox?component=' + slug + '&editor=html&theme=snow', 'Sandbox');
        await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), slug + ' HTML sandbox');
      }
      for (const [slug, title] of [['sidebar', 'Sidebar'], ['alert', 'Alert'], ['tabs', 'Tabs'], ['card', 'Card'], ['table', 'Table']]) {
        await size(1440, 1000);
        await load('/components/' + slug + '?theme=snow', title);
        await retry(() => evaluate('!!document.querySelector(".component-variants button[aria-expanded=false]")'), slug + ' variant index');
        await evaluate('document.querySelector(".component-variants button[aria-expanded=false]").click()');
        await retry(() => evaluate('!!document.querySelector(".component-variants .docs-example")'), slug + ' expanded preview');
        await screenshot('component-' + slug);
        await size(375, 830);
        await retry(() => evaluate('document.documentElement.scrollWidth <= innerWidth'), slug + ' docs mobile width');
      }
      if (exceptions.length) throw new Error(exceptions.join('\n'));
      return;
    }
    if (themesOnly) {
      await setMotion('reduce');
      for (const [theme, file] of [...themes, ...newThemes.map((id) => [id, id])]) {
        await size(1440, 1000);
        await load(`/showcase?theme=${theme}`, 'Build together.');
        await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}' && !!document.querySelector('.showcase-icon-tray')`), theme + ' showcase');
        await fontsReady();
        await screenshot('theme-' + file);
        await size(375, 830);
        await retry(() => evaluate('document.documentElement.scrollWidth <= innerWidth'), theme + ' mobile width');
        if (['glass', 'aurora', 'snow'].includes(theme)) {
          await send('Emulation.setEmulatedMedia', { features: [
            { name: 'prefers-reduced-motion', value: 'reduce' },
            { name: 'prefers-reduced-transparency', value: 'reduce' },
          ] });
          await retry(() => evaluate('getComputedStyle(document.documentElement).getPropertyValue("--ut-surface-filter").trim() === "none"'), theme + ' opaque fallback');
          await setMotion('reduce');
        }
        if (exceptions.length) throw new Error(theme + ': ' + exceptions.join('\n'));
        process.stdout.write('Checked ' + theme + ' at desktop and 375px mobile widths.\n');
      }
      return;
    }
    await setMotion('reduce');
    await size(760, 480);
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/index-*.js' }] });
    try {
      await send('Page.navigate', { url: `${url}/?loader-preview=1` });
      await retry(() => entryRequest && evaluate('document.querySelector("#docs-boot-loader:not([hidden])")?.textContent.includes("Opening Utkristi UI")'), 'startup loader while app entry is pending');
      await screenshot('loader');
      await send('Fetch.continueRequest', { requestId: entryRequest });
    } finally {
      await send('Fetch.disable');
    }
    await retry(() => evaluate('!document.querySelector("#docs-boot-loader") && !!document.querySelector(".mk-hero")'), 'startup loader hands off to the app');
    await size(viewport.width, viewport.height);
    for (const [theme, file] of themes) {
      await load(`/showcase?theme=${theme}`, 'Build together.');
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}'`), theme);
      await retry(() => evaluate('getComputedStyle(document.querySelector(".header-dock .navbar-links")).display === "flex"'), 'desktop dock links');
      await retry(() => evaluate('!!document.querySelector(".showcase-icon-tray")'), 'showcase tray');
      await fontsReady();
      await screenshot(file, true);
    }
    await load('/overview?theme=glass', 'Interfaces for live, dense, shared work.');
    await retry(() => evaluate('document.documentElement.dataset.theme === "glass"'), 'marketing theme');
    await fontsReady();
    await screenshot('overview', true);
    await size(760, 812);
    await retry(() => evaluate('!!document.querySelector(".navbar-more:not([data-hidden]) button")'), 'overflow trigger at tablet width');
    await evaluate('document.querySelector(".navbar-more button").click()');
    await retry(() => evaluate(`!!document.querySelector('.navbar-more .popover-panel a[href="#/frameworks"]')`), 'overflow screenshot links');
    await screenshot('navbar-overflow');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))');
    await size(1440, 900);
    await load('/icons?theme=glass', 'Icons');
    await retry(() => evaluate('!!document.querySelector(".icons-cell")'), 'icon catalog screenshot');
    await fontsReady();
    await screenshot('icons');
    await load('/sandbox?component=carousel&theme=glass', 'Sandbox');
    await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "React preview ready"'), 'sandbox screenshot');
    await fontsReady();
    await screenshot('sandbox');
    for (const [slug, theme, title] of [['enterprise-landing', 'glass', 'Enterprise landing'], ['execution-desk', 'dark', 'Execution desk']]) {
      await load(`/blocks/${slug}?theme=${theme}`, title);
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}' && !!document.querySelector('.ut-template, .workspace')`), title + ' screenshot');
      await fontsReady();
      await screenshot(slug);
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
    if (!verifyOnly) process.stdout.write('Captured the overview, showcases, icon catalog, sandbox, enterprise templates, and both mobile views.\n');
    if (captureOnly) return;
    await setMotion('no-preference');

    await size(1280, 860);
    await load('/components/loader?theme=glass', 'Loader');
    await retry(() => evaluate('getComputedStyle(document.querySelector(".docs-example .loader-brand .brand-tile")).animationName === "ut-loader-assemble"'), 'animated brand loader');
    await setMotion('reduce');
    await retry(() => evaluate('getComputedStyle(document.querySelector(".docs-example .loader-brand .brand-tile")).animationName === "none"'), 'static brand loader with reduced motion');
    await setMotion('no-preference');
    const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    await load('/overview', 'Interfaces for live, dense, shared work.');
    for (const [page, heading] of [['about', 'About'], ['terms', 'Terms'], ['privacy', 'Privacy']]) {
      await evaluate(`document.querySelector('.docs-footer-links a[href="#/${page}"]').click()`);
      await retry(() => evaluate(`document.querySelector('.site-info h1')?.textContent === '${heading}' &&
        document.querySelector('.docs-footer-links [aria-current="page"]')?.textContent === '${heading}' &&
        document.title === '${heading} · Utkristi UI'`), page + ' footer route');
    }
    await retry(() => evaluate(`document.querySelector('.docs-footer .footer-bottom').textContent.includes('Version ${version}')`), 'footer uses the package version');
    await load('/getting-started', 'Getting started');
    await retry(() => evaluate(`[...document.querySelectorAll('.code-example')].some(example => example.textContent.includes('unpkg.com/@utkristi/ui@${version}/utkristi-ui.css'))`), 'install snippet uses the package version');
    for (const [theme, themeKey] of themes) {
      await load('/showcase?theme=' + theme, 'Build together.');
      await retry(() => evaluate('!!document.querySelector(".showcase-icon-tray")'), 'showcase tray');
      await evaluate('document.querySelector(".showcase-icon-tray").scrollIntoView({ block: "center" })');
      await retry(() => evaluate(`(() => {
        const images = [...document.querySelectorAll('.showcase-icon-tray img')];
        return images.length === 6 && images.every((image) => image.naturalWidth > 0 && image.src.includes('/${themeKey}/'));
      })()`), theme + ' showcase icon assets');
    }
    await evaluate(`(() => {
      const tray = document.querySelector('.showcase-icon-card');
      const swatch = [...tray.querySelectorAll('.icon-swatch')].find(button => button.getAttribute('aria-label') === 'Teal');
      swatch.click();
    })()`);
    await retry(() => evaluate(`[...document.querySelectorAll('.showcase-icon-tray img')].every(image => image.src.includes('/teal/'))`), 'tray hue applies to all icons');
    const selectOption = (selector, value) => evaluate(`(() => {
      const select = document.querySelector(${JSON.stringify(selector)});
      select.value = ${JSON.stringify(value)};
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await selectOption('.showcase-icon-card select', 'line');
    await retry(() => evaluate('document.querySelectorAll(".showcase-icon-tray .icon-line").length === 6'), 'tray style applies to all icons');

    await load('/theming?theme=glass', 'Theming');
    await selectOption('.shape-demo-controls .field:first-child select', 'square');
    await retry(() => evaluate(`[...document.querySelectorAll('.shape-demo .preview-content button, .shape-demo .preview-content input')]
      .every(control => getComputedStyle(control).borderTopLeftRadius === '0px')`), 'square controls in all themes');
    await selectOption('.shape-demo-controls .field:first-child select', 'pill');
    await selectOption('.shape-demo-controls .field:last-child select', '100%');
    await retry(() => evaluate(`[...document.querySelectorAll('.shape-demo .preview-content button')].every(button =>
      getComputedStyle(button).borderTopLeftRadius === '999px' &&
      Math.abs(button.offsetWidth - button.previousElementSibling.offsetWidth) <= 1)`), 'pill and full width in all themes');
    await retry(() => evaluate(`(() => {
      const glass = document.querySelector('.shape-demo [data-theme="glass"] .card');
      const night = document.querySelector('.shape-demo [data-theme="dark"] .card');
      return getComputedStyle(glass).backdropFilter.includes('blur(') && getComputedStyle(night).backdropFilter === 'none';
    })()`), 'Glass uses frost with a scoped fallback');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
    await retry(() => evaluate(`(() => {
      const glass = getComputedStyle(document.querySelector('.shape-demo [data-theme="glass"] .card'));
      return glass.backdropFilter === 'none' && glass.backgroundColor === 'rgb(244, 242, 251)' && glass.backgroundImage === 'none';
    })()`), 'Glass respects reduced transparency');
    await setMotion('no-preference');

    await load('/components/button?theme=glass', 'Button');
    await retry(() => evaluate(`(() => {
      const buttons = [...document.querySelectorAll('.docs-example .preview-content button')];
      const square = buttons.find(button => button.textContent === 'Square');
      const pill = buttons.find(button => button.textContent === 'Pill');
      return square.offsetWidth === 160 && getComputedStyle(square).borderTopLeftRadius === '0px' &&
        pill.offsetWidth === 144 && getComputedStyle(pill).borderTopLeftRadius === '999px';
    })()`), 'per-button shape and width in Glass');

    await load('/components/video?theme=glass', 'Video');
    await retry(() => evaluate(`(() => {
      const video = document.querySelector('.docs-example video');
      return video.duration > 0 && !video.controls && !document.querySelector('.video-seek').disabled &&
        !!document.querySelector('.video-controls button[aria-label="Play"] svg path');
    })()`), 'custom player loads metadata');
    await evaluate(`(() => {
      const video = document.querySelector('.docs-example video');
      video.loop = true;
      document.querySelector('.video-controls button[aria-label="Play"]').click();
    })()`);
    await retry(() => evaluate('!!document.querySelector(\'.video-controls button[aria-label="Pause"]\') && document.querySelector(".docs-example video").currentTime > 0'), 'custom playback advances');
    await evaluate(`document.querySelector('.video-controls button[aria-label="Pause"]').click()`);
    await retry(() => evaluate('document.querySelector(".docs-example video").paused'), 'custom pause');
    await evaluate('document.querySelector(".video-seek").focus()');
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'End', code: 'End', windowsVirtualKeyCode: 35 });
    await retry(() => evaluate('document.querySelector(".docs-example video").currentTime >= document.querySelector(".docs-example video").duration * .95'), 'keyboard seeking');
    await evaluate(`document.querySelector('.video-controls button[aria-label="Unmute"]').click()`);
    await retry(() => evaluate('!document.querySelector(".docs-example video").muted && !!document.querySelector(\'.video-controls button[aria-label="Mute"]\')'), 'custom mute toggle');
    await evaluate(`document.querySelector('.docs-example video').addTextTrack('captions', 'English', 'en') && true`);
    await retry(() => evaluate('!!document.querySelector(\'.video-controls select[aria-label="Captions"]\')'), 'caption track discovery');
    await selectOption('.video-controls select[aria-label="Captions"]', '0');
    await retry(() => evaluate('document.querySelector(".docs-example video").textTracks[0].mode === "showing"'), 'caption track selection');
    if (await evaluate('document.fullscreenEnabled')) {
      await send('Page.bringToFront');
      const point = await evaluate(`(() => {
        const button = document.querySelector('.video-controls button[aria-label="Fullscreen"]');
        button.scrollIntoView({ block: 'center', behavior: 'instant' });
        const rect = button.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
      const fullscreenResult = await retry(() => evaluate(`document.fullscreenElement?.matches('.video-frame') ? 'opened' :
        document.querySelector('.video-notice')?.textContent`), 'custom fullscreen');
      if (fullscreenResult !== 'opened') throw new Error(fullscreenResult);
      await retry(() => evaluate('!!document.querySelector(\'.video-controls button[aria-label="Exit fullscreen"]\')'), 'custom fullscreen state');
      await evaluate('document.exitFullscreen().then(() => true)');
      await retry(() => evaluate('!document.fullscreenElement && !!document.querySelector(\'.video-controls button[aria-label="Fullscreen"]\')'), 'custom fullscreen exit');
    }

    await load('/blocks/enterprise-landing?theme=glass', 'Enterprise landing');
    await selectOption('.ut-template select[aria-label="Template preset"]', 'ledger');
    await selectOption('.docs-example select[aria-label="Preview theme"]', 'light');
    await retry(() => evaluate('!!document.querySelector(\'.theme-preview[data-theme="light"] .ut-template[data-ut-preset="ledger"]\')'), 'appearance change preserves template preset');
    await evaluate(`(() => {
      document.querySelector('.ut-template').dataset.utRadius = 'square';
      document.querySelector('.ut-enterprise-intro .btn-solid').click();
    })()`);
    await retry(() => evaluate(`(() => {
      const modal = document.querySelector('.ut-portal[data-theme="light"][data-ut-preset="ledger"] .modal');
      return modal && getComputedStyle(modal).borderTopLeftRadius === '0px';
    })()`), 'template dialog carries scoped appearance and corners');
    await evaluate(`(() => {
      const form = document.querySelector('.modal form');
      form.elements.email.value = 'preview@example.test';
      form.requestSubmit();
    })()`);
    await retry(() => evaluate('!document.querySelector(".modal") && !!document.querySelector(".ut-enterprise-intro [role=status]")'), 'enterprise demo request');

    await load('/blocks/execution-desk?theme=dark', 'Execution desk');
    await selectOption('.ut-desk select[aria-label="Order status"]', 'Filled');
    await retry(() => evaluate('document.querySelector(".ut-desk-table tbody").rows.length === 1 && document.querySelector(".ut-desk-inspector h3").textContent === "MIDX"'), 'blotter filter links the inspector');
    await evaluate(`Array.from(document.querySelectorAll('.ut-desk-inspector [role=tab]')).find(tab => tab.textContent === 'Fills').click()`);
    await retry(() => evaluate('document.querySelector(".ut-desk-fills")?.children.length === 2'), 'selected order fill history');
    await evaluate(`document.querySelector('.workspace-actions [aria-label="Use comfortable rows"]').click()`);
    await retry(() => evaluate('document.querySelector(".ut-desk").dataset.density === "comfortable"'), 'blotter density control');
    await evaluate('document.querySelector(".ut-desk-foot [role=switch]").click()');
    await retry(() => evaluate('document.querySelector(".ut-desk-summary [role=status]").textContent.includes("Snapshot stale")'), 'stale snapshot state');
    await size(375, 812);
    await retry(() => evaluate(`(() => {
      const region = document.querySelector('.ut-desk-table');
      return region.scrollWidth > region.clientWidth && getComputedStyle(region).scrollbarColor ===
        'rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)';
    })()`), 'idle scrollbar stays hidden');
    await evaluate('document.querySelector(".ut-desk-table").focus()');
    await retry(() => evaluate(`(() => {
      const region = document.querySelector('.ut-desk-table');
      return document.activeElement === region && getComputedStyle(region).scrollbarColor !==
        'rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)';
    })()`), 'focused scrollbar is visible');
    await size(1280, 860);

    await load('/blocks/access-review?theme=light', 'Access review');
    await evaluate('document.querySelector(".docs-example input[type=checkbox]").click()');
    await evaluate(`[...document.querySelectorAll('.docs-example button')].find(button => button.textContent === 'Mark reviewed').click()`);
    await retry(() => evaluate('document.querySelectorAll(".docs-example input[type=checkbox]").length === 2'), 'access review applies selected requests');
    await load('/blocks/metric-card?theme=glass', 'Metric card');
    await selectOption('.docs-example select[aria-label="Metric period"]', 'month');
    await retry(() => evaluate('document.querySelector(".docs-example .stat").textContent.includes("97.6")'), 'metric card changes period');

    await size(1440, 900);
    await load('/frameworks?theme=glass', 'Frameworks');
    await evaluate(`(() => {
      const trigger = document.querySelector('[data-ut-open-dialog]');
      trigger.focus();
      trigger.click();
    })()`);
    await retry(() => evaluate('document.querySelector(".ut-native-dialog")?.matches(":modal")'), 'portable native dialog opens');
    await evaluate('document.querySelector(".ut-native-dialog button").click()');
    await retry(() => evaluate('!document.querySelector(".ut-native-dialog").open && document.activeElement.matches("[data-ut-open-dialog]")'), 'native dialog closes and restores focus');
    await evaluate(`(() => {
      const tab = document.querySelector('[data-ut-tabs] [role=tab]');
      tab.focus();
      tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    })()`);
    await retry(() => evaluate(`document.activeElement?.textContent === 'History' && document.activeElement.getAttribute('aria-selected') === 'true' &&
      !document.getElementById(document.activeElement.getAttribute('aria-controls')).hidden`), 'portable tabs support keyboard navigation');
    await evaluate(`[...document.querySelectorAll('[role=tab]')].find(tab => tab.textContent === 'Vue').click()`);
    await retry(() => evaluate(`document.querySelector('[role=tabpanel]:not([hidden]) .code')?.textContent.includes('onBeforeUnmount')`), 'framework code tab');
    await retry(() => evaluate('document.querySelectorAll(".framework-recipe").length === 16'), 'integration catalog');
    const kitAssets = await Promise.all(['utkristi-ui.css', 'utkristi-dom.js'].map((file) => fetch(url + '/' + file)));
    if (kitAssets.some((asset) => !asset.ok)) throw new Error('Framework downloads are unavailable');
    const assetCss = await kitAssets[0].text();
    if (!/background-size:\s*(?:var\(--ut-canvas-size,\s*)?100%\s+100%\)?/.test(assetCss)) throw new Error('The standalone CSS still has a fixed-height backdrop');
    await evaluate(`document.querySelector('.doc-outline a[href*="section=mcp-ui"]').click()`);
    await retry(() => evaluate(`location.hash.includes('section=mcp-ui') && document.activeElement?.id === 'mcp-ui' &&
      document.querySelector('.doc-outline a[aria-current="location"]')?.textContent === 'MCP UI server'`), 'outline jumps and focuses a framework heading');
    await evaluate('document.querySelector(".doc-index-toggle").click()');
    await retry(() => evaluate('document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "false" && getComputedStyle(document.querySelector(".doc-index")).display === "none"'), 'desktop index collapses');
    await evaluate('document.querySelector(".doc-index-toggle").click()');

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
    await retry(() => evaluate(`(() => {
      const input = getComputedStyle(document.activeElement);
      const results = getComputedStyle(document.querySelector('.docs-search-dialog .search-results'));
      return input.outlineWidth === '0px' && input.borderTopWidth === '0px' && input.boxShadow === 'none' && results.borderTopWidth === '0px';
    })()`), 'search surface has no nested rings or borders');
    await evaluate(`(() => {
      const field = document.activeElement;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, 'grid rows');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await retry(() => evaluate('document.querySelector(".docs-search-dialog [aria-selected=true]")?.getAttribute("aria-label") === "Data Table"'), 'search matches multiple keywords');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Data Table" && !document.querySelector(".docs-search-dialog")'), 'search Enter opens the result');
    const [adjacentTitle, adjacentHash] = await evaluate(`(() => {
      const next = document.querySelector('.docs-pagination [rel=next]');
      return [next.querySelector('strong').textContent, next.hash];
    })()`);
    await evaluate('document.querySelector(".docs-pagination [rel=next]").click()');
    await retry(() => evaluate(`location.hash === ${JSON.stringify(adjacentHash)} && document.querySelector('h1')?.textContent === ${JSON.stringify(adjacentTitle)}`), 'next component');
    await evaluate('document.querySelector(".docs-pagination [rel=prev]").click()');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Data Table"'), 'previous component');
    await load('/getting-started?theme=light', 'Getting started');
    await evaluate(`(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: text => { window.copiedCode = text; return Promise.resolve(); } } });
      document.querySelector('.code-example button').click();
    })()`);
    await retry(() => evaluate('window.copiedCode === "npm install @utkristi/ui" && document.querySelector(".code-example button").textContent.trim() === "Copied" && !document.querySelector(".toast")'), 'copy uses inline feedback');
    await evaluate(`(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error('Clipboard denied'));
      document.querySelector('.code-example button').click();
    })()`);
    await retry(() => evaluate('document.querySelector(".code-example button").textContent.trim() === "Retry copy" && getSelection().toString() === "npm install @utkristi/ui"'), 'copy failure selects the source');
    await evaluate('getSelection().removeAllRanges()');

    await size(760, 812);
    await load('/overview?theme=glass', 'Interfaces for live, dense, shared work.');
    await retry(() => evaluate('!!document.querySelector(".navbar-more:not([data-hidden]) button")'), 'tablet overflow trigger');
    await evaluate('document.querySelector(".navbar-more button").click()');
    await retry(() => evaluate(`(() => {
      const nav = document.querySelector('.docs-navbar .navbar-links');
      const visible = nav.querySelectorAll('.navbar-fit-item:not([data-hidden]) a');
      const panel = nav.querySelector('.popover-panel');
      const brand = document.querySelector('.docs-navbar .navbar-left');
      const first = visible[0]?.getBoundingClientRect();
      const logo = brand.getBoundingClientRect();
      return !!first && first.left - logo.right < 45 && Math.abs(first.top + first.height / 2 - logo.top - logo.height / 2) < 2 &&
        getComputedStyle(nav).borderInlineStartWidth !== '0px' && document.activeElement === panel &&
        visible.length + panel.querySelectorAll('a').length === 7;
    })()`), 'aligned dock and complete overflow links');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))');
    await retry(() => evaluate('!document.querySelector(".navbar-more .popover-panel") && document.activeElement === document.querySelector(".navbar-more button")'), 'overflow Escape returns focus');
    await evaluate('document.querySelector(".navbar-more button").click()');
    await evaluate('document.querySelector(\'.navbar-more .popover-panel a[href="#/frameworks"]\').click()');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Frameworks" && !document.querySelector(".navbar-more .popover-panel") && !!document.querySelector(".navbar-more[data-current]")'), 'overflow link navigation and active state');
    await size(1440, 900);
    await retry(() => evaluate('document.querySelectorAll(".navbar-fit-item:not([data-hidden]) a").length === 7 && document.querySelector(".navbar-more").hasAttribute("data-hidden")'), 'wide dock restores all links');

    for (const [theme] of themes) {
      await load('/getting-started?theme=' + theme, 'Getting started');
      await retry(() => evaluate(`(() => {
        const source = document.querySelector('.code-example');
        const page = getComputedStyle(document.body).backgroundColor;
        const code = getComputedStyle(source.querySelector('.code')).backgroundColor;
        return code !== page && code !== 'rgba(0, 0, 0, 0)' && code !== getComputedStyle(source).backgroundColor;
      })()`), theme + ' code background separates from page and toolbar');
    }

    await size(375, 812);
    await load('/overview?theme=glass', 'Interfaces for live, dense, shared work.');
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
    await load('/blocks?theme=glass', 'Blocks');
    const blocks = await evaluate(`Array.from(document.querySelectorAll('.block-link'), link => [link.hash.slice(1), link.querySelector('strong').textContent])`);
    if (blocks.length < 4) throw new Error('The Blocks catalog is missing examples.');
    await load('/blocks/project-directory?theme=glass', 'Project directory');
    await evaluate('Array.from(document.querySelectorAll(".docs-example button")).find(button => button.textContent.trim() === "Add project").click()');
    await retry(() => evaluate('!!document.querySelector(".modal input[name=project]")'), 'project editor');
    await evaluate(`(() => {
      const form = document.querySelector('form.modal');
      form.elements.project.value = 'Testing workspace';
      form.elements.owner.value = 'Example owner';
      form.requestSubmit();
    })()`);
    await retry(() => evaluate('!!document.querySelector(".docs-example input[aria-label=\'Select Testing workspace\']") && !document.querySelector(".modal")'), 'project creation');
    await evaluate(`document.querySelector('.docs-example input[aria-label="Select Testing workspace"]').click()`);
    await evaluate('Array.from(document.querySelectorAll(".docs-example button")).find(button => button.textContent.trim() === "Delete selected").click()');
    await retry(() => evaluate('!!document.querySelector(".modal")'), 'bulk delete confirmation');
    await evaluate('Array.from(document.querySelectorAll(".modal button")).find(button => button.textContent.trim() === "Delete projects").click()');
    await retry(() => evaluate('!document.querySelector(".docs-example input[aria-label=\'Select Testing workspace\']")'), 'bulk delete removes the selected row');

    const clickExample = (label, scope = '.docs-example') => evaluate(`[...document.querySelectorAll(${JSON.stringify(scope + ' button')})]
      .find((button) => button.textContent.trim() === ${JSON.stringify(label)}).click()`);
    const firstProject = (name) => evaluate(`document.querySelector('.docs-example tbody tr')?.textContent.includes(${JSON.stringify(name)})`);
    await load('/blocks/project-worklist?theme=glass', 'Project worklist');
    await retry(() => firstProject('Atlas 001'), 'worklist first page');
    await evaluate('document.querySelector(\'.docs-example input[aria-label="Select row 1"]\').click()');
    await evaluate('document.querySelector(\'.docs-example button[aria-label="Next page"]\').click()');
    await retry(() => firstProject('Atlas 009'), 'worklist remote pagination');
    await clickExample('Simulate error');
    await retry(() => evaluate('!!document.querySelector(".docs-example [role=alert]")'), 'recoverable worklist error');
    if (!await firstProject('Atlas 009')) throw new Error('Worklist discarded the last successful result on error.');
    await clickExample('Retry');
    await retry(() => evaluate('!document.querySelector(".docs-example [role=alert]") && document.querySelector(".docs-example table")?.getAttribute("aria-busy") === "false"'), 'worklist retry');
    await clickExample('Archive selected');
    await retry(() => evaluate('document.activeElement?.textContent === "Cancel"'), 'bulk confirmation focuses cancel');
    await clickExample('Archive projects', '.modal');
    await retry(() => firstProject('Meridian 002'), 'bulk action updates the worklist');
    await retry(() => evaluate('document.activeElement?.textContent === "Project worklist"'), 'bulk action returns focus to the worklist');
    await evaluate(`(() => {
      const mode = document.querySelectorAll('.docs-example .worklist-filters select')[1];
      mode.value = 'slow';
      mode.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    const searchProject = (query) => evaluate(`(() => {
      const input = document.querySelector('.docs-example input[type=search]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(query)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await searchProject('Horizon');
    await retry(() => evaluate('document.querySelector(".docs-example table")?.getAttribute("aria-busy") === "true"'), 'slow request starts');
    await evaluate(`(() => {
      const mode = document.querySelectorAll('.docs-example .worklist-filters select')[1];
      mode.value = 'normal';
      mode.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await searchProject('Meridian');
    await sleep(1200);
    await retry(() => evaluate(`document.querySelector('.docs-example table')?.getAttribute('aria-busy') === 'false' &&
      [...document.querySelectorAll('.docs-example tbody tr')].every((row) => row.textContent.includes('Meridian'))`), 'superseded request does not overwrite the latest query');

    for (const [theme] of themes) {
      await load('/blocks/audit-explorer?theme=' + theme, 'Audit explorer');
      await clickExample('Columns');
      await retry(() => evaluate('!!document.querySelector(".worklist-column-options input:disabled")'), 'protected audit column');
      await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
      await retry(() => evaluate('document.activeElement?.textContent.trim() === "Columns"'), 'column chooser returns focus');
      await evaluate(await readFile(require.resolve('axe-core/axe.min.js'), 'utf8'));
      const violations = await evaluate(`axe.run('.docs-example', { runOnly: { type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }).then(({ violations }) =>
          violations.map(({ id, nodes }) => [id, nodes.map(({ target }) => target)]))`);
      if (violations.length) throw new Error('Audit explorer accessibility (' + theme + '): ' + JSON.stringify(violations));
    }
    await evaluate(`localStorage.setItem('utkristi-audit-view',
      JSON.stringify({ version: 1, columns: ['retired', 'date'], range: { start: '2026-10-22', end: '2026-10-22' } }))`);
    await load('/blocks/roles-and-access?theme=glass', 'Roles and access');
    await evaluate('document.querySelector(".docs-example tbody tr").click()');
    await retry(() => evaluate('document.querySelector(".sheet-panel select")?.disabled === true'), 'protected workspace owner');
    await evaluate('document.querySelector(".sheet-panel button[aria-label=Close]").click()');
    await load('/blocks/audit-explorer?theme=glass', 'Audit explorer');
    await clickExample('Load saved view');
    await retry(() => evaluate(`document.querySelector('.docs-example tbody')?.textContent.trim() === 'Invite accepted2026-10-22'
      && document.querySelector('.docs-example th')?.textContent === 'Event'`), 'saved view restores date bounds and the required column');
    await evaluate("localStorage.removeItem('utkristi-audit-view')");
    process.stdout.write('Verified worklist recovery and selection, plus audit accessibility in all themes.\n');

    await load('/components/file-input?theme=glass', 'File Input');
    await evaluate('document.querySelector("button[aria-controls=content-file-dropzone]").click()');
    await retry(() => evaluate('!!document.querySelector(".file-dropzone") && !!document.querySelector("a[href*=file-dropzone]")'), 'file input variant and its sandbox link');
    await evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['preview'], 'example.txt', { type: 'text/plain' }));
      document.querySelector('.file-dropzone').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    })()`);
    await retry(() => evaluate('document.querySelector(".docs-example [role=status]")?.textContent === "1 file selected"'), 'dropzone accepts a file');

    await load('/components/navbar?variant=navbar-multilevel&theme=glass', 'Navbar');
    await retry(() => evaluate('!!document.querySelector("#content-navbar-multilevel .docs-example")'), 'navbar variant deep link');
    await retry(() => evaluate('getComputedStyle(document.querySelector("#content-navbar-multilevel [data-ut-enter]")).animationName === "ut-appear-slide"'), 'variant entry motion');
    await setMotion('reduce');
    await retry(() => evaluate('getComputedStyle(document.querySelector("#content-navbar-multilevel [data-ut-enter]")).animationName === "none"'), 'variant respects reduced motion');
    await setMotion('no-preference');

    await load('/getting-started', 'Getting started');
    const links = await evaluate(`Array.from(document.querySelectorAll('.doc-sidebar a'), link => [link.hash.slice(1), link.textContent])`);
    const routes = [['/overview', 'Interfaces for live, dense, shared work.'], ['/showcase', 'Build together.'],
      ['/about', 'About'], ['/terms', 'Terms'], ['/privacy', 'Privacy'], ...blocks, ...links];
    const overflow = [];
    let variantsChecked = 0;
    for (const [theme] of themes) {
      for (const [path, title] of routes) {
        await load(path + '?theme=' + theme, title);
        await retry(() => evaluate('document.documentElement.dataset.theme === ' + JSON.stringify(theme)), theme);
        if (path.startsWith('/components/') || path.startsWith('/blocks/')) await retry(() => evaluate('!!document.querySelector(".component-api")'), path + ' generated example');
        const width = await evaluate('document.documentElement.scrollWidth');
        if (width > 375) overflow.push(path + ' (' + theme + ', ' + width + 'px)');
        if (theme === 'dark' && path.startsWith('/components/')) {
          const choices = await evaluate('[...document.querySelectorAll(".component-variants button[aria-controls]")].map(button => button.getAttribute("aria-controls").slice(8))');
          if (!choices.length) throw new Error('Missing component variants for ' + path);
          for (const choice of choices) {
            await evaluate(`document.querySelector('button[aria-controls="content-${choice}"]').click()`);
            await retry(() => evaluate(`!!document.querySelector(${JSON.stringify('a[href="#/sandbox?component=' + choice + '"]')})`), choice + ' sandbox source');
            const actual = await evaluate('document.documentElement.scrollWidth');
            if (actual > 375) overflow.push(choice + ' (' + actual + 'px at 375px)');
            await evaluate(`document.querySelector('button[aria-controls="content-${choice}"]').click()`);
            variantsChecked++;
          }
        }
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow at 375px: ${overflow.join(', ')}`);
    process.stdout.write(`Verified ${variantsChecked} component variants at 375px.\n`);
    const responsiveRoutes = [
      ['/overview', 'Interfaces for live, dense, shared work.'], ['/icons', 'Icons'], ['/tokens', 'Tokens'], ['/showcase', 'Build together.'],
      ['/components/command', 'Command'], ['/components/data-table', 'Data Table'], ['/components/file-input', 'File Input'],
      ['/theming', 'Theming'], ['/components/video', 'Video'],
      ['/sandbox?component=command', 'Sandbox'], ['/blocks', 'Blocks'], ['/blocks/project-directory', 'Project directory'],
      ['/blocks/project-worklist', 'Project worklist'], ['/blocks/audit-explorer', 'Audit explorer'], ['/blocks/roles-and-access', 'Roles and access'],
      ['/blocks/enterprise-landing', 'Enterprise landing'], ['/blocks/execution-desk', 'Execution desk'],
      ['/blocks/metric-card', 'Metric card'], ['/frameworks', 'Frameworks'],
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
            const desktop = bar.querySelector('.navbar-dock').clientWidth > 620;
            if (!desktop) return getComputedStyle(links).display === 'none' && getComputedStyle(burger).display !== 'none';
            const visible = [...links.querySelectorAll('.navbar-fit-item:not([data-hidden]) a, .navbar-more:not([data-hidden]) button')];
            const rows = new Set(visible.map(link => Math.round(link.getBoundingClientRect().top)));
            return getComputedStyle(burger).display === 'none' && rows.size === 1 && links.scrollWidth <= links.clientWidth;
          })()`);
          if (!fits) overflow.push(`${path} (${theme}, navigation does not fit at ${width}px)`);
        }
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow: ${overflow.join(', ')}`);
    await load('/getting-started?theme=light', 'Getting started');
    await evaluate('document.querySelector(".doc-sidebar nav [aria-current=page]").focus()');
    await retry(() => evaluate(`(() => {
      const link = document.querySelector('.doc-sidebar nav [aria-current=page]');
      const styles = getComputedStyle(link);
      return styles.boxShadow === 'none' && styles.outlineStyle === 'none';
    })()`), 'sidebar current page has no outline or side rule');
    await size(375, 812);
    await load('/getting-started?theme=glass', 'Getting started');
    await retry(() => evaluate(`(() => {
      const search = document.querySelector('.docs-navbar .navbar-search');
      const button = search.getBoundingClientRect();
      const icon = search.querySelector('svg').getBoundingClientRect();
      return Math.abs(button.x + button.width / 2 - icon.x - icon.width / 2) < 1 &&
        Math.abs(button.y + button.height / 2 - icon.y - icon.height / 2) < 1;
    })()`), 'compact navbar search is centered');
    await evaluate('document.querySelector(".doc-index-toggle").click()');
    await retry(() => evaluate('document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "true"'), 'open mobile docs index');
    await evaluate(`document.querySelector('.doc-index a[href="#/components/command"]').click()`);
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Command" && document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "false"'), 'mobile index navigation');
    await load('/icons?theme=glass', 'Icons');
    await retry(() => evaluate('!!document.querySelector(".icons-cell svg") && !!document.querySelector(".icons-glyph-placeholder")'), 'only nearby glyphs render initially');
    await evaluate('document.querySelector(".icons-cell:last-child").scrollIntoView({ block: "center" })');
    await retry(() => evaluate('!!document.querySelector(".icons-cell:last-child svg")'), 'scrolling reveals an offscreen glyph');
    await evaluate('window.scrollTo(0, 0)');
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }))');
    await retry(() => evaluate('document.activeElement?.getAttribute("aria-label") === "Search icons"'), 'icon search shortcut');
    const searchIcon = (term) => evaluate(`(() => {
      const input = document.querySelector('[aria-label="Search icons"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(term)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await searchIcon('api');
    await retry(() => evaluate('document.querySelector(".icons-cell")?.textContent.trim() === "api"'), 'exact icon match ranked first');
    await evaluate('(() => { const result = document.querySelector(".icons-cell"); result.focus(); result.click(); })()');
    await retry(() => evaluate('document.querySelector(".icons-detail .modal-title")?.textContent === "api"'), 'icon detail opens');
    await retry(() => evaluate(`(() => {
      const actions = [...document.querySelectorAll('.icons-detail-actions .btn')];
      return actions.length === 3 && actions.every(action => action.offsetHeight === actions[0].offsetHeight) &&
        !!document.querySelector('.icons-detail-controls .icon-swatch');
    })()`), 'equal-height icon actions and palette in the main controls');
    await evaluate(`(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(value) { window.copiedIcon = value; return Promise.resolve(); } } });
      Array.from(document.querySelectorAll('.icons-detail button')).find(button => button.textContent.trim() === 'Copy SVG').click();
    })()`);
    await retry(() => evaluate('window.copiedIcon?.startsWith("<svg") && window.copiedIcon.includes("http://www.w3.org/2000/svg") && window.copiedIcon.includes("M7 5 3 12")'), 'standalone SVG export');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))');
    await retry(() => evaluate('!document.querySelector(".icons-detail") && document.activeElement?.matches(".icons-cell")'), 'icon detail restores focus');
    await searchIcon('settings');
    await retry(() => evaluate('document.querySelector(".icons-cell")?.textContent.trim() === "settings"'), 'settings search result');
    await evaluate('document.querySelector(".icons-cell").click()');
    await retry(() => evaluate('!!document.querySelector(".icons-detail select")'), 'settings detail controls');
    await evaluate(`(() => {
      const select = document.querySelector('.icons-detail select');
      select.value = '3d';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await retry(() => evaluate(`['dark', 'light', 'glass'].every((theme, index) => {
      const icon = document.querySelector('.theme-preview[data-theme="' + theme + '"] .icon-3d img');
      return icon?.getAttribute('src').includes('/' + ['night', 'paper', 'glass'][index] + '/');
    })`), 'independent Night, Paper and Glass icon renders');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
    await retry(() => evaluate('getComputedStyle(document.querySelector(".icon-3d-fallback")).display !== "none"'), 'forced-colour icon fallback');
    await setMotion('no-preference');
    await evaluate('document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))');
    const clippedIcons = await evaluate(`(async () => {
      const response = await fetch('./icons/sprite.svg');
      if (!response.ok) throw new Error('The SVG sprite could not be loaded');
      const sprite = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      const ns = 'http://www.w3.org/2000/svg';
      const host = document.createElementNS(ns, 'svg');
      const path = document.createElementNS(ns, 'path');
      host.setAttribute('style', 'position:fixed;visibility:hidden;inline-size:24px;block-size:24px');
      host.append(path);
      document.body.append(host);
      try {
        return Array.from(sprite.querySelectorAll('symbol[id^="ut-icon-line-"],symbol[id^="ut-icon-filled-"]')).flatMap(symbol => {
          path.setAttribute('d', symbol.querySelector('path').getAttribute('d'));
          const box = path.getBBox();
          const margin = symbol.id.startsWith('ut-icon-line-') ? .99 : .09;
          return box.x < margin || box.y < margin || box.x + box.width > 24 - margin || box.y + box.height > 24 - margin ||
            !(box.width || box.height) ? [symbol.id] : [];
        });
      } finally { host.remove(); }
    })()`);
    if (clippedIcons.length) throw new Error(`SVG paths outside the icon canvas: ${clippedIcons.join(', ')}`);
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
      await load('/components/toast?theme=' + theme, 'Toast');
      await evaluate(`Array.from(document.querySelectorAll(${tablePreview} + ' button')).find(button => button.textContent.trim() === 'Show toast').click()`);
      await retry(() => evaluate(`(() => {
        const toast = document.querySelector('.toast');
        const icon = toast?.querySelector('.toast-icon')?.getBoundingClientRect();
        const title = toast?.querySelector('.toast-title')?.getBoundingClientRect();
        const dismiss = toast?.querySelector('.toast-dismiss')?.getBoundingClientRect();
        return icon && title && dismiss && icon.right <= title.left && title.right <= dismiss.left &&
          title.top < dismiss.bottom && dismiss.top < title.bottom && toast.getBoundingClientRect().height < 100;
      })()`), theme + ' toast alignment');
      await evaluate('document.querySelector(".toast-dismiss").click()');
      await retry(() => evaluate('!document.querySelector(".toast")'), theme + ' toast dismisses');
    }
    await size(390, 812);
    await evaluate(`localStorage.setItem('utkristi-sandbox:v1:file-input:react', '');
      localStorage.setItem('utkristi-sandbox:v2:file-input:html', '  ')`);
    await load('/sandbox?component=file-input&theme=glass', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("utkristi-ui.css")'), 'empty React draft recovers its starter');
    const showMobilePreview = () => evaluate(`[...document.querySelectorAll('.playground-panes button')].find(button => button.textContent === 'Preview').click()`);
    await showMobilePreview();
    await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "React preview ready"'), 'recovered React source runs on mobile');
    await selectOption('.playground select[id$="-mode"]', 'html');
    await retry(() => evaluate(`document.querySelector('#sandbox-source')?.value.includes('type="file"') &&
      getComputedStyle(document.querySelector('.playground-editor')).display !== 'none'`), 'empty HTML draft recovers and changing editors shows source on mobile');
    await showMobilePreview();
    await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'recovered HTML source runs on mobile');
    await size(1440, 900);
    await load('/sandbox?component=carousel&theme=glass', 'Sandbox');
    const ready = () => evaluate('document.querySelector(".playground-run-status")?.textContent === "React preview ready"');
    await retry(ready, 'initial React sandbox');
    await evaluate('Array.from(document.querySelectorAll(".playground-devices button")).find(button => button.textContent.trim() === "Phone").click()');
    await retry(() => evaluate('document.querySelector(".playground-stage").dataset.viewport === "phone" && document.querySelector(".playground iframe").clientWidth === 375'), 'sandbox phone preview width');
    await evaluate('Array.from(document.querySelectorAll(".playground-devices button")).find(button => button.textContent.trim() === "Tablet").click()');
    await retry(() => evaluate('document.querySelector(".playground iframe").clientWidth === 768'), 'sandbox tablet preview width');
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
    await load('/sandbox?component=command&theme=glass', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source").value.includes("Command")'), 'switch sandbox example');
    await load('/sandbox?component=carousel&theme=glass', 'Sandbox');
    await retry(() => evaluate(`document.querySelector('#sandbox-source').value === ${JSON.stringify(edited)}`), 'sandbox draft survives changing examples');
    await retry(ready, 'restored React draft runs');
    await size(375, 812);
    await retry(() => evaluate('getComputedStyle(document.querySelector(".playground-result")).display === "none"'), 'mobile editor first');
    await evaluate('document.querySelector(".playground-panes button:last-child").click()');
    await retry(() => evaluate('getComputedStyle(document.querySelector(".playground-editor")).display === "none" && getComputedStyle(document.querySelector(".playground-result")).display !== "none"'), 'mobile preview pane');
    await size(1440, 900);
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
    await load('/sandbox?component=navbar&editor=html&motion=fade&theme=glass', 'Sandbox');
    await retry(() => evaluate('document.querySelector(".playground select[id$=-variant]")?.value === "navbar"'), 'navbar sandbox variants');
    await selectOption('.playground select[id$="-variant"]', 'navbar-multilevel');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("Teams") && document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'HTML variant preserves editor selection');
    const verifyHtmlScript = async (probe, name, needsFrameFocus = false) => {
      if (await evaluate('!!document.querySelector(\'.playground select[id$="-mode"] option[value="js"]\')')) {
        throw new Error('JavaScript should be offered in the source-file group');
      }
      if (needsFrameFocus) return verifyFrameFocus(probe, name);
      await evaluate(`(() => {
        window.utkristiVerificationResult = undefined;
        const receive = event => {
          if (event.source !== document.querySelector('.playground iframe')?.contentWindow ||
            event.data?.kind !== 'utkristi-verification') return;
          window.utkristiVerificationResult = { passed: event.data.passed, detail: event.data.detail };
          window.removeEventListener('message', receive);
        };
        window.addEventListener('message', receive);
      })()`);
      const source = await evaluate('document.querySelector("#sandbox-source").value');
      await setSource(source + '\n<script>\nrequestAnimationFrame(() => {\n' + probe + '\n});\n</script>');
      await evaluate('Array.from(document.querySelectorAll(".playground-actions button")).find(button => button.textContent.trim() === "Run").click()');
      const result = await retry(() => evaluate('window.utkristiVerificationResult'), name);
      if (!result.passed) throw new Error(name + ' failed inside the HTML frame: ' + JSON.stringify(result.detail));
    };
    await verifyHtmlScript(disclosureProbe, 'HTML nested disclosure, focus return and animation choice', true);
    await load('/sandbox?component=file-dropzone&editor=html&theme=glass', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("data-ut-dropzone") && document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'HTML file drop preview');
    await verifyHtmlScript(`
      const files = new DataTransfer();
      files.items.add(new File(['sample'], 'notes.txt'));
      const zone = document.querySelector('[data-ut-dropzone]');
      zone.dispatchEvent(new DragEvent('drop', { dataTransfer: files, bubbles: true, cancelable: true }));
      const detail = { file: zone.querySelector('input').files[0]?.name, status: zone.querySelector('[role=status]').textContent };
      parent.postMessage({ kind: 'utkristi-verification', passed: detail.file === 'notes.txt' && detail.status === '1 file selected', detail }, '*');
    `, 'HTML dropzone behavior');
    await load('/sandbox?component=table&editor=html', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("Contributors") && document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'HTML table preview');
    await verifyHtmlScript(`
      const region = document.querySelector('.table-wrap');
      region.querySelector('td').textContent = 'LongUnbrokenIdentifier'.repeat(10);
      region.focus();
      region.scrollLeft = 120;
      const detail = { scrolled: region.scrollLeft, focused: document.activeElement === region,
        pageFits: document.documentElement.scrollWidth === document.documentElement.clientWidth };
      parent.postMessage({ kind: 'utkristi-verification', passed: detail.scrolled > 0 && detail.focused && detail.pageFits, detail }, '*');
    `, 'wide tables scroll inside the keyboard-focusable region', true);
    await load('/sandbox?component=questionnaire&editor=html', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("workspace-survey") && document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'HTML form preview');
    await verifyHtmlScript(`
      const form = document.querySelector('#workspace-survey');
      form.elements.workspace.value = 'Studio';
      form.requestSubmit();
      const detail = form.querySelector('output').value;
      parent.postMessage({ kind: 'utkristi-verification', passed: detail === 'Saved workspace: Studio', detail }, '*');
    `, 'HTML form submits locally in the sandbox');
    await load('/sandbox?component=data-table--page-size&editor=html', 'Sandbox');
    await retry(() => evaluate('document.querySelector("#sandbox-source")?.value.includes("configurable-projects") && document.querySelector(".playground-run-status")?.textContent === "HTML preview ready"'), 'configurable table HTML source');
    await verifyHtmlScript(`
      const root = document.querySelector('#configurable-projects');
      const picker = root.querySelector('select');
      picker.value = '2';
      picker.dispatchEvent(new Event('change'));
      root.querySelector('[type=checkbox]').click();
      const detail = { visible: root.querySelectorAll('tbody tr:not([hidden])').length,
        ownerHidden: root.querySelector('th[data-owner]').hidden, fieldHeight: picker.offsetHeight };
      parent.postMessage({ kind: 'utkristi-verification', passed: detail.visible === 2 && detail.ownerHidden && detail.fieldHeight === 40, detail }, '*');
    `, 'HTML table changes page size and column visibility');
    await load('/sandbox?component=button&editor=html', 'Sandbox');
    await retry(() => evaluate('document.querySelector(".playground-filename")?.textContent === "button.html"'), 'HTML file editor');
    await setSource('<div id="file-test">Three files</div>');
    const chooseFile = (name) => evaluate(`[...document.querySelectorAll('.playground-files button')].find(button => button.textContent === ${JSON.stringify(name)}).click()`);
    const runEditor = () => evaluate(`[...document.querySelectorAll('.playground-actions button')].find(button => button.textContent.trim() === 'Run').click()`);
    await chooseFile('CSS');
    await setSource('#file-test { color: rgb(12, 34, 56); }');
    await chooseFile('JS');
    await setSource('throw new Error("Sandbox script failed");');
    await runEditor();
    await retry(() => evaluate('document.querySelector(".playground [role=alert]")?.textContent.includes("Sandbox script failed")'), 'JavaScript error is visible');
    await setSource('if (getComputedStyle(document.querySelector("#file-test")).color !== "rgb(12, 34, 56)") throw new Error("Missing stylesheet");');
    await runEditor();
    await retry(() => evaluate('document.querySelector(".playground-run-status")?.textContent === "HTML preview ready" && !document.querySelector(".playground [role=alert]")'), 'all three web files run together after fixing an error');
    await load('/sandbox?component=badge&editor=react', 'Sandbox');
    await retry(() => evaluate('document.querySelector(".playground-filename")?.textContent === "badge.tsx" && document.querySelector(".playground-run-status")?.textContent === "React preview ready"'), 'React source editor');
    await setSource('export default function Example() { return null; }');
    await runEditor();
    await retry(() => evaluate('document.querySelector(".playground [role=alert]")?.textContent.includes("returned no visible content")'), 'empty React output shows an error');
    const standaloneDom = await fetch(url + '/utkristi-dom.js');
    if (!standaloneDom.ok || !(await standaloneDom.text()).includes('UtkristiDOM')) throw new Error('Standalone script is unavailable');
    process.stdout.write('Verified interactive HTML variants and JavaScript editing.\n');
    if (exceptions.length) throw new Error('Unhandled browser errors: ' + exceptions.join('\n'));
    await load('/components/not-a-real-component', 'Page not found');
    await retry(() => evaluate('document.activeElement?.matches(".docs-status h1") && !!document.querySelector(".docs-navbar")'), '404 focuses heading and keeps navigation');
    await evaluate('document.querySelector(\'.docs-status a[href="#/overview"]\').click()');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Interfaces for live, dense, shared work."'), '404 returns to overview');
    await load('/404', 'Page not found');
    await load('/error?theme=glass', 'Something went wrong');
    await load('/500', 'Something went wrong');
    for (const [path, code, title] of [
      ['/404', 404, 'Page not found'], ['/missing/nested/docs-page', 404, 'Page not found'],
      ['/error', 500, 'Something went wrong'], ['/500', 500, 'Something went wrong'],
    ]) {
      const response = await fetch(url + path, { headers: { Accept: 'text/html' } });
      if (response.status !== code || !(await response.text()).includes(`<h1>${title}</h1>`)) {
        throw new Error(`${path} should return HTTP ${code} and the branded status page`);
      }
      await send('Page.navigate', { url: url + path });
      await retry(() => evaluate(`document.querySelector("h1")?.textContent === ${JSON.stringify(title)} && !document.querySelector("script")`), path + ' direct browser navigation');
    }
    const missingAsset = await fetch(url + '/assets/nonexistent-chunk.js');
    if (missingAsset.status !== 404) throw new Error('A missing asset should return HTTP 404');
    for (const [code, title] of [[404, 'Page not found'], [500, 'Something went wrong']]) {
      await send('Page.navigate', { url: `${url}/${code}.html` });
      await retry(() => evaluate(`document.querySelector("h1")?.textContent === ${JSON.stringify(title)} && !document.querySelector("script")`), 'standalone ' + code);
    }

    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    fault = { responseCode: 404, responseHeaders: [{ name: 'Cache-Control', value: 'no-store' }] };
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/IconsPage-*.js' }] });
    try {
      await send('Page.navigate', { url: `${url}/?recovery-test=missing#/icons` });
      await retry(() => evaluate(`document.querySelector('.docs-status h1')?.textContent.trim() === 'This page couldn’t load' &&
        !!sessionStorage.getItem('utkristi-docs:asset-recovery')`), 'missing chunk recovery panel');
      await retry(() => faultRequests >= 2, 'one automatic retry of missing chunk');
      const recoveredAt = await evaluate('performance.timeOrigin');
      await sleep(400);
      if (faultRequests !== 2 || await evaluate('performance.timeOrigin') !== recoveredAt) throw new Error('Missing chunk recovery reloaded more than once');
    } finally {
      await send('Fetch.disable');
    }
    await evaluate('document.querySelector(".docs-status button").click()');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Icons" && !!document.querySelector(".icons-cell")'), 'reload restores the missing route');

    faultRequests = 0;
    fault = { responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript' }, { name: 'Cache-Control', value: 'no-store' }],
      body: Buffer.from('throw new Error("Forced docs module error");').toString('base64') };
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/IconsPage-*.js' }] });
    try {
      await send('Page.navigate', { url: `${url}/?recovery-test=render#/icons` });
      await retry(() => evaluate('document.querySelector(".docs-status h1")?.textContent.trim() === "Something went wrong"'), 'runtime error fallback');
      if (faultRequests !== 1) throw new Error('A runtime error triggered an automatic reload');
      await evaluate('document.querySelector(".docs-status a").click()');
      await retry(() => evaluate('document.querySelector("h1")?.textContent === "Interfaces for live, dense, shared work."'), 'leave a failed route without reloading');
    } finally {
      await send('Fetch.disable');
    }
    fault = { responseCode: 404, responseHeaders: [{ name: 'Cache-Control', value: 'no-store' }] };
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/index-*.js' }] });
    try {
      await send('Page.navigate', { url: `${url}/?recovery-test=entry` });
      await retry(() => evaluate('!!document.querySelector("#docs-boot-loader[hidden]") && !!document.querySelector("#docs-boot-error:not([hidden])")'), 'startup loader yields to the error page');
    } finally {
      await send('Fetch.disable');
    }
    process.stdout.write('Verified standalone error pages, docs 404 routing, and recovery from a missing bundle and module error.\n');
    process.stdout.write('Verified React and HTML sandbox previews.\n');
    process.stdout.write(`Checked ${routes.length} docs routes in Night, Paper, and Glass at 375px.\n`);
    process.stdout.write(`Checked ${responsiveRoutes.length} key routes at 320, 390, 768, 981, 1024, and 1440px in all themes.\n`);
  } finally {
    if (client) await Promise.race([client.send('Browser.close').catch(() => {}), sleep(1500)]);
    client?.close();
    if (!await Promise.race([exited.then(() => true), sleep(1500, false)])) browser.kill();
    await exited;
    const absoluteProfile = resolve(profile);
    if (absoluteProfile.startsWith(join(resolve(root), '.edge-preview-')) && !absoluteProfile.slice(resolve(root).length + 1).includes(sep)) {
      await rm(absoluteProfile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
    }
  }
}

async function capturePlaywright() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 760, height: 480 });
    let releaseEntry;
    const entryGate = new Promise((resolve) => { releaseEntry = resolve; });
    await page.route('**/assets/index-*.js', async (route) => { await entryGate; await route.continue(); });
    try {
      await page.goto(`${url}/?loader-preview=1`, { waitUntil: 'commit' });
      await page.locator('#docs-boot-loader').waitFor();
      await page.screenshot({ path: join(screenshots, 'loader.png'), timeout: 8000 });
    } finally {
      releaseEntry();
      await page.unroute('**/assets/index-*.js');
    }
    await page.setViewportSize(viewport);
    for (const [theme, file] of themes) {
      await page.goto(`${url}/#/showcase?theme=${theme}`);
      await page.locator(`html[data-theme="${theme}"] .showcase`).waitFor();
      await page.locator('.showcase-icon-tray').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(screenshots, `${file}.png`), fullPage: true });
    }
    await page.goto(`${url}/#/overview?theme=glass`);
    await page.locator('html[data-theme="glass"] .mk-hero').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(screenshots, 'overview.png'), fullPage: true });
    await page.setViewportSize({ width: 760, height: 812 });
    await page.locator('.navbar-more:not([data-hidden]) button').click();
    await page.locator('.navbar-more .popover-panel').waitFor();
    await page.screenshot({ path: join(screenshots, 'navbar-overflow.png') });
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${url}/#/icons?theme=glass`);
    await page.locator('.icons-cell').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(screenshots, 'icons.png') });
    await page.goto(`${url}/#/sandbox?component=carousel&theme=glass`);
    await page.getByText('React preview ready', { exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(screenshots, 'sandbox.png') });
    for (const [slug, theme] of [['enterprise-landing', 'glass'], ['execution-desk', 'dark']]) {
      await page.goto(`${url}/#/blocks/${slug}?theme=${theme}`);
      await page.locator(`html[data-theme="${theme}"] :is(.ut-template, .workspace)`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(screenshots, slug + '.png') });
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

if (!reuseBuild) await run(['build', '--config', 'docs/vite.config.ts']);
if (!verifyOnly) await mkdir(screenshots, { recursive: true });
const server = spawn(process.execPath, [vite, 'preview', '--config', 'docs/vite.config.ts', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { cwd: root, stdio: 'inherit', windowsHide: true });
const stopped = once(server, 'exit').catch(() => {});
try {
  await retry(async () => !server.exitCode && (await fetch(url)).ok, 'Vite preview', 240);
  if (existsSync(browserPath)) await captureEdge();
  else if (verifyOnly || themesOnly || workspacesOnly || catalogOnly) throw new Error(`Browser verification requires Chromium. Set CHROMIUM_PATH (checked ${browserPath}).`);
  else await capturePlaywright();
} finally {
  server.kill();
  await stopped;
}
