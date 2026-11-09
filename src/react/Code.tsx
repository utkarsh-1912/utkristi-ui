import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { assignRef, cx } from './utils/cx.js';

export interface CodeProps extends HTMLAttributes<HTMLElement> { lines?: ReactNode[]; inline?: boolean }
export const Code = forwardRef<HTMLElement, CodeProps>(function Code({ lines, inline, children, className, ...props }, ref) {
  if (inline) return <code {...props} ref={ref} className={cx('code-inline', className)}>{children}</code>;
  return <pre {...props} ref={(node) => assignRef(ref, node)} className={cx('code', lines && 'code-lines', className)}>
    {lines ? lines.map((line, index) => <span key={index}>{line}</span>) : <code>{children}</code>}
  </pre>;
});
