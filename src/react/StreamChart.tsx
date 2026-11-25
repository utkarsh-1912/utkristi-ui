'use client';

import { useEffect, useState } from 'react';
import type { ChartBucket, createChartStream } from './chart-stream.js';

export type StreamChartVariant = 'line' | 'range' | 'candlestick';

export function StreamChart({ stream, label, variant = 'line', paused = false, unit = '' }: {
  stream: ReturnType<typeof createChartStream>; label: string; variant?: StreamChartVariant; paused?: boolean; unit?: string;
}) {
  const [points, setPoints] = useState<ChartBucket[]>(() => stream.snapshot());
  useEffect(() => {
    if (paused) return;
    let frame: number | undefined;
    const unsubscribe = stream.subscribe(() => {
      if (frame === undefined) frame = requestAnimationFrame(() => { frame = undefined; setPoints(stream.snapshot()); });
    });
    setPoints(stream.snapshot());
    return () => { unsubscribe(); if (frame !== undefined) cancelAnimationFrame(frame); };
  }, [stream, paused]);
  const latest = points[points.length - 1];
  if (!latest) return <figure><figcaption>{label}</figcaption><p>Waiting for samples</p></figure>;
  const low = Math.min(...points.map(p => p.low)), high = Math.max(...points.map(p => p.high));
  const x = (p: ChartBucket) => 6 + (p.time - points[0].time) / (latest.time - points[0].time || 1) * 628;
  const y = (v: number) => high === low ? 80 : 150 - (v - low) / (high - low) * 140;
  const coords = (p: ChartBucket, v: number) => x(p) + ',' + y(v);
  const close = points.map(p => coords(p, p.close)).join(' ');
  const range = variant === 'range' && [...points.map(p => coords(p, p.high)), ...points.slice().reverse().map(p => coords(p, p.low))].join(' ');
  const format = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  return <figure style={{ margin: 0, minWidth: 0 }}>
    <figcaption><strong>{label}</strong> · {format(latest.close)} {unit}</figcaption>
    <svg viewBox="0 0 640 160" width="100%" role="img" aria-label={label + ', ' + variant + ', low ' + format(low) + ', high ' + format(high)} style={{ display: 'block', color: 'var(--ut-accent)' }}>
      {[10,80,150].map(level => <path key={level} d={'M0 '+level+'h640'} stroke="var(--ut-line)" />)}
      {range && <polygon points={range} fill="currentColor" opacity=".25" />}
      {variant === 'candlestick' ? points.map(p => <g key={p.time} stroke={p.close >= p.open ? 'currentColor' : 'var(--ut-ink)'}>
        <path d={'M'+x(p)+' '+y(p.high)+'V'+y(p.low)} />
        <rect x={x(p)-1.5} y={Math.min(y(p.open),y(p.close))} width={3} height={Math.max(1,Math.abs(y(p.open)-y(p.close)))} fill={p.close >= p.open ? 'var(--ut-bg)' : 'var(--ut-ink)'} />
      </g>) : <><polyline points={close} fill="none" stroke="currentColor" strokeWidth="2" /><circle cx={x(latest)} cy={y(latest.close)} r="3" fill="currentColor" /></>}
    </svg>
    <small>Low {format(low)} · High {format(high)} {unit} · {((latest.time - points[0].time)/1000).toFixed(2)} s between bucket starts</small>
  </figure>;
}
