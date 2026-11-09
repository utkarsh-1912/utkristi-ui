import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './icons.js';
import { assignRef, cx } from './utils/cx.js';

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'accent';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: Tone | 'count' }
const badgeTones = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad', accent: 'badge-accent' };
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = 'neutral', className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx(tone === 'count' ? 'badge-count' : 'badge', tone !== 'count' && badgeTones[tone], className)} />;
});

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'bad' | 'warn' | 'off';
  label?: string;
  static?: boolean;
}
const dotTones = { ok: '', bad: 'dot-bad', warn: 'dot-warn', off: 'dot-off' };
export const Dot = forwardRef<HTMLSpanElement, DotProps>(function Dot({ tone = 'ok', label, static: still, className, ...props }, ref) {
  return <span {...props} ref={ref} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    className={cx('dot', dotTones[tone], still && 'dot-static', className)} />;
});

export interface ChipProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  mono?: boolean;
  accent?: boolean;
  pressed?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onRemove?: () => void;
  removeLabel?: string;
  children?: ReactNode;
}

export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  { mono, accent, pressed, onClick, onRemove, removeLabel, className, children, ...props }, ref,
) {
  const classes = cx('chip', mono && 'chip-mono', accent && 'chip-accent', className);
  const setRef = (element: HTMLElement | null) => assignRef(ref, element);
  const chip = onClick || pressed !== undefined
    ? <button {...props} ref={setRef} type="button" className={classes} aria-pressed={pressed ?? false} onClick={onClick}>{children}</button>
    : <span {...props} ref={setRef} className={classes}>{children}</span>;
  return onRemove ? <span className="chip-group">{chip}<button type="button" className="chip-remove"
    aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'chip'}`}
    onClick={onRemove}><Icon name="close" size={12} /></button></span> : chip;
});
