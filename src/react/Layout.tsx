import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';
import { Button } from './Button.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export const Alert = forwardRef<HTMLDivElement, DivProps & {
  title: string; tone?: 'neutral' | 'ok' | 'warn' | 'bad'; icon?: ReactNode;
}>(function Alert({ title, tone = 'neutral', icon, children, className, ...props }, ref) {
  return <div role={tone === 'bad' ? 'alert' : 'status'} {...props} ref={ref} className={cx('alert', className)} data-tone={tone}>
    {icon && <span className="alert-icon" aria-hidden="true">{icon}</span>}
    <div><strong>{title}</strong>{children != null && <div className="alert-description">{children}</div>}</div>
  </div>;
});

export const AspectRatio = forwardRef<HTMLDivElement, DivProps & { ratio?: number }>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...props }, ref,
) {
  return <div {...props} ref={ref} className={cx('aspect-ratio', className)}
    style={{ ...style, '--ut-ratio': Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9 } as CSSVariables} />;
});

export const Direction = forwardRef<HTMLDivElement, DivProps & { dir: 'ltr' | 'rtl' }>(function Direction(props, ref) {
  return <div {...props} ref={ref} />;
});

export const Separator = forwardRef<HTMLDivElement, DivProps & {
  decorative?: boolean; orientation?: 'horizontal' | 'vertical';
}>(function Separator({ decorative = true, orientation = 'horizontal', className, ...props }, ref) {
  return <div {...props} ref={ref} role={decorative ? 'none' : 'separator'}
    aria-orientation={decorative ? undefined : orientation} data-orientation={orientation} className={cx('separator', className)} />;
});

export const ScrollArea = forwardRef<HTMLDivElement, DivProps & {
  orientation?: 'horizontal' | 'vertical' | 'both';
}>(function ScrollArea({ orientation = 'vertical', className, ...props }, ref) {
  // A keyboard tab stop is needed for scroll regions without interactive descendants.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return <div role="region" aria-label="Scrollable content" tabIndex={0} {...props} ref={ref} className={cx('scroll-area', className)} data-orientation={orientation} />;
});

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function Label({ className, htmlFor, children, ...props }, ref) {
  return <label {...props} ref={ref} htmlFor={htmlFor} className={cx('field-label', className)}>{children}</label>;
});

export const Marker = forwardRef<HTMLDivElement, DivProps & {
  variant?: 'default' | 'border' | 'separator'; icon?: ReactNode;
}>(function Marker({ variant = 'default', icon, className, children, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('marker', className)} data-variant={variant}>
    {icon && <span aria-hidden="true">{icon}</span>}<span>{children}</span>
  </div>;
});

export const Item = forwardRef<HTMLDivElement, Omit<DivProps, 'title'> & {
  title: ReactNode; description?: ReactNode; leading?: ReactNode; actions?: ReactNode;
}>(function Item({ title, description, leading, actions, children, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('item', className)}>
    {leading && <div className="item-leading">{leading}</div>}
    <div className="item-content"><strong>{title}</strong>{description && <div className="muted">{description}</div>}{children}</div>
    {actions && <div className="item-actions">{actions}</div>}
  </div>;
});

export const Attachment = forwardRef<HTMLDivElement, DivProps & {
  name: string; href?: string; detail?: string; onRemove?: () => void;
}>(function Attachment({ name, href, detail, onRemove, className, ...props }, ref) {
  return <Item {...props} ref={ref} className={cx('attachment', className)}
    title={href ? <a className="link" href={href} download>{name}</a> : name} description={detail}
    actions={onRemove && <Button size="sm" variant="quiet" aria-label={`Remove ${name}`} onClick={onRemove}>×</Button>} />;
});

export const ButtonGroup = forwardRef<HTMLDivElement, DivProps & {
  orientation?: 'horizontal' | 'vertical';
}>(function ButtonGroup({ orientation = 'horizontal', className, ...props }, ref) {
  return <div role="group" {...props} ref={ref} data-orientation={orientation} className={cx('button-group', className)} />;
});

export interface BreadcrumbItem { label: ReactNode; href?: string; key?: string }
export const Breadcrumb = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & {
  items: readonly BreadcrumbItem[];
}>(function Breadcrumb({ items, className, ...props }, ref) {
  return <nav aria-label="Breadcrumb" {...props} ref={ref} className={cx('breadcrumb', className)}>
    <ol>{items.map(({ label, href, key }, index) => <li key={key ?? href ?? index}>
      {index > 0 && <span aria-hidden="true" className="breadcrumb-divider">/</span>}
      {index === items.length - 1 ? <span aria-current="page">{label}</span> : href ? <a href={href} className="link">{label}</a> : <span>{label}</span>}
    </li>)}</ol>
  </nav>;
});

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, totalPages, onPageChange, className, ...props }, ref,
) {
  const count = Math.max(1, Number.isFinite(totalPages) ? Math.floor(totalPages) : 1);
  const current = Math.min(count, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
  const pages = [...new Set([1, current - 1, current, current + 1, count].filter((value) => value >= 1 && value <= count))].sort((a, b) => a - b);
  return <nav aria-label="Pagination" {...props} ref={ref} className={cx('pagination', className)}>
    <Button size="sm" variant="ghost" disabled={current === 1} onClick={() => onPageChange(current - 1)} aria-label="Previous page">‹</Button>
    {pages.map((value, index) => <span className="pagination-entry" key={value}>
      {index > 0 && value > pages[index - 1] + 1 && <span aria-hidden="true">…</span>}
      <Button size="sm" variant={current === value ? 'solid' : 'plain'} aria-current={current === value ? 'page' : undefined}
        aria-label={`Page ${value}`} onClick={() => { if (current !== value) onPageChange(value); }}>{value}</Button>
    </span>)}
    <Button size="sm" variant="ghost" disabled={current === count} onClick={() => onPageChange(current + 1)} aria-label="Next page">›</Button>
  </nav>;
});

export const Sidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & {
  heading?: ReactNode; collapsed?: boolean;
}>(function Sidebar({ heading, collapsed, className, children, ...props }, ref) {
  return <aside {...props} ref={ref} className={cx('sidebar', className)} data-collapsed={collapsed || undefined}>
    {heading != null && <div className="sidebar-heading">{heading}</div>}
    <div className="sidebar-content" hidden={collapsed}>{children}</div>
  </aside>;
});
