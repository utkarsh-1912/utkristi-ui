'use client';

import { useId, useState, type ReactNode } from 'react';

export interface PlotRow { label: string; values: readonly number[] }
export interface PlotSeries { label: string; color?: string; icon?: ReactNode; mark?: 'bar' | 'line' }
export interface PlotProps {
  title: string;
  kind: 'area' | 'bar' | 'line' | 'pie' | 'radar' | 'radial';
  rows: readonly PlotRow[];
  series: readonly PlotSeries[];
  curve?: 'smooth' | 'linear' | 'step';
  stack?: 'sum' | 'percent';
  grid?: 'polygon' | 'circle' | 'none';
  gridFill?: boolean;
  gridLevels?: readonly number[];
  spokes?: boolean;
  horizontal?: boolean;
  axes?: boolean;
  gradient?: boolean;
  dots?: boolean | 'category' | ((x: number, y: number, index: number, color: string) => ReactNode);
  labels?: boolean | ((value: number, row: PlotRow) => string);
  legend?: boolean;
  interactive?: boolean;
  hollow?: boolean;
  separators?: boolean;
  center?: string | number;
  sweep?: number;
  max?: number;
  outline?: boolean;
  rounded?: boolean;
  colorByRow?: boolean;
  indicator?: 'dot' | 'line' | 'none';
  tooltipTitle?: false | ((row: PlotRow) => ReactNode);
  format?: (value: number) => string;
  tooltipValue?: (value: number, series: PlotSeries) => ReactNode;
}

const palette = ['var(--ut-accent)', '#b85bc7', '#d68033', '#268d83', '#a95f75', '#4984cc'];
const colorAt = (i: number) => palette[i % palette.length];
const finite = (n: number | undefined) => Number.isFinite(n) ? n! : 0;
const polar = (radius: number, angle: number) => [160 + radius * Math.sin(angle), 96 - radius * Math.cos(angle)] as const;
const circle = Math.PI * 2;

function arc(radius: number, start: number, size: number) {
  const length = Math.min(size, circle - 0.00001);
  return 'M' + polar(radius, start).join(' ') + ' A' + radius + ' ' + radius +
    ' 0 ' + Number(length > Math.PI) + ' 1 ' + polar(radius, start + length).join(' ');
}

function trace(points: readonly (readonly [number, number])[], curve: PlotProps['curve']) {
  return points.map(([x, y], i) => {
    if (!i) return 'M' + x + ' ' + y;
    const [px, py] = points[i - 1], mid = (px + x) / 2;
    if (curve === 'step') return 'H' + mid + 'V' + y + 'H' + x;
    if (curve === 'smooth') return 'C' + mid + ' ' + py + ' ' + mid + ' ' + y + ' ' + x + ' ' + y;
    return 'L' + x + ' ' + y;
  }).join(' ');
}

