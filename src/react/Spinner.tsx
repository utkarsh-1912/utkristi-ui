import { forwardRef, type HTMLAttributes } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> { label?: string; size?: number }
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { label = 'Loading', size, className, style, ...props }, ref,
) {
  return <span ref={ref} role="status" aria-label={label} {...props} className={cx('spinner', className)}
    style={{ '--ut-size': size === undefined ? undefined : `${size}px`, ...style } as CSSVariables} />;
});
