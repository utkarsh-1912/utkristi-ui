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
      const clip = fullPage ? { x: 0, y: 0, width: viewport.width, height: Math.ceil((await send('Page.getLayoutMetrics')).cssContentSize.height), scale: 1 } : undefined;
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: fullPage, clip });
      await writeFile(join(screenshots, `${file}.png`), Buffer.from(data, 'base64'));
    };
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
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
    await retry(() => evaluate('!document.querySelector("#docs-boot-loader") && !!document.querySelector(".marketing-hero")'), 'startup loader hands off to the app');
    await size(viewport.width, viewport.height);
    for (const [theme, file] of themes) {
      await load(`/showcase?theme=${theme}`, 'Build together.');
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}'`), theme);
      await retry(() => evaluate('getComputedStyle(document.querySelector(".header-dock .navbar-links")).display === "flex"'), 'desktop dock links');
      await retry(() => evaluate('!!document.querySelector(".showcase-icon-tray")'), 'showcase tray');
      await fontsReady();
      await screenshot(file, true);
    }
    await load('/overview?theme=glass', 'A design system for Utkristi.');
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
      await retry(() => evaluate(`document.documentElement.dataset.theme === '${theme}' && !!document.querySelector('.ut-template')`), title + ' screenshot');
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
    process.stdout.write('Captured the overview, showcases, icon catalog, sandbox, enterprise templates, and both mobile views.\n');
    if (captureOnly) return;
    await send('Emulation.setEmulatedMedia', { features: [] });

    await size(1280, 860);
    await load('/components/loader?theme=glass', 'Loader');
    await retry(() => evaluate('getComputedStyle(document.querySelector(".docs-example .loader-brand .brand-tile")).animationName === "ut-loader-assemble"'), 'animated brand loader');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await retry(() => evaluate('getComputedStyle(document.querySelector(".docs-example .loader-brand .brand-tile")).animationName === "none"'), 'static brand loader with reduced motion');
    await send('Emulation.setEmulatedMedia', { features: [] });
    const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    await load('/overview', 'A design system for Utkristi.');
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

    await load('/blocks/enterprise-landing?theme=glass', 'Enterprise landing');
    await selectOption('.ut-template select[aria-label="Template preset"]', 'ledger');
    await selectOption('.docs-example select[aria-label="Preview theme"]', 'light');
    await retry(() => evaluate('!!document.querySelector(\'.theme-preview[data-theme="light"] .ut-template[data-ut-preset="ledger"]\')'), 'appearance change preserves template preset');
    await evaluate('document.querySelector(".ut-enterprise-intro .btn-solid").click()');
    await retry(() => evaluate('!!document.querySelector(\'.ut-portal[data-theme="light"][data-ut-preset="ledger"] .modal\')'), 'template dialog carries scoped appearance');
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
    await evaluate('document.querySelector(".ut-template-toolbar [role=switch]").click()');
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
    await load('/overview?theme=glass', 'A design system for Utkristi.');
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
    await load('/overview?theme=glass', 'A design system for Utkristi.');
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

    await load('/components/file-input?theme=glass', 'File Input');
    await evaluate(`(() => {
      const select = document.querySelector('select[aria-label="Example variant"]');
      select.value = 'file-dropzone';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await retry(() => evaluate('!!document.querySelector(".file-dropzone") && !!document.querySelector("a[href*=file-dropzone]")'), 'file input variant and its sandbox link');
    await evaluate(`(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['preview'], 'example.txt', { type: 'text/plain' }));
      document.querySelector('.file-dropzone').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    })()`);
    await retry(() => evaluate('document.querySelector(".docs-example [role=status]")?.textContent === "1 file selected"'), 'dropzone accepts a file');

    await load('/getting-started', 'Getting started');
    const links = await evaluate(`Array.from(document.querySelectorAll('.doc-sidebar a'), link => [link.hash.slice(1), link.textContent])`);
    const routes = [['/overview', 'A design system for Utkristi.'], ['/showcase', 'Build together.'],
      ['/about', 'About'], ['/terms', 'Terms'], ['/privacy', 'Privacy'], ...blocks, ...links];
    const overflow = [];
    for (const [theme] of themes) {
      for (const [path, title] of routes) {
        await load(path + '?theme=' + theme, title);
        await retry(() => evaluate('document.documentElement.dataset.theme === ' + JSON.stringify(theme)), theme);
        if (path.startsWith('/components/') || path.startsWith('/blocks/')) await retry(() => evaluate('!!document.querySelector(".component-api")'), path + ' generated example');
        const width = await evaluate('document.documentElement.scrollWidth');
        if (width > 375) overflow.push(path + ' (' + theme + ', ' + width + 'px)');
      }
    }
    if (overflow.length) throw new Error(`Horizontal overflow at 375px: ${overflow.join(', ')}`);
    const responsiveRoutes = [
      ['/overview', 'A design system for Utkristi.'], ['/icons', 'Icons'], ['/tokens', 'Tokens'], ['/showcase', 'Build together.'],
      ['/components/command', 'Command'], ['/components/data-table', 'Data Table'], ['/components/file-input', 'File Input'],
      ['/sandbox?component=command', 'Sandbox'], ['/blocks', 'Blocks'], ['/blocks/project-directory', 'Project directory'],
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
    await evaluate('document.querySelector(".doc-index-toggle").click()');
    await retry(() => evaluate('document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "true"'), 'open mobile docs index');
    await evaluate(`document.querySelector('.doc-index a[href="#/components/command"]').click()`);
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "Command" && document.querySelector(".doc-index-toggle").getAttribute("aria-expanded") === "false"'), 'mobile index navigation');
    await load('/icons?theme=glass', 'Icons');
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
    await send('Emulation.setEmulatedMedia', { features: [] });
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
    if (exceptions.length) throw new Error('Unhandled browser errors: ' + exceptions.join('\n'));
    await load('/components/not-a-real-component', 'Page not found');
    await retry(() => evaluate('document.activeElement?.matches(".docs-status h1") && !!document.querySelector(".docs-navbar")'), '404 focuses heading and keeps navigation');
    await evaluate('document.querySelector(\'.docs-status a[href="#/overview"]\').click()');
    await retry(() => evaluate('document.querySelector("h1")?.textContent === "A design system for Utkristi."'), '404 returns to overview');
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
      await retry(() => evaluate('document.querySelector("h1")?.textContent === "A design system for Utkristi."'), 'leave a failed route without reloading');
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
    await page.locator('html[data-theme="glass"] .marketing-hero').waitFor();
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
      await page.locator(`html[data-theme="${theme}"] .ut-template`).waitFor();
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
