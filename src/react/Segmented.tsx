import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { useControllable } from './utils/useControllable.js';

export interface SegmentItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: SegmentItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { items, value, defaultValue, onChange, className, ...props }, ref,
) {
  const enabled = items.filter((item) => !item.disabled);
  const [current, select] = useControllable(value, defaultValue ?? enabled[0]?.id ?? '', onChange);
  const active = enabled.find((item) => item.id === current) ?? enabled[0];
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  return <div {...props} ref={ref} role="radiogroup" className={cx('seg', className)}>
    {items.map(({ id, label, icon, count, disabled }) => <button key={id} type="button" role="radio" className="seg-item"
      disabled={disabled} aria-checked={active?.id === id} tabIndex={active?.id === id ? 0 : -1}
      ref={(node) => { if (node) buttons.current.set(id, node); else buttons.current.delete(id); }}
      onClick={() => select(id)} onKeyDown={(event) => {
        const next = navigationIndex(event.key, enabled.findIndex((item) => item.id === id), enabled.length);
        if (next === undefined) return;
        event.preventDefault();
        const target = enabled[next].id;
        buttons.current.get(target)?.focus();
        select(target);
      }}>
      {icon}{label}{count != null && <em>{count}</em>}
    </button>)}
  </div>;
});
