import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { Code } from './Code.js';
import { SearchInput } from './Field.js';
import { Pagination } from './Layout.js';
import { Table, type TableColumn, type TableProps } from './Table.js';
import { cx, type CSSVariables } from './utils/cx.js';

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string; language?: string; lineNumbers?: boolean; copy?: boolean;
  renderLine?: (line: string, index: number) => ReactNode;
}
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, language, title, lineNumbers, copy = true, renderLine, className, ...props }, ref,
) {
  const [feedback, setFeedback] = useState<{ code: string; message: string }>();
  const status = feedback?.code === code ? feedback.message : '';
  const lines = code.split(/\r?\n/);
  return <div {...props} ref={ref} className={cx('code-block', className)}>
    {(copy || title || language) && <div className="code-block-head">
      <span className="label">{title ?? language ?? 'Code'}</span>
      {copy && <Button size="sm" variant="ghost" onClick={async () => {
        try { await navigator.clipboard.writeText(code); setFeedback({ code, message: 'Copied' }); }
        catch { setFeedback({ code, message: 'Copy failed' }); }
      }}>{status || 'Copy'}</Button>}
      <span className="ut-sr-only" role="status">{status}</span>
    </div>}
    <Code lines={lineNumbers || renderLine ? lines.map((line, index) => renderLine?.(line, index) ?? line) : undefined}
      className={!lineNumbers && renderLine ? 'code-no-gutter' : undefined}>{code}</Code>
  </div>;
});

export interface ChartDatum { id?: string; label: string; value: number }
export interface ChartProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string; data: readonly ChartDatum[]; variant?: 'bar' | 'line'; format?: (value: number) => string;
}
export const Chart = forwardRef<HTMLElement, ChartProps>(function Chart(
  { title, data, variant = 'bar', format = String, className, ...props }, ref,
) {
  const values = data.map((datum) => Number.isFinite(datum.value) ? datum.value : 0);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const extent = max - min || 1;
  const baseline = (max - 0) / extent;
  const points = values.map((value, index) => ({
    x: 12 + 296 * (values.length === 1 ? .5 : index / Math.max(1, values.length - 1)),
    y: 12 + (max - value) / extent * 116,
  }));
  return <figure {...props} ref={ref} className={cx('chart', className)}>
    <figcaption>{title}</figcaption>
    {variant === 'line' && <svg className="chart-line" viewBox="0 0 320 140" aria-hidden="true">
      <path d={`M12 ${12 + baseline * 116}H308`} className="chart-axis" />
      <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
      {points.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r="4" />)}
    </svg>}
    <dl className="chart-values" data-variant={variant}>
      {data.map(({ id, label }, index) => {
        const value = values[index];
        return <div key={id ?? index} className="chart-entry">
          <dt>{label}</dt><dd>{format(value)}</dd>
          {variant === 'bar' && <dd className="chart-track" aria-hidden="true">
            <span style={{ '--ut-bar-start': `${Math.min(-min / extent, (value - min) / extent) * 100}%`,
              '--ut-bar-size': `${Math.abs(value) / extent * 100}%` } as CSSVariables} />
          </dd>}
        </div>;
      })}
    </dl>
  </figure>;
});

export interface DataColumn<Row> extends TableColumn<Row> {
  sortValue?: (row: Row) => string | number;
  filterValue?: (row: Row) => string;
}
export interface DataTableProps<Row> extends Omit<TableProps<Row>, 'columns'> {
  columns: DataColumn<Row>[]; pageSize?: number; searchLabel?: string;
}

export function DataTable<Row>({ columns, rows, pageSize = 10, searchLabel = 'Filter rows', className, ...props }: DataTableProps<Row>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; descending: boolean }>();
  const column = columns.find(({ key }) => key === sort?.key);
  const filter = query.trim().toLocaleLowerCase();
  const visible = rows.filter((row) => !filter || columns.some((entry) => {
    const value = entry.filterValue?.(row) ?? entry.sortValue?.(row) ?? row[entry.key as keyof Row];
    return String(value ?? '').toLocaleLowerCase().includes(filter);
  }));
  const accessor = column?.sortValue;
  if (accessor) visible.sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    const order = typeof left === 'number' && typeof right === 'number' ? left - right
      : String(left).localeCompare(String(right), undefined, { numeric: true });
    return sort?.descending ? -order : order;
  });
  const limit = Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 10);
  const count = Math.max(1, Math.ceil(visible.length / limit));
  const current = Math.min(page, count);
  const prepared = columns.map((entry): TableColumn<Row> => {
    if (!entry.sortValue) return entry;
    const state = sort?.key === entry.key ? sort.descending ? 'descending' : 'ascending' : 'none';
    return { ...entry, sort: state, header: <button type="button" className="data-sort"
      onClick={() => { setSort({ key: entry.key, descending: state === 'ascending' }); setPage(1); }}>
      {entry.header}<span aria-hidden="true">{state === 'ascending' ? '↑' : state === 'descending' ? '↓' : '↕'}</span>
    </button> };
  });
  return <div className={cx('data-table', className)}>
    <SearchInput aria-label={searchLabel} placeholder={searchLabel} value={query}
      onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
    <Table {...props} columns={prepared} rows={visible.slice((current - 1) * limit, current * limit)} />
    {visible.length === 0 && <p role="status" className="muted">No matching rows.</p>}
    {count > 1 && <Pagination page={current} totalPages={count} onPageChange={setPage} />}
  </div>;
}
