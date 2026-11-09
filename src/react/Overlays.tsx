import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from './Button.js';
import { Menu, type MenuItem } from './Menu.js';
import { Modal, type ModalProps } from './Modal.js';
import { cx } from './utils/cx.js';
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

export const Drawer = forwardRef<HTMLElement, SheetProps>(function Drawer({ side = 'bottom', className, ...props }, ref) {
  return <Sheet {...props} ref={ref} side={side} className={cx('drawer-panel', className)} />;
});

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode; label: string; open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void; align?: 'start' | 'end';
}
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, label, open, defaultOpen = false, onOpenChange, align = 'start', className, children, onKeyDown, ...props }, ref,
) {
  const id = useId();
  const [shown, setShown] = useControllable(open, defaultOpen, onOpenChange);
  const panel = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shown) return;
    panel.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.current?.contains(event.target)) setShown(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [shown, setShown]);

  return <div {...props} ref={ref} className={cx('popover', className)} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !shown) return;
    event.preventDefault();
    event.stopPropagation();
    setShown(false);
    button.current?.focus();
  }}>
    <div ref={anchor} className="popover-anchor">
      <Button ref={(node) => { button.current = node; }} variant="ghost" aria-haspopup="dialog"
        aria-expanded={shown} aria-controls={shown ? id : undefined} onClick={() => setShown(!shown)}>{trigger}</Button>
      {shown && <div ref={panel} id={id} role="dialog" aria-label={label} tabIndex={-1}
        className={cx('pop popover-panel', align === 'start' && 'pop-left')}>{children}</div>}
    </div>
  </div>;
});

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

  return <div {...props} ref={ref} className={cx('hover-card', className)}
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
    trigger={(trigger) => <div {...trigger} role="group" tabIndex={0} aria-label={label} className="context-trigger"
      onClick={undefined}>{children}</div>} />;
});

export interface MenuGroup { id: string; label: ReactNode; items: MenuItem[] }
export const Menubar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { menus: readonly MenuGroup[] }>(function Menubar(
  { menus, className, ...props }, ref,
) {
  return <div {...props} ref={ref} className={cx('menubar', className)} role="group">
    {menus.map(({ id, label, items }) => <Menu key={id} items={items} align="start"
      trigger={(trigger) => <Button {...trigger} variant="plain" size="sm">{label}</Button>} />)}
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