function cartesian(props: PlotProps, id: string, active: number | undefined) {
  const { rows, series, kind, stack, horizontal, curve = 'smooth', axes, dots, labels, gradient, colorByRow } = props;
  const ends = rows.map(row => {
    let positive = 0, negative = 0;
    const total = series.reduce((sum, _, j) => sum + Math.abs(finite(row.values[j])), 0);
    return series.map((_, j) => {
      const raw = finite(row.values[j]);
      const n = stack === 'percent' ? raw / (total || 1) * 100 : raw;
      const base = stack ? (n < 0 ? negative : positive) : 0;
      if (n < 0) negative += n; else positive += n;
      return [base, base + n] as const;
    });
  });
  let min = 0, max = 0;
  for (const row of ends) for (const [a, b] of row) {
    min = Math.min(min, a, b);
    max = Math.max(max, a, b);
  }
  const extent = max - min || 1;
  const ticks = [...new Set([min, 0, max])];
  const vertical = (v: number) => 165 - (v - min) / extent * 145;
  const across = (v: number) => 34 + (v - min) / extent * 266;
  const slot = (horizontal ? 145 : 266) / Math.max(1, rows.length);
  const center = (i: number) => (horizontal ? 20 : 34) + (i + .5) * slot;
  const band = slot * .72 / (stack ? 1 : Math.max(1, series.length));
  return <>
    <path stroke="var(--ut-line-2)" d={horizontal ? 'M'+across(0)+' 20v145' : 'M34 '+vertical(0)+'h266'} />
    {axes && <>
      <path d="M34 20v145h266" fill="none" stroke="var(--ut-line-2)" />
      {ticks.map(value => <text key={value} x={horizontal ? across(value) : 29} y={horizontal ? 181 : vertical(value)}
        dy={horizontal ? undefined : '.32em'} textAnchor={horizontal ? 'middle' : 'end'} fontSize="8" fill="var(--ut-ink-2)">
        {props.format ? props.format(value) : value}</text>)}
      {rows.map((row, i) => <text key={i} x={horizontal ? 30 : center(i)} y={horizontal ? center(i) : 184}
        textAnchor={horizontal ? 'end' : 'middle'} fontSize="8" fill="var(--ut-ink-2)">{row.label}</text>)}
    </>}
    {series.map((item, j) => {
      const color = item.color ?? colorAt(j);
      const points = ends.map((row, i) => [center(i), vertical(row[j][1])] as const);
      const path = trace(points, curve);
      const mark = item.mark ?? kind;
      return <g key={j}>
        {gradient && <defs><linearGradient id={id + j} x2="0%" y2="100%"><stop stopColor={color} stopOpacity=".65" /><stop offset="100%" stopColor={color} stopOpacity=".06" /></linearGradient></defs>}
        {mark === 'area' && points.length > 0 && <path d={path + ' ' + trace(ends.map((row, i) => [center(i), vertical(row[j][0])] as const).reverse(), curve).replace(/^M/, 'L') + 'Z'}
          fill={gradient ? 'url(#' + id + j + ')' : color} fillOpacity={gradient ? 1 : .25} />}
        {mark !== 'bar' && <path d={path} fill="none" stroke={color} strokeWidth="2.5" />}
        {rows.map((row, i) => {
          const [base, end] = ends[i][j];
          const cross = center(i) - slot * .36 + (stack ? 0 : j * band);
          const tint = colorByRow ? colorAt(i) : color;
          const [x, y] = points[i];
          return <g key={i} opacity={active !== undefined && active !== i ? .48 : 1}>
            {mark === 'bar' && (horizontal
              ? <rect x={Math.min(across(base), across(end))} y={cross} width={Math.abs(across(base) - across(end))} height={band * .92} rx="1.5" fill={tint} />
              : <rect x={cross} y={Math.min(vertical(base), vertical(end))} width={band * .92} height={Math.abs(vertical(base) - vertical(end))} rx="1.5" fill={tint} />)}
            {mark !== 'bar' && (typeof dots === 'function' ? dots(x, y, i, tint) : (dots || active === i) && <circle cx={x} cy={y} r={active === i ? 4.5 : 3} fill={dots === 'category' ? colorAt(i) : tint} />)}
            {labels && <text x={horizontal ? across(end) : mark === 'bar' ? cross + band / 2 : x}
              y={horizontal ? cross + band * .7 : y - 6} textAnchor={horizontal ? 'start' : 'middle'} fontSize="8" fill="var(--ut-ink)">
              {typeof labels === 'function' ? labels(finite(row.values[j]), row) : finite(row.values[j])}</text>}
          </g>;
        })}
      </g>;
    })}
  </>;
}

