import {
  forwardRef, Fragment, useRef, useState,
  type CSSProperties, type ForwardedRef, type KeyboardEvent, type ReactElement, type ReactNode, type TableHTMLAttributes,
} from 'react';
import { cx } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';

export type TableRowKey = string | number;

export interface TableColumn<Row> {
  key: Extract<keyof Row, string> | (string & {});
  header: ReactNode;
  sort?: 'none' | 'ascending' | 'descending';
  render?: (row: Row) => ReactNode;
  align?: 'left' | 'center' | 'right';
  num?: boolean;
  label?: string;
  /** Pixel width. Pinned columns default to 160px. */
  width?: number;
  pinned?: 'start' | 'end';
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  editable?: boolean;
  validate?: (value: unknown, row: Row) => string | undefined | Promise<string | undefined>;
  onCellEdit?: (rowKey: TableRowKey, columnKey: string, value: unknown, row: Row) => void | Promise<void>;
}

export interface TableProps<Row> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'caption'> {
  columns: TableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row, index: number) => TableRowKey;
  stack?: boolean;
  density?: 'compact' | 'comfortable';
  stickyHeader?: boolean;
  caption?: ReactNode;
  onRowClick?: (row: Row) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  emptyContent?: ReactNode;
  columnWidths?: Readonly<Record<string, number>>;
  defaultColumnWidths?: Readonly<Record<string, number>>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  renderExpandedRow?: (row: Row) => ReactNode;
  expandedRowKeys?: readonly TableRowKey[];
  defaultExpandedRowKeys?: readonly TableRowKey[];
  onExpandedRowsChange?: (keys: readonly TableRowKey[]) => void;
  virtualize?: { rowHeight: number; height: number; overscan?: number };
  gridNavigation?: boolean;
}

const noExpanded: readonly TableRowKey[] = [];

