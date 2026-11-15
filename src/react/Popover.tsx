import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { cx } from './utils/cx.js';
import { isTopOverlay, pushOverlay } from './utils/overlayStack.js';
import { computePlacement, type PlacementAlign, type PlacementSide } from './utils/placement.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode; label: string; open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void; align?: PlacementAlign; side?: PlacementSide;
  triggerProps?: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'id' | 'form' | 'disabled' | 'aria-describedby' | 'aria-invalid' | 'aria-labelledby'>;
}
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, label, open, defaultOpen = false, onOpenChange, align = 'start', side = 'bottom', className, children, onKeyDown, triggerProps, ...props }, ref,
) {
  const id = useId();
  const [shown, setShown] = useControllable(open, defaultOpen, onOpenChange);
  const [placement, setPlacement] = useState({ side, align });
  const panel = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shown) return;
    const pop = pushOverlay(id);
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.current?.contains(event.target)) setShown(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => { pop(); document.removeEventListener('pointerdown', outside); };
  }, [shown, setShown, id]);

  useLayoutEffect(() => {
    if (!shown || !anchor.current || !panel.current) {
      setPlacement({ side, align });
      return;
    }
    const anchorRect = anchor.current.getBoundingClientRect();
    const panelRect = panel.current.getBoundingClientRect();
    setPlacement(computePlacement(anchorRect, { width: panelRect.width, height: panelRect.height }, { side, align }));
  }, [shown, side, align]);

  useEffect(() => { if (shown) panel.current?.focus(); }, [shown]);

  // Escape bubbles from interactive controls in the non-modal panel.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
  return <div {...props} ref={ref} role="group" className={cx('popover', className)} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !shown || !isTopOverlay(id)) return;
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
        data-side={placement.side} data-align={placement.align}
        className={cx('pop popover-panel', placement.align === 'start' && 'pop-left', placement.side === 'top' && 'pop-top')}>{children}</div>}
    </div>
  </div>;
});
