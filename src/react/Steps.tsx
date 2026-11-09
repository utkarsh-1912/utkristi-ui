import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { useControllable } from './utils/useControllable.js';

export interface StepItem { id: string; label: ReactNode; kicker?: ReactNode; disabled?: boolean }
export interface StepsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: StepItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  autoplay?: number;
}

export const Steps = forwardRef<HTMLDivElement, StepsProps>(function Steps(
  { items, value, defaultValue, onChange, autoplay = 0, className, style, ...props }, ref,
) {
  const enabled = items.filter((item) => !item.disabled);
  const [selected, select] = useControllable(value, defaultValue ?? enabled[0]?.id ?? '', onChange);
  const active = enabled.find((item) => item.id === selected) ?? enabled[0];
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  return <div {...props} ref={ref} role="radiogroup" className={cx('steps', className)}
    style={{ '--n': Math.max(1, items.length), '--dur': `${autoplay}ms`, ...style } as CSSVariables}>
    {items.map((item, index) => {
      const checked = active?.id === item.id;
      const running = checked && autoplay > 0 && enabled.length > 1;
      return <button key={item.id} type="button" role="radio" aria-checked={checked} disabled={item.disabled}
        tabIndex={checked ? 0 : -1} className={cx('step', running && 'is-running')}
        ref={(node) => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
        onClick={() => select(item.id)}
        onAnimationEnd={(event) => {
          if (running && event.animationName === 'ut-fill' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            select(enabled[(enabled.indexOf(item) + 1) % enabled.length].id);
          }
        }}
        onKeyDown={(event) => {
          const next = navigationIndex(event.key, enabled.indexOf(item), enabled.length);
          if (next === undefined) return;
          event.preventDefault();
          select(enabled[next].id);
          buttons.current.get(enabled[next].id)?.focus();
        }}>
        <span className="label">{item.kicker ?? String(index + 1).padStart(2, '0')}</span><b>{item.label}</b>
      </button>;
    })}
  </div>;
});
