import { forwardRef, type HTMLAttributes } from 'react';
import { logoWordmarkPath } from './logo-wordmark.js';
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
      <path className="brand-tile" fill="currentColor" d="M2.8 20.5 12.6 10.7a1.65 1.65 0 0 1 2.3 0l3.1 3.1a1.65 1.65 0 0 1 0 2.3l-9.8 9.8a1.65 1.65 0 0 1-2.3 0l-3.1-3.1a1.65 1.65 0 0 1 0-2.3Z" />
      <path className="brand-tile" fill="currentColor" transform="translate(11 2.5)" d="M2.8 20.5 12.6 10.7a1.65 1.65 0 0 1 2.3 0l3.1 3.1a1.65 1.65 0 0 1 0 2.3l-9.8 9.8a1.65 1.65 0 0 1-2.3 0l-3.1-3.1a1.65 1.65 0 0 1 0-2.3Z" />
      <path className="brand-dot" fill="currentColor" d="m21.4 6.3 3.5-3.5a1.25 1.25 0 0 1 1.8 0l3.5 3.5a1.25 1.25 0 0 1 0 1.8l-3.5 3.5a1.25 1.25 0 0 1-1.8 0l-3.5-3.5a1.25 1.25 0 0 1 0-1.8Z" />
    </svg>
    {!compact && <span className="brand-name" aria-hidden="true">
      {name === 'Utkristi' ? <svg className="brand-wordmark" viewBox="0 0 106 24" width="106" height="24" aria-hidden="true">
        <path d={logoWordmarkPath} fill="currentColor" />
      </svg> : <span className="brand-pre">{name}</span>}
      {suffix && <span className="brand-co">{suffix}</span>}
    </span>}
  </span>;
});
