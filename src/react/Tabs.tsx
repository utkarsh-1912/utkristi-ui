'use client';

import { forwardRef, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';
import { transitionUI } from './utils/motion.js';

export interface TabItem { id: string; label: ReactNode; content: ReactNode; count?: ReactNode; disabled?: boolean }
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  activation?: 'auto' | 'manual';
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'soft' | 'pills' | 'plain';
  fullWidth?: boolean;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, value, defaultValue, onChange, activation = 'auto', label, orientation = 'horizontal', variant = 'soft', fullWidth, className, ...props }, ref,
) {
  const id = useId();
  const enabled = items.filter((item) => !item.disabled);
  const [current, select] = useControllable(value, defaultValue ?? enabled[0]?.id ?? '', onChange);
  const [focused, setFocused] = useState<string>();
  const active = enabled.find((item) => item.id === current) ?? enabled[0];
  const tabStop = enabled.find((item) => item.id === focused) ?? active;
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const activate = (id: string, source: HTMLElement) => {
    if (id !== current) transitionUI(source, 'selection', () => select(id));
  };
  return <div {...props} ref={ref} className={cx('tabs-root', className)} data-orientation={orientation} data-variant={variant} data-full-width={fullWidth || undefined}>
    <div role="tablist" aria-label={label} aria-orientation={orientation} className="tabs" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
    }}>
      {items.map((item, index) => <button type="button" key={item.id} className="tab" role="tab" disabled={item.disabled}
        id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active?.id === item.id}
        tabIndex={tabStop?.id === item.id ? 0 : -1}
        ref={(node) => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
        onFocus={() => setFocused(item.id)} onClick={(event) => activate(item.id, event.currentTarget)} onKeyDown={(event) => {
          if (orientation === 'horizontal' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return;
          if (orientation === 'vertical' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const key = orientation === 'horizontal' && rtl ? event.key === 'ArrowLeft' ? 'ArrowRight' : event.key === 'ArrowRight' ? 'ArrowLeft' : event.key : event.key;
          const next = navigationIndex(key, enabled.indexOf(item), enabled.length);
          if (next === undefined) return;
          event.preventDefault();
          const target = enabled[next].id;
          buttons.current.get(target)?.focus();
          if (activation === 'auto') activate(target, event.currentTarget);
        }}>
        {item.label}{item.count != null && <span className="badge-count">{item.count}</span>}
      </button>)}
    </div>
    {items.map((item, index) => <div key={item.id} className={cx('tab-panel')} role="tabpanel" tabIndex={0}
      id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active?.id !== item.id}>
      {item.content}
    </div>)}
  </div>;
});
