import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { Menu, type MenuItem } from './Menu.js';
import { Modal, type ModalProps } from './Modal.js';
import { Popover } from './Popover.js';
import { cx } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface AlertDialogProps extends Omit<ModalProps, 'role' | 'footer' | 'onSubmit'> {
  onConfirm: () => void; confirmLabel?: ReactNode; cancelLabel?: ReactNode; destructive?: boolean;
}

export const AlertDialog = forwardRef<HTMLElement, AlertDialogProps>(function AlertDialog(
  { onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive, initialFocus, ...props }, ref,
) {
  const cancel = useRef<HTMLButtonElement | null>(null);
  return <Modal {...props} ref={ref} role="alertdialog" dismissOnBackdrop={false} initialFocus={initialFocus ?? cancel} footer={<>
    <Button variant="ghost" ref={(node) => { cancel.current = node as HTMLButtonElement | null; }} onClick={props.onClose}>{cancelLabel}</Button>
    <Button variant={destructive ? 'danger' : 'solid'} onClick={onConfirm}>{confirmLabel}</Button>
  </>} />;
});

export interface SheetProps extends ModalProps { side?: 'start' | 'end' | 'bottom' | 'top' }

export const Sheet = forwardRef<HTMLElement, SheetProps>(function Sheet(
  { side = 'end', className, backdropClassName, ...props }, ref,
) {
  return <Modal {...props} ref={ref} className={cx('sheet-panel', className)}
    backdropClassName={cx('sheet-backdrop', backdropClassName)} data-side={side} />;
});

export const Drawer = forwardRef<HTMLElement, SheetProps>(function Drawer(
  { side = 'bottom', className, handle, onClose, ...props }, ref,
) {
  const start = useRef<number>();
  const vertical = side === 'bottom' || side === 'top';
  return <Sheet {...props} ref={ref} side={side} onClose={onClose} className={cx('drawer-panel', className)}
    handle={handle ?? (onClose && <button type="button" className="drawer-handle" aria-label="Dismiss drawer"
      onClick={(event) => { if (event.detail === 0) onClose(); }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        start.current = vertical ? event.clientY : event.clientX;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }} onPointerUp={(event) => {
        if (start.current === undefined) return;
        const displacement = (vertical ? event.clientY : event.clientX) - start.current;
        start.current = undefined;
        const rtl = !vertical && getComputedStyle(event.currentTarget).direction === 'rtl';
        const direction = side === 'top' || (side === 'start' && !rtl) || (side === 'end' && rtl) ? -1 : 1;
        if (displacement * direction > 44 || Math.abs(displacement) < 4) onClose();
      }} onPointerCancel={() => { start.current = undefined; }}><span aria-hidden="true" /></button>)} />;
});

export { Popover, type PopoverProps } from './Popover.js';

export interface HoverCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  href: string; trigger: ReactNode; content: ReactNode;
}
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  { href, trigger, content, className, ...props }, ref,
) {
  const id = useId();
  const [open, setOpen] = useControllable<boolean>(undefined, false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hovered = useRef(false);
  const focused = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);

  function schedule() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(hovered.current || focused.current), hovered.current || focused.current ? 180 : 120);
  }

  // Keep the preview open while focus moves between its link and content.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
  return <div {...props} ref={ref} role="group" className={cx('hover-card', className)}
    onMouseEnter={() => { hovered.current = true; schedule(); }}
    onMouseLeave={() => { hovered.current = false; schedule(); }}
    onFocus={() => { focused.current = true; schedule(); }}
    onBlur={(event) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      focused.current = false;
      schedule();
    }} onKeyDown={(event) => {
      if (event.key !== 'Escape' || !open) return;
      event.preventDefault();
      clearTimeout(timer.current);
      setOpen(false);
    }}>
    <a className="link" href={href} aria-describedby={open ? id : undefined}>{trigger}</a>
    {open && <div id={id} className="pop pop-left hover-card-panel">{content}</div>}
  </div>;
});

export interface ContextMenuProps extends HTMLAttributes<HTMLDivElement> { items: MenuItem[]; label: string }
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, label, children, className, ...props }, ref,
) {
  return <Menu {...props} ref={ref} items={items} context className={cx('context-menu', className)}
    trigger={(trigger) => <button type="button" {...trigger} aria-label={label} className="context-trigger">{children}</button>} />;
});

export interface MenuGroup { id: string; label: ReactNode; items: MenuItem[] }
export const Menubar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { menus: readonly MenuGroup[] }>(function Menubar(
  { menus, className, ...props }, ref,
) {
  const [current, setCurrent] = useState(0);
  const buttons = useRef(new Map<number, HTMLElement>());
  return <div {...props} ref={ref} className={cx('menubar', className)} role="menubar">
    {menus.map(({ id, label, items }, index) => <Menu key={id} items={items} align="start" role="presentation"
      trigger={(trigger) => <Button {...trigger} ref={(button) => {
        if (button) buttons.current.set(index, button);
        else buttons.current.delete(index);
      }} role="menuitem" tabIndex={index === Math.min(current, menus.length - 1) ? 0 : -1} variant="plain" size="sm"
        onFocus={() => setCurrent(index)} onKeyDown={(event) => {
          trigger.onKeyDown(event);
          if (event.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const key = rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : event.key;
          const next = navigationIndex(key, index, menus.length);
          if (next !== undefined) buttons.current.get(next)?.focus();
        }}>{label}</Button>} />)}
  </div>;
});

export interface NavigationItem { id: string; label: ReactNode; href?: string; children?: readonly { label: ReactNode; href: string }[] }
export const NavigationMenu = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & {
  items: readonly NavigationItem[];
}>(function NavigationMenu({ items, className, ...props }, ref) {
  return <nav aria-label="Navigation" {...props} ref={ref} className={cx('navigation-menu', className)}>
    {items.map((item) => item.children?.length ? <Popover key={item.id} trigger={item.label}
      label={typeof item.label === 'string' ? item.label : 'Navigation links'}>
      <ul className="navigation-menu-links">{item.children.map((link) =>
        <li key={link.href}><a className="menu-item" href={link.href}>{link.label}</a></li>)}</ul>
    </Popover> : <Button key={item.id} href={item.href ?? '#'} size="sm" variant="plain">{item.label}</Button>)}
  </nav>;
});
