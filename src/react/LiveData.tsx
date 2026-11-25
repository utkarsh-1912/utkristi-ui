'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button.js';
import { Checkbox } from './Choice.js';
import { SearchInput } from './Field.js';
import { cx } from './utils/cx.js';

const useScrollLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export { NumberFormat, Ticker, useFormat, type TickerItem } from './Ticker.js';

export function Sparkline({ values, label, className }: { values: readonly number[]; label: string; className?: string }) {
  const valid = values.filter(Number.isFinite);
  const { min, max } = valid.reduce(({ min, max }, value) => ({ min: Math.min(min, value), max: Math.max(max, value) }),
    { min: Infinity, max: -Infinity });
  const points = valid.map((value, index) => `${2 + index * 96 / Math.max(1, valid.length - 1)},${min === max ? 16 : 30 - (value - min) * 28 / (max - min)}`).join(' ');
  return <svg className={cx('live-sparkline', className)} viewBox="0 0 100 32" role="img" aria-label={label}>
    {valid.length > 1 ? <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      : valid.length === 1 ? <circle cx="50" cy="16" r="2" fill="currentColor" /> : null}
  </svg>;
}

export function Gauge({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const upper = Number.isFinite(max) && max > 0 ? max : 100;
  const current = Number.isFinite(value) ? Math.max(0, Math.min(upper, value)) : 0;
  return <label className="live-gauge"><span>{label}</span><meter min={0} max={upper} value={current} /><b>{current} / {upper}</b></label>;
}

export interface LogViewerProps {
  lines: readonly string[]; label?: string; height?: number; lineHeight?: number; defaultFollow?: boolean;
}

// ANSI SGR escape codes are embedded in terminal output.
// eslint-disable-next-line no-control-regex
const sgr = /\x1b\[([\d;]*)m/g;
const palette = ['muted', 'bad', 'ok', 'warn', 'accent', 'accent', 'accent', 'ink'];
function ansiSegments(line: string) {
  let cursor = 0;
  let tone: string | undefined;
  let bold = false;
  const result = [];
  for (const match of line.matchAll(sgr)) {
    const index = match.index;
    result.push({ text: line.slice(cursor, index), tone, bold });
    cursor = index + match[0].length;
    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0 || code === 39) tone = undefined;
      if (code === 0 || code === 22) bold = false;
      if (code === 1) bold = true;
      if (code >= 30 && code <= 37) tone = palette[code - 30];
      if (code >= 90 && code <= 97) tone = palette[code - 90];
    }
  }
  result.push({ text: line.slice(cursor), tone, bold });
  return result;
}

export function LogViewer({ lines, label = 'Log output', height = 320, lineHeight = 24, defaultFollow = true }: LogViewerProps) {
  const [query, setQuery] = useState('');
  const [follow, setFollow] = useState(defaultFollow);
  const [top, setTop] = useState(0);
  const [copied, setCopied] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => query.trim() ? lines.filter((line) => line.replace(sgr, '').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) : lines, [lines, query]);
  const row = Number.isFinite(lineHeight) ? Math.min(120, Math.max(16, lineHeight)) : 24;
  const size = Number.isFinite(height) ? Math.max(row, height) : 320;
  useScrollLayout(() => {
    if (!viewport.current) return;
    const next = follow ? filtered.length * row : viewport.current.scrollTop;
    viewport.current.scrollTop = next;
    setTop(viewport.current.scrollTop);
  }, [filtered, follow, row]);
  const start = Math.max(0, Math.min(Math.floor(top / row) - 6, filtered.length - 1));
  const end = Math.min(filtered.length, start + Math.ceil(size / row) + 12);
  return <section className="live-log" aria-label={label}>
    <div className="live-log-tools">
      <SearchInput aria-label="Filter log lines" value={query} onChange={(event) => { setQuery(event.target.value); setCopied(false); if (viewport.current) viewport.current.scrollTop = 0; }} />
      <Checkbox label="Follow tail" checked={follow} onChange={(event) => setFollow(event.target.checked)} />
      <Button size="sm" variant="ghost" onClick={async () => {
        try { await navigator.clipboard.writeText(filtered.map((line) => line.replace(sgr, '')).join('\n')); setCopied(true); }
        catch { setCopied(false); }
      }}>{copied ? 'Copied' : 'Copy log'}</Button>
    </div>
    {/* The scrolling viewport needs a keyboard tab stop. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
    <div ref={viewport} role="region" aria-label={`${label} lines`} tabIndex={0} className="live-log-viewport"
      style={{ blockSize: size }} onScroll={(event) => setTop(event.currentTarget.scrollTop)}>
      <div style={{ blockSize: start * row }} aria-hidden="true" />
      {filtered.slice(start, end).map((line, index) => <div className="live-log-line" key={start + index} style={{ blockSize: row, lineHeight: `${row}px` }}>
        {ansiSegments(line).map(({ text, tone, bold }, index) => <span key={index} data-tone={tone} style={bold ? { fontWeight: 'bold' } : undefined}>{text}</span>)}
      </div>)}
      <div style={{ blockSize: (filtered.length - end) * row }} aria-hidden="true" />
      {!filtered.length && <p className="muted">No matching log lines.</p>}
    </div>
    <small>{filtered.length} lines</small>
  </section>;
}
