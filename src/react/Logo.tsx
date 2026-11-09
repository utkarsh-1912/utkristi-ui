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
      <rect className="brand-tile" x="1" y="1" width="28" height="28" rx="8.5" />
      <path className="brand-ring" d="M21.6 18.7 A7 7 0 1 1 18.7 9.4" fill="none" strokeWidth="2.6" strokeLinecap="round" />
      <circle className="brand-halo" cx="24.5" cy="24.5" r="6.4" />
      <circle className="brand-dot" cx="24.5" cy="24.5" r="4" />
    </svg>
    {!compact && <span className="brand-name" aria-hidden="true"><span className="brand-pre">{name}</span>{suffix && <span className="brand-co">{suffix}</span>}</span>}
  </span>;
});
