import { cloneElement, forwardRef, useEffect, useRef, useState, type FocusEvent, type HTMLAttributes,
  type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { assignRef, cx } from './utils/cx.js';
import { Portal } from './utils/Portal.js';
import { useId } from './utils/useId.js';

type TriggerProps = Pick<HTMLAttributes<HTMLElement>, 'aria-describedby' | 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'>;
export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> {
  children: ReactElement<TriggerProps>;
  content: ReactNode;
  delay?: number;
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { children, content, delay = 300, className, ...props }, ref,
) {
  const id = useId();
  const target = useRef<HTMLElement>();
  const bubble = useRef<HTMLSpanElement | null>(null);
  const [hovered, hover] = useState(false);
  const [focused, focus] = useState(false);
  const [dismissed, dismiss] = useState(false);
  const [open, setOpen] = useState(false);
  const wanted = (hovered || focused) && !dismissed;

  useEffect(() => {
    if (!wanted) return;
    const timer = window.setTimeout(() => setOpen(true), delay);
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { dismiss(true); setOpen(false); }
    }
    document.addEventListener('keydown', escape);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', escape);
    };
  }, [wanted, delay]);

  function position() {
    if (!target.current || !bubble.current) return;
    const anchor = target.current.getBoundingClientRect();
    const element = bubble.current;
    const { height, width } = element.getBoundingClientRect();
    const center = anchor.left + anchor.width / 2;
    const x = Math.max(width / 2 + 8, Math.min(center, window.innerWidth - width / 2 - 8));
    const above = anchor.top >= height + 12 || window.innerHeight - anchor.bottom < height + 12;
    element.style.setProperty('--ut-tip-x', `${x}px`);
    element.style.setProperty('--ut-tip-y', `${above ? anchor.top - 8 : anchor.bottom + 8}px`);
    element.style.setProperty('--ut-tip-arrow', `${Math.max(8, Math.min(width - 8, width / 2 + center - x))}px`);
    element.dataset.side = above ? 'top' : 'bottom';
  }

  useEffect(() => {
    if (!open || !wanted) return;
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [open, wanted]);

  function leave() {
    setOpen(false);
    dismiss(false);
  }
  return <>
    {cloneElement(children, {
      'aria-describedby': cx(children.props['aria-describedby'], open && wanted && id) || undefined,
      onMouseEnter(event: MouseEvent<HTMLElement>) {
        children.props.onMouseEnter?.(event);
        target.current = event.currentTarget;
        hover(true);
      },
      onMouseLeave(event: MouseEvent<HTMLElement>) {
        children.props.onMouseLeave?.(event);
        hover(false);
        if (!focused) leave();
      },
      onFocus(event: FocusEvent<HTMLElement>) {
        children.props.onFocus?.(event);
        target.current = event.currentTarget;
        focus(true);
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        children.props.onBlur?.(event);
        focus(false);
        if (!hovered) leave();
      },
    })}
    {open && wanted && <Portal><span {...props} ref={(node) => {
      bubble.current = node;
      position();
      assignRef(ref, node);
    }} id={id} role="tooltip" className={cx('tooltip', className)}>{content}</span></Portal>}
  </>;
});
