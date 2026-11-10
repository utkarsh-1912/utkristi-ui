import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { cx } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode; label: string; open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void; align?: 'start' | 'end';
  triggerProps?: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'id' | 'form' | 'disabled' | 'aria-describedby' | 'aria-invalid' | 'aria-labelledby'>;
}
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, label, open, defaultOpen = false, onOpenChange, align = 'start', className, children, onKeyDown, triggerProps, ...props }, ref,
) {
  const id = useId();
  const [shown, setShown] = useControllable(open, defaultOpen, onOpenChange);
  const panel = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shown) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.current?.contains(event.target)) setShown(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [shown, setShown]);

  useEffect(() => { if (shown) panel.current?.focus(); }, [shown]);

  // Escape bubbles from interactive controls in the non-modal panel.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
  return <div {...props} ref={ref} role="group" className={cx('popover', className)} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !shown) return;
    event.preventDefault();
    event.stopPropagation();
    setShown(false);
    button.current?.focus();
  }}>
    <div ref={anchor} className="popover-anchor" onBlur={(event) => {
      if (shown && !event.currentTarget.contains(event.relatedTarget)) setShown(false);
    }}>
      <Button {...triggerProps} ref={(node) => { button.current = node; }} variant="ghost" aria-haspopup="dialog"
        aria-expanded={shown} aria-controls={shown ? id : undefined} onClick={() => setShown(!shown)}>{trigger}</Button>
      {shown && <div ref={panel} id={id} role="dialog" aria-label={label} tabIndex={-1}
        className={cx('pop popover-panel', align === 'start' && 'pop-left')}>{children}</div>}
    </div>
  </div>;
});
