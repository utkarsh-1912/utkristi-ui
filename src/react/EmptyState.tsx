import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx.js';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({ title, action, children, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('empty-state', className)}>
    <h2 className="display empty-state-title">{title}</h2>
    {children}{action}
  </div>;
});
