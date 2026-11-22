import { performance } from 'node:perf_hooks';
import { setTimeout as wait } from 'node:timers/promises';
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { JSDOM } from 'jsdom';
import { createElement } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createDataTableStream, CursorLayer, DataTable, LogViewer, Table } from '../dist/react/index.js';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement']) {
  globalThis[key] = dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

const container = document.getElementById('root');
const bigRows = Array.from({ length: 2500 }, (_, i) => ({
  id: `ROW-${i}`,
  symbol: ['ALP', 'MRD', 'UTK', 'NVO'][i % 4],
  qty: (i + 1) * 10,
}));
const columns = [
  { key: 'id', header: 'Order' },
  { key: 'symbol', header: 'Symbol' },
  { key: 'qty', header: 'Qty', num: true },
];

// 1. Virtualized 2,500-row initial render
const t0 = performance.now();
const root = createRoot(container);
act(() => {
  root.render(createElement(Table, {
    caption: 'Benchmark table',
    rows: bigRows,
    columns,
    getRowKey: (r) => r.id,
    virtualize: { rowHeight: 36, height: 360, overscan: 4 },
  }));
});
const renderMs = performance.now() - t0;
const renderedNodes = container.querySelectorAll('tbody tr[aria-rowindex]').length;

// 2. 100 rapid updates
const t1 = performance.now();
for (let i = 0; i < 100; i++) {
  act(() => {
    root.render(createElement(Table, {
      caption: `Benchmark update ${i}`,
      rows: bigRows.slice(i, i + 2000),
      columns,
      getRowKey: (r) => r.id,
      virtualize: { rowHeight: 36, height: 360, overscan: 4 },
    }));
  });
}
const updateMs = performance.now() - t1;
act(() => { root.unmount(); });

// 3. 50 mount/unmount cycles
const t2 = performance.now();
for (let i = 0; i < 50; i++) {
  const cycleRoot = createRoot(container);
  act(() => {
    cycleRoot.render(createElement(Table, {
      rows: bigRows.slice(0, 100),
      columns,
      getRowKey: (r) => r.id,
      virtualize: { rowHeight: 36, height: 240 },
    }));
  });
  act(() => { cycleRoot.unmount(); });
}
const cycleMs = performance.now() - t2;
const memMb = Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10;

const streamRoot = createRoot(container);
const stream = createDataTableStream();
const streamRows = Array.from({ length: 10_000 }, (_, index) => ({ id: String(index), symbol: 'UTK', qty: index }));
act(() => streamRoot.render(createElement(DataTable, {
  rows: streamRows, stream, getRowKey: (row) => row.id, columns, pageSize: 10_000,
  virtualize: { rowHeight: 36, height: 360, overscan: 4 },
})));
const rounds = process.argv.includes('--stress') ? 1_500 : 50;
const startStream = performance.now();
let frameElapsed = 0;
let maxFrame = 0;
for (let index = 0; index < rounds; index++) {
  const target = startStream + (index + 1) * 20;
  await wait(Math.max(0, target - performance.now()));
  const start = performance.now();
  await act(async () => {
    stream.applyPatch({ upsert: [{ ...streamRows[index % 10], qty: index + 10 }] });
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  const elapsed = performance.now() - start;
  frameElapsed += elapsed;
  maxFrame = Math.max(maxFrame, elapsed);
}
const elapsedStream = performance.now() - startStream;
act(() => streamRoot.unmount());

const logRoot = createRoot(container);
const startLog = performance.now();
act(() => logRoot.render(createElement(LogViewer, {
  lines: Array.from({ length: 100_000 }, (_, index) => `Line ${index}`), defaultFollow: false,
})));
const logElapsed = performance.now() - startLog;
const logRows = container.querySelectorAll('.live-log-line').length;
act(() => logRoot.unmount());

const cursorRoot = createRoot(container);
const people = Array.from({ length: 25 }, (_, index) => ({ id: String(index), name: `Reviewer ${index}` }));
const startCursors = performance.now();
for (let offset = 0; offset < 60; offset++) {
  const cursors = people.map(({ id }, index) => ({ userId: id, x: (index + offset) % 100, y: index * 3, updatedAt: Date.now() }));
  act(() => cursorRoot.render(createElement(CursorLayer, { users: people, cursors })));
}
const cursorElapsed = performance.now() - startCursors;
act(() => cursorRoot.unmount());

const overlayBytes = await Promise.all(['Menu', 'Popover', 'Tooltip', 'SelectMenu', 'Combobox', 'DatePicker', 'Modal'].map(async (name) => {
  const { outputFiles } = await build({
    stdin: { contents: `export { ${name} } from '@utkristi/ui';`, resolveDir: process.cwd() },
    bundle: true, minify: true, format: 'esm', write: false, external: ['react', 'react-dom'], tsconfigRaw: {},
  });
  return `${name} ${gzipSync(outputFiles[0].contents).length} B`;
}));

console.log(
  `Benchmark results:\n` +
  `- Virtualized 2,500-row mount: ${renderMs.toFixed(1)} ms (${renderedNodes} DOM rows rendered)\n` +
  `- 100 rapid updates: ${updateMs.toFixed(1)} ms (${(updateMs / 100).toFixed(2)} ms/update)\n` +
  `- 50 mount/unmount cycles: ${cycleMs.toFixed(1)} ms (${(cycleMs / 50).toFixed(2)} ms/cycle)\n` +
  `- Heap used after table cleanup: ${memMb} MB\n` +
  `- 10,000-row stream: ${rounds} patches in ${(elapsedStream / 1000).toFixed(2)} s, ${(frameElapsed / rounds).toFixed(2)} ms mean scheduled update, ${maxFrame.toFixed(2)} ms max (JSDOM)\n` +
  `- 100,000-line log: ${logElapsed.toFixed(1)} ms mount, ${logRows} DOM lines (JSDOM)\n` +
  `- 25 cursors: ${(cursorElapsed / 60).toFixed(2)} ms/update over 60 updates (JSDOM)\n` +
  `- Overlay imports, gzip without React: ${overlayBytes.join(', ')}`
);
dom.window.close();
