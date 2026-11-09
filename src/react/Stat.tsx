import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx.js';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  suffix?: ReactNode;
  label?: ReactNode;
  desc?: ReactNode;
}
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat({ value, suffix, label, desc, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('stat', className)}>
    {label != null && <span className="label">{label}</span>}
    <span className="stat-num">{value}{suffix != null && <small>{suffix}</small>}</span>
    {desc != null && <p className="stat-desc">{desc}</p>}
  </div>;
});
export const Stats = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Stats({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('stats', className)} />;
});
