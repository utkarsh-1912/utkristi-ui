import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { assignRef, cx } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> { label?: ReactNode }
export interface CheckboxProps extends ChoiceProps { indeterminate?: boolean }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, label, className, id, ...props }, ref,
) {
  const generatedId = useId();
  const input = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (input.current) input.current.indeterminate = indeterminate; }, [indeterminate]);
  const inputId = id ?? generatedId;
  const control = <input {...props} type="checkbox" id={inputId} className={cx('checkbox', className)}
    ref={(node) => { input.current = node; assignRef(ref, node); }} />;
  return label == null ? control : <label className="choice" htmlFor={inputId}>{control}{label}</label>;
});

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio({ label, className, id, ...props }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const control = <input {...props} type="radio" id={inputId} className={cx('radio', className)} ref={ref} />;
  return label == null ? control : <label className="choice" htmlFor={inputId}>{control}{label}</label>;
});

export const RadioGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function RadioGroup({ className, ...props }, ref) {
  return <div {...props} ref={ref} role="radiogroup" className={cx('radio-group', className)} />;
});

export interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, checked, defaultChecked = false, onCheckedChange, className, onClick, ...props }, ref,
) {
  const id = useId();
  const [active, setActive] = useControllable(checked, defaultChecked, onCheckedChange);
  const control = <button {...props} ref={ref} type="button" role="switch" aria-checked={active}
    aria-labelledby={label == null ? props['aria-labelledby'] : id} className={cx('switch', className)}
    onClick={(event) => {
      onClick?.(event);
      if (!event.defaultPrevented) setActive(!active);
    }} />;
  return label == null ? control : <label className="choice">{control}<span id={id}>{label}</span></label>;
});
