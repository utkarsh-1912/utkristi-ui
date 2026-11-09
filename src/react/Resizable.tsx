import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { assignRef, cx, type CSSVariables } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface ResizableProps extends HTMLAttributes<HTMLDivElement> {
  first: ReactNode; second: ReactNode; label?: string; orientation?: 'horizontal' | 'vertical';
  value?: number; defaultValue?: number; min?: number; max?: number; onValueChange?: (value: number) => void;
}
export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  { first, second, label = 'Resize panels', orientation = 'horizontal', value, defaultValue = 50,
    min = 15, max = 85, onValueChange, className, style, ...props }, ref,
) {
  const id = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ start: number; percent: number; size: number; direction: number }>();
  const [raw, setValue] = useControllable(value, defaultValue, onValueChange);
  const lower = Math.max(0, Math.min(100, Number.isFinite(min) ? min : 15));
  const upper = Math.max(lower, Math.min(100, Number.isFinite(max) ? max : 85));
  const clamp = (next: number) => Math.max(lower, Math.min(upper, next));
  const percent = clamp(Number.isFinite(raw) ? raw : 50);
  const vertical = orientation === 'vertical';
  const coordinate = (event: { clientX: number; clientY: number }) => vertical ? event.clientY : event.clientX;
  return <div {...props} ref={(node) => { root.current = node; assignRef(ref, node); }}
    className={cx('resizable', className)} data-orientation={orientation}
    style={{ ...style, '--ut-split': `${percent}%` } as CSSVariables}>
    <div id={id} className="resizable-pane">{first}</div>
    {/* A movable ARIA window splitter is focusable and handles pointer and arrow input. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
    <div role="separator" tabIndex={0} className="resizable-handle" aria-label={label} aria-controls={id}
      aria-orientation={vertical ? 'horizontal' : 'vertical'} aria-valuenow={Math.round(percent)} aria-valuemin={lower} aria-valuemax={upper}
      onPointerDown={(event) => {
        if (event.button !== 0 || !root.current) return;
        const box = root.current.getBoundingClientRect();
        const size = vertical ? box.height : box.width;
        if (!size) return;
        const direction = !vertical && getComputedStyle(root.current).direction === 'rtl' ? -1 : 1;
        drag.current = { start: coordinate(event), size, percent, direction };
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={(event) => {
        if (!drag.current) return;
        const { start, size, percent: initial, direction } = drag.current;
        setValue(clamp(initial + (coordinate(event) - start) / size * 100 * direction));
      }} onLostPointerCapture={() => { drag.current = undefined; }}
      onKeyDown={(event) => {
        const rtl = !vertical && getComputedStyle(event.currentTarget).direction === 'rtl';
        const before = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const after = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        const step = event.shiftKey ? 10 : 2;
        const positions: Record<string, number> = { [before]: percent - step, [after]: percent + step, Home: lower, End: upper };
        if (!Object.hasOwn(positions, event.key)) return;
        event.preventDefault();
        setValue(clamp(positions[event.key]));
      }}><span aria-hidden="true" /></div>
    <div className="resizable-pane">{second}</div>
  </div>;
});
