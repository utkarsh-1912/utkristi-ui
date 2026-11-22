'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { Button } from './Button.js';
import { cx } from './utils/cx.js';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels?: { navigation?: string; previous?: string; next?: string; page?: (page: number) => string };
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, totalPages, onPageChange, labels, className, ...props }, ref,
) {
  const count = Math.max(1, Number.isFinite(totalPages) ? Math.floor(totalPages) : 1);
  const current = Math.min(count, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
  const pages = [...new Set([1, current - 1, current, current + 1, count].filter((value) => value >= 1 && value <= count))].sort((a, b) => a - b);
  return <nav aria-label={labels?.navigation ?? 'Pagination'} {...props} ref={ref} className={cx('pagination', className)}>
    <Button size="sm" variant="ghost" disabled={current === 1} onClick={() => onPageChange(current - 1)} aria-label={labels?.previous ?? 'Previous page'}>‹</Button>
    {pages.map((value, index) => <span className="pagination-entry" key={value}>
      {index > 0 && value > pages[index - 1] + 1 && <span aria-hidden="true">…</span>}
      <Button size="sm" variant={current === value ? 'solid' : 'plain'} aria-current={current === value ? 'page' : undefined}
        aria-label={labels?.page?.(value) ?? `Page ${value}`} onClick={() => { if (current !== value) onPageChange(value); }}>{value}</Button>
    </span>)}
    <Button size="sm" variant="ghost" disabled={current === count} onClick={() => onPageChange(current + 1)} aria-label={labels?.next ?? 'Next page'}>›</Button>
  </nav>;
});