export const Table = forwardRef(function Table<Row>(
  {
    columns, rows, getRowKey, stack, caption, density, stickyHeader, onRowClick, striped, hoverable = true, bordered, emptyContent,
    columnWidths, defaultColumnWidths = {}, onColumnWidthsChange, renderExpandedRow, expandedRowKeys, defaultExpandedRowKeys = noExpanded,
    onExpandedRowsChange, virtualize, gridNavigation, className, style, ...props
  }: TableProps<Row>,
  ref: ForwardedRef<HTMLTableElement>,
) {
  const [localWidths, setLocalWidths] = useState(defaultColumnWidths);
  const widths = columnWidths ?? localWidths;
  const [expandedKeys, setExpandedKeys] = useControllable(expandedRowKeys, defaultExpandedRowKeys, onExpandedRowsChange);
  const expanded = new Set(expandedKeys);
  const [scrollTop, setScrollTop] = useState(0);
  const [editing, setEditing] = useState<{ rowKey: TableRowKey; columnKey: string; draft: string; error?: string; saving?: boolean } | null>(null);
  const [focusCell, setFocusCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const widthOf = (column: TableColumn<Row>) => widths[column.key] ?? column.width ?? (column.pinned || column.resizable ? 160 : undefined);
  const alignment = (column: TableColumn<Row>) => cx((column.num || column.align === 'right') && 'num', column.align === 'center' && 'cell-center');
  const columnStyle = (column: TableColumn<Row>, index: number): CSSProperties => {
    const width = widthOf(column);
    const peers = column.pinned === 'start' ? columns.slice(0, index) : columns.slice(index + 1);
    const offset = peers.filter(item => item.pinned === column.pinned).reduce((sum, item) => sum + (widthOf(item) ?? 160), 0);
    return {
      width,
      minWidth: width,
      ...(column.pinned ? { position: 'sticky', [column.pinned === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: offset, zIndex: 1, background: 'var(--ut-bg-2)' } : {}),
    };
  };

  const overscan = virtualize?.overscan ?? 4;
  const startIndex = virtualize ? Math.max(0, Math.floor(scrollTop / virtualize.rowHeight) - overscan) : 0;
  const visibleCount = virtualize ? Math.ceil(virtualize.height / virtualize.rowHeight) + overscan * 2 : rows.length;
  const endIndex = virtualize ? Math.min(rows.length, startIndex + visibleCount) : rows.length;
  const renderedRows = virtualize ? rows.slice(startIndex, endIndex) : rows;
  const topSpace = virtualize ? startIndex * virtualize.rowHeight : 0;
  const bottomSpace = virtualize ? Math.max(0, (rows.length - endIndex) * virtualize.rowHeight) : 0;
  const totalCols = columns.length + (renderExpandedRow ? 1 : 0);

  function toggleExpand(key: TableRowKey) {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedKeys([...next]);
  }

  async function commitEdit(column: TableColumn<Row>, row: Row, rowKey: TableRowKey) {
    if (!editing || editing.rowKey !== rowKey || editing.columnKey !== column.key || editing.saving) return;
    const draft = editing.draft;
    setEditing(prev => prev ? { ...prev, saving: true, error: undefined } : prev);
    try {
      const error = await column.validate?.(draft, row);
      if (error) {
        setEditing(prev => prev ? { ...prev, saving: false, error } : prev);
        return;
      }
      await column.onCellEdit?.(rowKey, column.key, draft, row);
      setEditing(null);
    } catch (err) {
      setEditing(prev => prev ? { ...prev, saving: false, error: err instanceof Error ? err.message : 'Validation failed' } : prev);
    }
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLTableCellElement>, rowIdx: number, colIdx: number, column: TableColumn<Row>, row: Row, rowKey: TableRowKey) {
    if (column.editable && (event.key === 'F2' || (event.key === 'Enter' && !editing))) {
      event.preventDefault();
      setEditing({ rowKey, columnKey: column.key, draft: String(row[column.key as keyof Row] ?? '') });
      return;
    }
    if (!gridNavigation) return;
    let nextRow = rowIdx;
    let nextCol = colIdx;
    if (event.key === 'ArrowRight') nextCol = Math.min(columns.length - 1, colIdx + 1);
    else if (event.key === 'ArrowLeft') nextCol = Math.max(0, colIdx - 1);
    else if (event.key === 'ArrowDown') nextRow = Math.min(rows.length - 1, rowIdx + 1);
    else if (event.key === 'ArrowUp') nextRow = Math.max(0, rowIdx - 1);
    else if (event.key === 'Home') nextCol = 0;
    else if (event.key === 'End') nextCol = columns.length - 1;
    else return;
    event.preventDefault();
    setFocusCell({ row: nextRow, col: nextCol });
    wrapRef.current?.querySelector<HTMLElement>(`[data-grid-cell="${nextRow}:${nextCol}"]`)?.focus();
  }

  // Keep the scrolling region reachable by keyboard.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return <div ref={wrapRef} className="table-wrap" tabIndex={0} role="region" aria-label={typeof caption === 'string' ? caption : 'Scrollable table'}
    data-ut-slot="table-scroll" data-sticky-header={stickyHeader || virtualize ? 'true' : undefined}
    style={virtualize ? { maxHeight: virtualize.height, overflowY: 'auto' } : undefined}
    onScroll={virtualize ? (event) => setScrollTop(event.currentTarget.scrollTop) : undefined}>
    <table {...props} ref={ref} role={gridNavigation ? 'grid' : props.role}
      aria-rowcount={virtualize ? rows.length : props['aria-rowcount']}
      data-ut-slot="table" data-density={density} data-striped={striped || undefined} data-hoverable={hoverable} data-bordered={bordered || undefined}
      className={cx('table', stack && 'table-stack', className)} style={style}>
      {caption != null && <caption>{caption}</caption>}
      <thead><tr>
        {renderExpandedRow && <th scope="col" className="table-expand-col"><span className="ut-sr-only">Expand row</span></th>}
        {columns.map((column, index) => <th key={column.key} scope="col" style={columnStyle(column, index)} data-ut-slot="table-header" aria-sort={column.sort} className={alignment(column)}>
          {column.header}
          {column.resizable && <input className="table-column-width" type="range"
            aria-label={'Resize ' + (typeof column.header === 'string' ? column.header : column.label ?? column.key)}
            min={column.minWidth ?? 64} max={column.maxWidth ?? 600} value={widthOf(column)} onChange={event => {
              const next = { ...widths, [column.key]: Number(event.target.value) };
              if (columnWidths === undefined) setLocalWidths(next);
              onColumnWidthsChange?.(next);
            }} />}
        </th>)}
      </tr></thead>
      <tbody>
        {!rows.length && emptyContent != null && <tr><td colSpan={Math.max(1, totalCols)}>{emptyContent}</td></tr>}
        {topSpace > 0 && <tr aria-hidden="true" className="table-spacer"><td colSpan={totalCols} style={{ height: topSpace, padding: 0, border: 0 }} /></tr>}
        {renderedRows.map((row, sliceIndex) => {
          const index = startIndex + sliceIndex;
          const rowKey = getRowKey(row, index);
          const isExpanded = renderExpandedRow ? expanded.has(rowKey) : false;
          return <Fragment key={rowKey}>
            <tr data-ut-slot="table-row" aria-rowindex={virtualize ? index + 1 : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? (event) => {
                if (event.defaultPrevented || !(event.target instanceof Element) || !event.currentTarget.contains(event.target)) return;
                const control = event.target.closest(
                  'a[href], button, input, select, textarea, label, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [data-ut-row-action]',
                );
                if (!control || !event.currentTarget.contains(control)) onRowClick(row);
              } : undefined}
              onKeyDown={onRowClick ? (event) => {
                if (event.key === 'Enter' && event.target === event.currentTarget) onRowClick(row);
              } : undefined}>
              {renderExpandedRow && <td className="table-expand-cell">
                <button type="button" className="btn btn-sm btn-plain table-expand-btn" aria-expanded={isExpanded}
                  aria-label={isExpanded ? `Collapse row ${rowKey}` : `Expand row ${rowKey}`}
                  onClick={() => toggleExpand(rowKey)}>
                  <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
                </button>
              </td>}
              {columns.map((column, colIndex) => {
                const isEditing = editing?.rowKey === rowKey && editing.columnKey === column.key;
                const cellTab = gridNavigation ? (focusCell.row === index && focusCell.col === colIndex ? 0 : -1) : undefined;
                return <td key={column.key} data-ut-slot="table-cell" role={gridNavigation ? 'gridcell' : undefined}
                  data-grid-cell={gridNavigation ? `${index}:${colIndex}` : undefined}
                  tabIndex={cellTab} style={columnStyle(column, colIndex)} className={alignment(column)}
                  data-label={stack ? column.label ?? (typeof column.header === 'string' ? column.header : column.key) : undefined}
                  onDoubleClick={column.editable ? () => setEditing({ rowKey, columnKey: column.key, draft: String(row[column.key as keyof Row] ?? '') }) : undefined}
                  onKeyDown={(event) => handleCellKeyDown(event, index, colIndex, column, row, rowKey)}>
                  {isEditing ? <div className="table-cell-editor">
                    <input className="input table-cell-input" ref={(node) => { if (node && document.activeElement !== node) node.focus(); }} aria-label={`Edit ${column.label ?? (typeof column.header === 'string' ? column.header : column.key)}`}
                      aria-invalid={editing.error ? true : undefined}
                      value={editing.draft}
                      onChange={event => setEditing(prev => prev ? { ...prev, draft: event.target.value, error: undefined } : prev)}
                      onKeyDown={event => {
                        event.stopPropagation();
                        if (event.key === 'Enter') { event.preventDefault(); void commitEdit(column, row, rowKey); }
                        else if (event.key === 'Escape') { event.preventDefault(); setEditing(null); }
                      }}
                      onBlur={() => { void commitEdit(column, row, rowKey); }} />
                    {editing.error && <span role="alert" className="field-error">{editing.error}</span>}
                  </div> : (column.render ? column.render(row) : String(row[column.key as keyof Row] ?? ''))}
                </td>;
              })}
            </tr>
            {isExpanded && renderExpandedRow && <tr className="table-expanded-row">
              <td colSpan={totalCols}>{renderExpandedRow(row)}</td>
            </tr>}
          </Fragment>;
        })}
        {bottomSpace > 0 && <tr aria-hidden="true" className="table-spacer"><td colSpan={totalCols} style={{ height: bottomSpace, padding: 0, border: 0 }} /></tr>}
      </tbody>
    </table>
  </div>;
}) as <Row>(props: TableProps<Row> & { ref?: ForwardedRef<HTMLTableElement> }) => ReactElement;
