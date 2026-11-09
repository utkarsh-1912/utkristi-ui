import { forwardRef, type HTMLAttributes } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'block' | 'text' | 'circle';
  width?: string | number;
  height?: string | number;
}

const variants = { block: '', text: 'skeleton-text', circle: 'skeleton-circle' };

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'block', width, height, className, style, ...props }, ref,
) {
  return <span {...props} ref={ref} className={cx('skeleton', variants[variant], className)} aria-hidden="true"
    style={{ '--ut-width': typeof width === 'number' ? `${width}px` : width,
      '--ut-height': typeof height === 'number' ? `${height}px` : height, ...style } as CSSVariables} />;
});
