import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from './utils/cx.js';

export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...props }, ref) {
  return <kbd {...props} ref={ref} className={cx('kbd', className)} />;
});
