import { forwardRef, type HTMLAttributes } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  compact?: boolean;
  name?: string;
  suffix?: string;
}

export const Logo = forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  { size = 30, compact, name = 'Utkristi', suffix = 'ui', className, style, ...props }, ref,
) {
  return <span role="img" aria-label={[name, suffix].filter(Boolean).join(' ')} {...props} ref={ref}
    className={cx('brand', className)} style={{ '--ut-brand-size': `${Math.round(size * .66)}px`, ...style } as CSSVariables}>
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path className="brand-tile" d="M1 8 8 1h16l7 7v16l-7 7H8l-7-7Z" />
      <path className="brand-ring" d="M8.5 9.5v7.8a7.5 7.5 0 0 0 15 0v-2" fill="none" strokeWidth="3.1" strokeLinecap="round" />
      <path className="brand-halo" d="M19 5.5h7.5l2 2v6h-7.5l-2-2Z" />
      <path className="brand-dot" d="M20 6.5h6l1.5 1.5v4.5h-6L20 11Z" />
    </svg>
    {!compact && <span className="brand-name" aria-hidden="true"><span className="brand-pre">{name}</span>{suffix && <span className="brand-co">{suffix}</span>}</span>}
  </span>;
});