function radar(props: PlotProps) {
  const { rows, series, grid = 'polygon', gridFill, spokes = true, outline, dots, labels, axes = true } = props;
  const max = props.max && props.max > 0 ? props.max : rows.reduce((limit, row) => row.values.reduce((m, n) => Math.max(m, finite(n)), limit), 1);
  const point = (i: number, radius: number) => polar(radius, circle * i / rows.length);
  const rings = (props.gridLevels ?? [.25, .5, .75, 1]).filter(level => level > 0 && level <= 1);
  return <>
    {grid !== 'none' && rings.map(level => {
      const fill = gridFill ? 'var(--ut-tint)' : 'none';
      return grid === 'circle'
        ? <circle key={level} cx="160" cy="96" r={70 * level} stroke="var(--ut-line-2)" fill={fill} />
        : <polygon key={level} points={rows.map((_, i) => point(i, 70 * level).join(',')).join(' ')} stroke="var(--ut-line-2)" fill={fill} />;
    })}
    {rows.map((row, i) => {
      const [x, y] = point(i, 70), [lx, ly] = point(i, 88);
      return <g key={i}>
        {spokes && grid !== 'none' && <path d={'M160 96L'+x+' '+y} stroke="var(--ut-line)" />}
        {axes && <text x={lx} y={ly} textAnchor="middle" dy=".32em" fontSize="8" fill="var(--ut-ink)">{typeof labels === 'function' ? labels(finite(row.values[0]), row) : row.label}</text>}
      </g>;
    })}
    {series.map((item, j) => {
      const points = rows.map((row, i) => point(i, 70 * Math.min(1, Math.max(0, finite(row.values[j]) / max))));
      const color = item.color ?? colorAt(j);
      return <g key={j}><polygon points={points.map(p => p.join(',')).join(' ')} fill={outline ? 'none' : color} fillOpacity=".22" stroke={color} strokeWidth="2" />
        {dots && points.map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} />)}</g>;
    })}
  </>;
}

function sectors(props: PlotProps, active: number | undefined) {
  const { rows, series, kind, hollow, separators = true, rounded, labels, center, stack, grid } = props;
  const pie = kind === 'pie';
  const max = props.max && props.max > 0 ? props.max : 100;
  const sweep = Math.min(360, Math.max(0, finite(props.sweep ?? 360))) / 360 * circle;
  return <>
    {(pie ? series : [series[0]]).map((_, j) => {
      const values = rows.map(row => Math.max(0, finite(row.values[j])));
      const total = values.reduce((sum, value) => sum + value, 0);
      let angle = 0;
      const separated = separators && pie && values.filter(Boolean).length > 1;
      return rows.map((row, i) => {
        const thickness = pie ? (series.length === 1 && !hollow ? 80 : Math.min(24, 75 / series.length)) : Math.min(14, 65 / Math.max(1, rows.length));
        const radius = pie ? (series.length === 1 && !hollow ? 40 : 75 - thickness * j) : stack ? 65 : 73 - thickness * i;
        const size = pie ? sweep * values[i] / (total || 1) : sweep * Math.min(stack ? 1 - angle / (sweep || 1) : 1, values[i] / max);
        const start = pie || stack ? angle : 0;
        if (pie || stack) angle += size;
        const gap = separated ? Math.min(.026, size / 3) : 0;
        const [x, y] = polar(pie && !hollow ? 54 : radius, start + size / 2);
        return <g key={i}>
          {!pie && grid && grid !== 'none' && (!stack || i === 0) && sweep > 0 && <path d={arc(radius, 0, sweep)} fill="none" stroke="var(--ut-line-2)" strokeWidth={thickness} />}
          {size > 0 && <path d={arc(radius, start + gap, size - gap * 2)} fill="none" stroke={colorAt(i)} strokeLinecap={rounded ? 'round' : 'butt'}
            strokeWidth={thickness + (active === i ? 4 : 0)} opacity={active !== undefined && active !== i ? .5 : 1} />}
          {labels && size > .18 && <text x={x} y={y} dy=".32em" textAnchor="middle" fontSize="9" paintOrder="stroke" stroke="var(--ut-bg)" strokeWidth="3" fill="var(--ut-ink)">
            {typeof labels === 'function' ? labels(values[i], row) : values[i]}</text>}
        </g>;
      });
    })}
    {center != null && <text x="160" y="96" dy=".32em" textAnchor="middle" fill="var(--ut-ink)" fontSize="14">{center}</text>}
  </>;
}

