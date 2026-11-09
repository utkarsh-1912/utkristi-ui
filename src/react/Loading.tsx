import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Skeleton } from './Skeleton.js';
import { Spinner } from './Spinner.js';
import { cx, type CSSVariables } from './utils/cx.js';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label = 'Progress', className, style, ...props }, ref,
) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const amount = value !== undefined && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : undefined;
  return <div {...props} ref={ref} className={cx('progress', className)} role="progressbar"
    aria-label={props['aria-label'] ?? label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={amount}
    data-indeterminate={amount === undefined || undefined}
    style={{ ...style, '--ut-progress': amount === undefined ? undefined : amount / limit } as CSSVariables}>
    <span className="progress-fill" />
  </div>;
});

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: 'spinner' | 'skeleton' | 'progress';
  value?: number;
  children?: ReactNode;
}

export const Loader = forwardRef<HTMLDivElement, LoaderProps>(function Loader(
  { label = 'Loading', variant = 'spinner', value, children, className, ...props }, ref,
) {
  return <div {...props} ref={ref} className={cx('loader', variant === 'spinner' && 'loader-inline', className)}
    role={variant === 'progress' ? undefined : 'status'}>
    {variant === 'spinner' && <Spinner aria-hidden="true" />}
    <span className="loader-label">{label}</span>
    {variant === 'skeleton' && (children ?? <div className="loader-skeleton">
      <Skeleton variant="text" /><Skeleton variant="text" width="64%" />
    </div>)}
    {variant === 'progress' && <Progress value={value} label={label} />}
  </div>;
});
