import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import { createElement } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Table } from '../dist/react/index.js';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement']) {
  globalThis[key] = dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

console.log(
  `Benchmark results:\n` +
  `- Virtualized 2,500-row mount: ${renderMs.toFixed(1)} ms (${renderedNodes} DOM rows rendered)\n` +
  `- 100 rapid updates: ${updateMs.toFixed(1)} ms (${(updateMs / 100).toFixed(2)} ms/update)\n` +
  `- 50 mount/unmount cycles: ${cycleMs.toFixed(1)} ms (${(cycleMs / 50).toFixed(2)} ms/cycle)\n` +
  `- Heap used after cleanup: ${memMb} MB`
);
dom.window.close();
