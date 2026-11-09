import { cloneElement, forwardRef, isValidElement, useCallback, useEffect, useRef, useState, type HTMLAttributes,
  type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { assignRef, cx, type CSSVariables } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { Portal } from './utils/Portal.js';
import { useId } from './utils/useId.js';

export type MenuItem =
  | { type: 'separator'; id?: string }
  | { type: 'header'; id?: string; label: ReactNode; sub?: ReactNode }
  | { type?: 'item'; id?: string; label: ReactNode; textValue?: string; icon?: ReactNode;
      kbd?: ReactNode; danger?: boolean; disabled?: boolean; onSelect?: () => void };

export interface MenuTriggerProps {
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  id: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  items: MenuItem[];
  trigger: ReactElement<MenuTriggerProps> | ((props: MenuTriggerProps) => ReactElement);
  align?: 'start' | 'end';
  up?: boolean;
  context?: boolean;
  menuClassName?: string;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { items, trigger, align = 'end', up, context, menuClassName, className, ...props }, ref,
) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const root = useRef<HTMLDivElement | null>(null);
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  const returnTo = useRef<HTMLElement>();
  const [edge, setEdge] = useState<'first' | 'last'>();
  const open = edge !== undefined;
  const [point, setPoint] = useState<{ x: number; y: number }>();
  const buttons = useCallback(() => Array.from(surface?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []), [surface]);

  function close(restore = false) {
    setEdge(undefined);
    if (restore) returnTo.current?.focus();
  }

  useEffect(() => {
    if (!edge || !surface) return;
    const enabled = buttons();
    (enabled[edge === 'first' ? 0 : enabled.length - 1] ?? surface)?.focus();
    function outside(event: globalThis.MouseEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target) && !surface?.contains(event.target)) setEdge(undefined);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [edge, surface, buttons]);

  function openContext(target: HTMLElement, x: number, y: number) {
    returnTo.current = target;
    setPoint({ x, y });
    setEdge('first');
  }

  useEffect(() => {
    const node = surface;
    if (!point || !node) return;
    const box = node.getBoundingClientRect();
    node.style.setProperty('--ut-context-x', Math.max(8, Math.min(point.x, window.innerWidth - box.width - 8)) + 'px');
    node.style.setProperty('--ut-context-y', Math.max(8, Math.min(point.y, window.innerHeight - box.height - 8)) + 'px');
  }, [point, surface]);

  const triggerProps: MenuTriggerProps = {
    id: triggerId, 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined,
    onClick(event) {
      if (context && !open) {
        const box = event.currentTarget.getBoundingClientRect();
        openContext(event.currentTarget, box.left, box.bottom);
        return;
      }
      returnTo.current = event.currentTarget;
      setEdge(open ? undefined : 'first');
    },
    ...(context ? { onContextMenu(event: MouseEvent<HTMLElement>) {
      event.preventDefault();
      openContext(event.currentTarget, event.clientX, event.clientY);
    } } : {}),
    onKeyDown(event) {
      if (context && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') || ['Enter', ' '].includes(event.key))) {
        event.preventDefault();
        const box = event.currentTarget.getBoundingClientRect();
        openContext(event.currentTarget, box.left, box.bottom);
        return;
      }
      if (context && event.key !== 'Escape') return;
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        close(true);
      } else if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        returnTo.current = event.currentTarget;
        const requested = event.key === 'ArrowUp' ? 'last' : 'first';
        if (edge === requested) {
          const enabled = buttons();
          (enabled[requested === 'first' ? 0 : enabled.length - 1] ?? surface)?.focus();
        } else setEdge(requested);
      }
    },
  };

  const renderedTrigger = typeof trigger === 'function' ? trigger(triggerProps) : isValidElement(trigger) ? cloneElement(trigger, {
    ...triggerProps,
    onContextMenu(event) {
      trigger.props.onContextMenu?.(event);
      if (!event.defaultPrevented) triggerProps.onContextMenu?.(event);
    },
    onClick(event) {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented) triggerProps.onClick(event);
    },
    onKeyDown(event) {
      trigger.props.onKeyDown?.(event);
      if (!event.defaultPrevented) triggerProps.onKeyDown(event);
    },
  }) : null;

  const panel = open ? <div ref={setSurface} id={menuId} role="menu" aria-labelledby={triggerId} tabIndex={-1}
      style={context ? { '--ut-context-x': (point?.x ?? 0) + 'px', '--ut-context-y': (point?.y ?? 0) + 'px' } as CSSVariables : undefined}
      className={cx('pop', context && 'context-surface', align === 'start' && 'pop-left', up && 'pop-up', menuClassName)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
          return;
        }
        if (event.key === 'Tab') return;
        const enabled = buttons();
        const current = enabled.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? undefined : navigationIndex(event.key, current, enabled.length);
        if (next !== undefined) {
          event.preventDefault();
          enabled[next].focus();
        } else if (event.key.length === 1 && event.key.trim() && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const key = event.key.toLocaleLowerCase();
          const order = [...enabled.slice(current + 1), ...enabled.slice(0, current + 1)];
          const match = order.find((item) => (item.dataset.textValue || item.textContent || '').trim().toLocaleLowerCase().startsWith(key));
          if (match) { event.preventDefault(); match.focus(); }
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}>
      {items.map((item, index) => {
        const key = item.id ?? index;
        if (item.type === 'separator') return <div key={key} role="separator" className="menu-sep" />;
        if (item.type === 'header') return <div key={key} className="menu-head" role="presentation">
          <strong>{item.label}</strong>{item.sub != null && <span>{item.sub}</span>}
        </div>;
        return <button key={key} type="button" role="menuitem" tabIndex={-1} aria-disabled={item.disabled || undefined}
          data-text-value={item.textValue} className={cx('menu-item', item.danger && 'menu-item-danger')}
          onClick={() => {
            if (item.disabled) return;
            close(true);
            item.onSelect?.();
          }}>
          {item.icon}{item.label}{item.kbd != null && <kbd className="kbd">{item.kbd}</kbd>}
        </button>;
      })}
    </div> : null;

  return <div {...props} className={cx('menu-anchor', className)} ref={(node) => {
    root.current = node;
    assignRef(ref, node);
  }}>
    {renderedTrigger}
    {context && panel ? <Portal>{panel}</Portal> : panel}
  </div>;
});
export const Dropdown = Menu;
