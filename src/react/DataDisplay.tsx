import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { Checkbox } from './Choice.js';
import { Code } from './Code.js';
import { SearchInput } from './Field.js';
import { Icon } from './icons.js';
import { Pagination } from './Layout.js';
import { Table, type TableColumn, type TableProps } from './Table.js';
import { cx, type CSSVariables } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string; language?: string; lineNumbers?: boolean; copy?: boolean;
  renderLine?: (line: string, index: number) => ReactNode;
}
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, language, title, lineNumbers, copy = true, renderLine, className, ...props }, ref,
) {
  const [feedback, setFeedback] = useState<{ code: string; message: string }>();
  const status = feedback?.code === code ? feedback.message : '';
  const source = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(undefined), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  const lines = code.split(/\r?\n/);
  return <div {...props} ref={ref} className={cx('code-block', className)}>
    {(copy || title || language) && <div className="code-block-head">
      <span className="label">{title ?? language ?? 'Code'}</span>
      {copy && <Button size="sm" variant="quiet" className="code-block-copy" data-copied={status === 'Copied' || undefined}
        iconLeft={<Icon name={status === 'Copied' ? 'check' : 'copy'} size={15} />} onClick={async () => {
        try { await navigator.clipboard.writeText(code); setFeedback({ code, message: 'Copied' }); }
        catch {
          setFeedback({ code, message: 'Could not copy. Select and copy the source manually.' });
          if (!source.current) return;
          const range = document.createRange();
          range.selectNodeContents(source.current);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
      }}>{status === 'Copied' ? 'Copied' : status ? 'Retry copy' : 'Copy'}</Button>}
      {copy && <span className="ut-sr-only" role="status">{status}</span>}
    </div>}
    <Code ref={source} lines={lineNumbers || renderLine ? lines.map((line, index) => renderLine?.(line, index) ?? line) : undefined}
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
  /** Enables server sorting without requiring a local value accessor. */
  sortable?: boolean;
}

export type DataTableRowKey = ReturnType<TableProps<unknown>['getRowKey']>;

export interface DataTableSelection<Row> {
  /** Pass stable row keys here to control selection from your app. */
  selectedKeys?: readonly DataTableRowKey[];
  defaultSelectedKeys?: readonly DataTableRowKey[];
  onSelectionChange?: (keys: readonly DataTableRowKey[]) => void;
  isRowSelectable?: (row: Row) => boolean;
  getRowCheckboxLabel?: (row: Row, key: DataTableRowKey) => string;
  /** Label for the checkbox that changes selection on the current page. */
  selectPageLabel?: string;
}

export interface DataTableState {
  query: string;
  /** One-based page index. */
  page: number;
  sort?: { key: string; descending: boolean };
}

export interface DataTableRemote {
  state: DataTableState;
  onStateChange: (state: DataTableState) => void;
  /** Total matching rows across all pages. Keep the last known count during a request. */
  totalRows: number;
  status?: 'idle' | 'loading' | 'refreshing' | 'error';
  error?: ReactNode;
  onRetry?: () => void;
}

export interface DataTableProps<Row> extends Omit<TableProps<Row>, 'columns'> {
  columns: DataColumn<Row>[]; pageSize?: number; searchLabel?: string;
  /** Enables row and current-page selection. Use stable, unique keys from the data. */
  selection?: DataTableSelection<Row>;
  /** Treats rows as an already filtered, ordered, and paginated result. */
  remote?: DataTableRemote;
}

const noSelection: readonly DataTableRowKey[] = [];

export function DataTable<Row>({ columns, rows, getRowKey, onRowClick, pageSize = 10,
  searchLabel = 'Filter rows', selection, remote, className, ...props }: DataTableProps<Row>) {
  const [local, setLocal] = useState<DataTableState>({ query: '', page: 1 });
  const state = remote?.state ?? local;
  const { query, page, sort } = state;
  const update = remote?.onStateChange ?? setLocal;
  const isRemote = remote !== undefined;
  const [selectedKeys, setSelectedKeys] = useControllable(selection?.selectedKeys,
    selection?.defaultSelectedKeys ?? noSelection, selection?.onSelectionChange);
  const selected = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const visible = useMemo(() => {
    if (isRemote) return rows.map((row, index) => ({ row, index }));
    const column = columns.find(({ key }) => key === sort?.key);
    const filter = query.trim().toLocaleLowerCase();
    const accessor = column?.sortValue;
    const matching: { row: Row; index: number; sortKey?: string | number }[] = [];
    rows.forEach((row, index) => {
      if (!filter || columns.some((entry) => {
        const value = entry.filterValue?.(row) ?? entry.sortValue?.(row) ?? row[entry.key as keyof Row];
        return String(value ?? '').toLocaleLowerCase().includes(filter);
      })) matching.push({ row, index, sortKey: accessor?.(row) });
    });
    if (accessor) {
      const collator = new Intl.Collator(undefined, { numeric: true });
      matching.sort(({ sortKey: left }, { sortKey: right }) => {
        const order = typeof left === 'number' && typeof right === 'number' ? left - right
          : collator.compare(String(left), String(right));
        return sort?.descending ? -order : order;
      });
    }
    return matching;
  }, [columns, isRemote, query, rows, sort]);
  const limit = Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 10);
  const count = Math.max(1, Math.ceil((remote?.totalRows ?? visible.length) / limit));
  const current = Math.min(Math.max(page, 1), count);
  const busy = remote?.status === 'loading' || remote?.status === 'refreshing';
  const pageRows = (isRemote ? visible : visible.slice((current - 1) * limit, current * limit)).map(({ row, index }) => ({
    row, key: getRowKey(row, index), selectable: !busy && (selection ? selection.isRowSelectable?.(row) ?? true : false),
  }));
  const prepared = columns.map((entry): TableColumn<typeof pageRows[number]> => {
    const cell = { ...entry, render: ({ row }: typeof pageRows[number]) => entry.render
      ? entry.render(row) : String(row[entry.key as keyof Row] ?? '') };
    if (isRemote ? !(entry.sortable ?? Boolean(entry.sortValue)) : !entry.sortValue) return cell;
    const direction = sort?.key === entry.key ? sort.descending ? 'descending' : 'ascending' : undefined;
    return { ...cell, label: entry.label ?? (typeof entry.header === 'string' ? entry.header : undefined), sort: direction,
      header: <button type="button" className="data-sort"
      onClick={() => update({ ...state, sort: { key: entry.key, descending: direction === 'ascending' }, page: 1 })}>
      {entry.header}<span aria-hidden="true">{direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}</span>
    </button> };
  });
  let pageCheckbox: ReactNode;
  if (selection) {
    const keys = pageRows.filter(({ selectable }) => selectable).map(({ key }) => key);
    const selectedCount = keys.filter((key) => selected.has(key)).length;
    const all = keys.length > 0 && selectedCount === keys.length;
    const partial = selectedCount > 0 && !all;
    const toggle = (target: readonly DataTableRowKey[], checked: boolean) => {
      const next = new Set(selected);
      target.forEach((key) => { if (checked) next.add(key); else next.delete(key); });
      setSelectedKeys([...next]);
    };
    let key = '__selection';
    while (columns.some((column) => column.key === key)) key += '_';
    pageCheckbox = <Checkbox label={selection.selectPageLabel ?? 'Select all on this page'}
      disabled={!keys.length} checked={all} indeterminate={partial} onChange={(event) => {
        // Native activation clears the mixed state even if a controlled update is declined.
        event.currentTarget.indeterminate = partial;
        toggle(keys, event.currentTarget.checked);
      }} />;
    prepared.unshift({ key, label: '', align: 'center',
      header: <span className="ut-sr-only">Selection</span>,
      render: ({ row, key: rowKey, selectable }) => <Checkbox
        aria-label={selection.getRowCheckboxLabel?.(row, rowKey) ?? `Select row ${rowKey}`}
        checked={selected.has(rowKey)} disabled={!selectable} onClick={(event) => event.stopPropagation()}
        onChange={(event) => toggle([rowKey], event.currentTarget.checked)} />,
    });
  }
  const search = <SearchInput aria-label={searchLabel} placeholder={searchLabel} value={query}
    onChange={(event) => update({ ...state, query: event.target.value, page: 1 })} />;
  return <div className={cx('data-table', className)}>
    {selection ? <div className="data-table-controls">{search}{pageCheckbox}</div> : search}
    {busy && <p role="status" className="muted data-table-status">
      {remote.status === 'loading' ? 'Loading rows…' : 'Updating rows…'}
    </p>}
    {remote?.status === 'error' && <div className="data-table-status">
      <p role="alert">{remote.error ?? 'Could not load rows.'}</p>
      {remote.onRetry && <button type="button" className="btn btn-sm" onClick={remote.onRetry}>Retry</button>}
    </div>}
    <Table {...props} aria-busy={isRemote ? busy : props['aria-busy']} columns={prepared} rows={pageRows} getRowKey={({ key }) => `${typeof key}:${key}`}
      onRowClick={onRowClick && (({ row }) => onRowClick(row))} />
    {visible.length === 0 && !busy && remote?.status !== 'error' && <p role="status" className="muted">No matching rows.</p>}
    {count > 1 && <Pagination page={current} totalPages={count} onPageChange={(page) => update({ ...state, page })} />}
  </div>;
}
