import { forwardRef, type ForwardedRef, type ReactElement, type ReactNode, type TableHTMLAttributes } from 'react';
import { cx } from './utils/cx.js';

export interface TableColumn<Row> {
  key: Extract<keyof Row, string> | (string & {});
  header: ReactNode;
  sort?: 'none' | 'ascending' | 'descending';
  render?: (row: Row) => ReactNode;
  align?: 'left' | 'center' | 'right';
  num?: boolean;
  label?: string;
}
export interface TableProps<Row> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'caption'> {
  columns: TableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row, index: number) => string | number;
  stack?: boolean;
  density?: 'compact' | 'comfortable';
  stickyHeader?: boolean;
  caption?: ReactNode;
  onRowClick?: (row: Row) => void;
}

export const Table = forwardRef(function Table<Row>(
  { columns, rows, getRowKey, stack, caption, density, stickyHeader, onRowClick, className, ...props }: TableProps<Row>, ref: ForwardedRef<HTMLTableElement>,
) {
  const alignment = (column: TableColumn<Row>) => cx((column.num || column.align === 'right') && 'num', column.align === 'center' && 'cell-center');
  // Keep the scrolling region reachable by keyboard.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return <div className="table-wrap" tabIndex={0} role="region" aria-label={typeof caption === 'string' ? caption : 'Scrollable table'}
    data-ut-slot="table-scroll" data-sticky-header={stickyHeader || undefined}>
    <table {...props} ref={ref} data-ut-slot="table" data-density={density} className={cx('table', stack && 'table-stack', className)}>
      {caption != null && <caption>{caption}</caption>}
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" data-ut-slot="table-header" aria-sort={column.sort} className={alignment(column)}>{column.header}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={getRowKey(row, index)} data-ut-slot="table-row" tabIndex={onRowClick ? 0 : undefined}
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
        {columns.map((column) => <td key={column.key} data-ut-slot="table-cell" className={alignment(column)}
          data-label={stack ? column.label ?? (typeof column.header === 'string' ? column.header : column.key) : undefined}>
          {column.render ? column.render(row) : String(row[column.key as keyof Row] ?? '')}
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}) as <Row>(props: TableProps<Row> & { ref?: ForwardedRef<HTMLTableElement> }) => ReactElement;
