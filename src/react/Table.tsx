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
  caption?: ReactNode;
  onRowClick?: (row: Row) => void;
}

export const Table = forwardRef(function Table<Row>(
  { columns, rows, getRowKey, stack, caption, onRowClick, className, ...props }: TableProps<Row>, ref: ForwardedRef<HTMLTableElement>,
) {
  const alignment = (column: TableColumn<Row>) => cx((column.num || column.align === 'right') && 'num', column.align === 'center' && 'cell-center');
  return <div className="table-wrap">
    <table {...props} ref={ref} className={cx('table', stack && 'table-stack', className)}>
      {caption != null && <caption>{caption}</caption>}
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" aria-sort={column.sort} className={alignment(column)}>{column.header}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={getRowKey(row, index)} tabIndex={onRowClick ? 0 : undefined}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        onKeyDown={onRowClick ? (event) => {
          if (event.key === 'Enter' && event.target === event.currentTarget) onRowClick(row);
        } : undefined}>
        {columns.map((column) => <td key={column.key} className={alignment(column)}
          data-label={stack ? column.label ?? (typeof column.header === 'string' ? column.header : column.key) : undefined}>
          {column.render ? column.render(row) : String(row[column.key as keyof Row] ?? '')}
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}) as <Row>(props: TableProps<Row> & { ref?: ForwardedRef<HTMLTableElement> }) => ReactElement;