/** SVG plots with a text data table and an optional keyboard, touch and pointer inspection control. */
export function Plot(props: PlotProps) {
  const { title, rows, series, kind, legend, interactive, horizontal, indicator = 'dot', tooltipTitle, tooltipValue, format = String } = props;
  const id = useId();
  const [picked, setPicked] = useState<number>();
  const [hovered, setHovered] = useState<number>();
  const active = interactive ? hovered ?? picked : undefined;
  const row = active === undefined ? undefined : rows[active];
  const polarPlot = kind === 'pie' || kind === 'radial';
  function hit(x: number, y: number) {
    if (polarPlot) {
      const angle = (Math.atan2(x - 160, 96 - y) + circle) % circle;
      if (kind === 'radial' && !props.stack) {
        const thickness = Math.min(14, 65 / Math.max(1, rows.length));
        return Math.max(0, Math.min(rows.length - 1, Math.round((73 - Math.hypot(x - 160, y - 96)) / thickness)));
      }
      const weights = rows.map(item => Math.max(0, finite(item.values[0])));
      const total = weights.reduce((sum, value) => sum + value, 0);
      const sweep = Math.min(360, Math.max(0, finite(props.sweep ?? 360))) / 360 * circle;
      let end = 0;
      const index = weights.findIndex(value => { end += value / (kind === 'pie' ? total || 1 : props.max || 100) * sweep; return angle < end; });
      return index < 0 ? undefined : index;
    }
    const fraction = kind === 'radar' ? ((Math.atan2(x - 160, 96 - y) / circle + 1 + .5 / rows.length) % 1)
      : horizontal ? (y - 20) / 145 : (x - 34) / 266;
    return Math.max(0, Math.min(rows.length - 1, Math.floor(fraction * rows.length)));
  }
  return <figure className="plot">
    <figcaption>{title}</figcaption>
    {rows.length === 0 || series.length === 0 ? <p>No data</p> : <>
      <svg viewBox="0 0 320 192" aria-hidden="true" className="plot-svg"
        onPointerMove={interactive ? event => {
          if (event.pointerType === 'touch') return;
          const box = event.currentTarget.getBoundingClientRect();
          setHovered(hit((event.clientX - box.left) / box.width * 320, (event.clientY - box.top) / box.height * 192));
        } : undefined}
        onPointerLeave={interactive ? () => setHovered(undefined) : undefined}>
        {polarPlot ? sectors(props, active) : kind === 'radar' ? radar(props) : cartesian(props, id, active)}
      </svg>
      {legend && <ul className="plot-legend">{(polarPlot ? rows : series).map((item, i) => <li key={i}>
        <i aria-hidden="true" style={{ background: polarPlot ? colorAt(i) : series[i].color ?? colorAt(i) }} />{!polarPlot && series[i].icon}{item.label}
      </li>)}</ul>}
      {interactive && <div className="plot-inspect">
        <label>Inspect <select className="select" value={picked ?? ''} onChange={event => setPicked(event.target.value === '' ? undefined : Number(event.target.value))}>
          <option value="">Choose a point</option>{rows.map((item, i) => <option key={i} value={i}>{item.label}</option>)}
        </select></label>
        {row && <div className="plot-tooltip" data-indicator={indicator}>
          {tooltipTitle !== false && <strong>{tooltipTitle ? tooltipTitle(row) : row.label}</strong>}
          {series.map((item, i) => <div key={i}>{indicator !== 'none' && <i aria-hidden="true" style={{ background: item.color ?? colorAt(i) }} />}
            {item.icon}{item.label}<b>{tooltipValue ? tooltipValue(finite(row.values[i]), item) : format(finite(row.values[i]))}</b></div>)}
        </div>}
      </div>}
      <details className="plot-data"><summary>Chart data</summary><div className="table-wrap"><table className="table">
        <thead><tr><th scope="col">Category</th>{series.map((item, i) => <th key={i} scope="col">{item.label}</th>)}</tr></thead>
        <tbody>{rows.map((item, i) => <tr key={i}><th scope="row">{item.label}</th>{series.map((_, j) => <td key={j}>{format(finite(item.values[j]))}</td>)}</tr>)}</tbody>
      </table></div></details>
    </>}
  </figure>;
}
