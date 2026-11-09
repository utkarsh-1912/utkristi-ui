import { Children, forwardRef, type HTMLAttributes } from 'react';
import { Dot, type DotProps } from './Badge.js';
import { cx, type CSSVariables } from './utils/cx.js';

export const avatarPalette = ['#334E89', '#684078', '#84502C', '#2D6350', '#784451', '#275B6E', '#59552E'] as const;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: number;
  me?: boolean;
  status?: DotProps['tone'];
}
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ name, src, size, me, status, style, className, ...props }, ref) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0] ?? '').join('').toLocaleUpperCase();
  const hash = Array.from(name).reduce((value, char) => (Math.imul(31, value) + (char.codePointAt(0) ?? 0)) >>> 0, 0);
  return <span {...props} ref={ref} role="img" aria-label={name} title={props.title ?? name} className={cx('avatar', me && 'avatar-me', className)}
    style={{ '--ut-av': avatarPalette[hash % avatarPalette.length], '--ut-av-ink': '#fff', '--ut-size': size === undefined ? undefined : `${size}px`, ...style } as CSSVariables}>
    {src ? <img src={src} alt="" /> : initials}
    {status && <Dot tone={status} className="avatar-status" static />}
  </span>;
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> { max?: number }
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({ max = Infinity, children, className, ...props }, ref) {
  const all = Children.toArray(children);
  const shown = all.slice(0, Math.max(0, max));
  const hidden = all.length - shown.length;
  return <div {...props} ref={ref} className={cx('avatar-group', className)}>
    {shown}{hidden > 0 && <span className="avatar-more" aria-label={`${hidden} more`}>+{hidden}</span>}
  </div>;
});
