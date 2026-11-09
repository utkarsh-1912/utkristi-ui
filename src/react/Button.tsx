import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Spinner } from './Spinner.js';
import { assignRef, cx } from './utils/cx.js';

interface ButtonStyle {
  variant?: 'solid' | 'ghost' | 'quiet' | 'danger' | 'plain';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export type ButtonProps = ButtonStyle & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
);

const variants = { solid: 'btn-solid', ghost: 'btn-ghost', quiet: 'btn-quiet', danger: 'btn-danger', plain: 'btn-plain' };
const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', block, loading, disabled, iconLeft, iconRight, children, className, ...props }, ref,
) {
  const classes = cx('btn', variants[variant], sizes[size], block && 'btn-block', className);
  const content = <>{loading ? <Spinner aria-hidden="true" /> : iconLeft}{children}{iconRight}</>;
  if (props.href !== undefined) {
    const { onClick, ...link } = props;
    const inactive = disabled || loading || props['aria-disabled'] === true || props['aria-disabled'] === 'true';
    const click = (event: MouseEvent<HTMLAnchorElement>) => {
      if (inactive) event.preventDefault();
      else onClick?.(event);
    };
    return <a {...link} ref={(node) => assignRef(ref, node)} href={inactive ? undefined : link.href}
      role={inactive ? 'link' : link.role} aria-disabled={inactive || undefined} aria-busy={loading || props['aria-busy']}
      onClick={click} className={classes}>{content}</a>;
  }
  const { type = 'button', onClick, ...button } = props;
  return <button {...button} ref={(node) => assignRef(ref, node)} type={type} disabled={disabled || loading}
    aria-busy={loading || props['aria-busy']} onClick={(event) => {
      if (props['aria-disabled'] === true || props['aria-disabled'] === 'true') event.preventDefault();
      else onClick?.(event);
    }} className={classes}>{content}</button>;
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'icon' | 'circle';
  size?: 'sm' | 'md';
  pressed?: boolean;
  tone?: 'danger';
  badge?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'icon', size, pressed, tone, badge, className, children, type = 'button', ...props }, ref,
) {
  return <button {...props} ref={ref} type={type} aria-label={label} aria-pressed={pressed ?? props['aria-pressed']}
    className={cx(variant === 'circle' ? 'btn-circle' : 'icon-btn', size === 'sm' && (variant === 'circle' ? 'btn-circle-sm' : 'icon-btn-sm'),
      tone === 'danger' && 'icon-btn-danger', className)}>
    {children}{badge && <span className="icon-btn-badge" aria-hidden="true">{badge === true ? null : badge}</span>}
  </button>;
});
