import { forwardRef, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './icons.js';
import { cx } from './utils/cx.js';
import { navigationIndex } from './utils/focus.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean;
}
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { label, open, defaultOpen = false, onOpenChange, disabled, children, className, ...props }, ref,
) {
  const id = useId();
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange);
  return <div {...props} ref={ref} className={cx('collapsible', className)}>
    <button type="button" className="disclosure-trigger" aria-expanded={expanded} aria-controls={id} disabled={disabled}
      onClick={() => setExpanded(!expanded)}>{label}<Icon name="chevronDown" /></button>
    <div id={id} className="disclosure-body" hidden={!expanded}>{children}</div>
  </div>;
});

export interface AccordionItem { id: string; label: ReactNode; content: ReactNode; disabled?: boolean }
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly AccordionItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  multiple?: boolean;
}
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, value, defaultValue = [], onValueChange, multiple, className, ...props }, ref,
) {
  const id = useId();
  const [expanded, setExpanded] = useControllable(value, defaultValue, onValueChange);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((item) => !item.disabled);
  return <div {...props} ref={ref} className={cx('accordion', className)}>
    {items.map((item, index) => {
      const active = expanded.includes(item.id);
      const title = `${id}-title-${index}`;
      const panel = `${id}-panel-${index}`;
      return <div key={item.id} className="accordion-item">
        <h3 className="accordion-heading"><button type="button" className="disclosure-trigger" disabled={item.disabled} id={title}
          ref={(node) => { if (node) triggers.current.set(item.id, node); else triggers.current.delete(item.id); }}
          aria-expanded={active} aria-controls={panel}
          onClick={() => setExpanded(active ? expanded.filter((key) => key !== item.id) : multiple ? [...expanded, item.id] : [item.id])}
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            const next = navigationIndex(event.key, enabled.indexOf(item), enabled.length);
            if (next === undefined) return;
            event.preventDefault();
            triggers.current.get(enabled[next].id)?.focus();
          }}>{item.label}<Icon name="chevronDown" /></button></h3>
        <div id={panel} aria-labelledby={title} role="region" className="disclosure-body" hidden={!active}>{item.content}</div>
      </div>;
    })}
  </div>;
});

export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (pressed: boolean) => void;
}
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed = false, onPressedChange, className, onClick, ...props }, ref,
) {
  const [active, setActive] = useControllable(pressed, defaultPressed, onPressedChange);
  return <button type="button" {...props} ref={ref} className={cx('btn btn-ghost', 'toggle', className)} aria-pressed={active}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) setActive(!active); }} />;
});

export interface ToggleOption { id: string; label: ReactNode; accessibleLabel?: string; disabled?: boolean }
export interface ToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly ToggleOption[]; multiple?: boolean; value?: readonly string[];
  defaultValue?: readonly string[]; onValueChange?: (value: readonly string[]) => void;
}
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { items, multiple, value, defaultValue = [], onValueChange, className, ...props }, ref,
) {
  const [active, setActive] = useControllable(value, defaultValue, onValueChange);
  return <div role="group" {...props} ref={ref} className={cx('button-group toggle-group', className)}>
    {items.map(({ id, label, accessibleLabel, disabled }) => <Toggle key={id} pressed={active.includes(id)} disabled={disabled}
      aria-label={accessibleLabel} onPressedChange={(next) =>
        setActive(next ? multiple ? [...active, id] : [id] : active.filter((item) => item !== id))}>{label}</Toggle>)}
  </div>;
});
