import { createContext, useContext, useEffect, useRef, type InputHTMLAttributes, type RefObject } from 'react';
import { cx } from './cx.js';

type ControlProps = Pick<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required' | 'aria-describedby' | 'aria-invalid'>;
export const FieldContext = createContext<ControlProps>({});

export function useControl(props: ControlProps) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field.id,
    required: props.required ?? field.required,
    'aria-invalid': props['aria-invalid'] ?? field['aria-invalid'],
    'aria-describedby': cx(field['aria-describedby'], props['aria-describedby']) || undefined,
  };
}

export function useFormReset(control: RefObject<HTMLInputElement | HTMLButtonElement>, reset?: () => void, formId?: string) {
  const callback = useRef(reset);
  useEffect(() => { callback.current = reset; }, [reset]);
  const enabled = reset !== undefined;
  useEffect(() => {
    const form = control.current?.form;
    if (!form || !enabled) return;
    let active = true;
    const handleReset = (event: Event) => {
      queueMicrotask(() => { if (active && !event.defaultPrevented) callback.current?.(); });
    };
    form.addEventListener('reset', handleReset);
    return () => {
      active = false;
      form.removeEventListener('reset', handleReset);
    };
  }, [control, enabled, formId]);
}
