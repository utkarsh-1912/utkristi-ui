import { createContext, forwardRef, useContext, type HTMLAttributes, type InputHTMLAttributes, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon } from './icons.js';
import { cx } from './utils/cx.js';
import { useId } from './utils/useId.js';

type ControlProps = Pick<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required' | 'aria-describedby' | 'aria-invalid'>;
const FieldContext = createContext<ControlProps>({});

function useControl(props: ControlProps) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field.id,
    required: props.required ?? field.required,
    'aria-invalid': props['aria-invalid'] ?? field['aria-invalid'],
    'aria-describedby': cx(field['aria-describedby'], props['aria-describedby']) || undefined,
  };
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  controlId?: string;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, required, controlId, className, children, ...props }, ref,
) {
  const id = useId();
  const inputId = controlId ?? id;
  const hintId = hint == null ? undefined : `${id}-hint`;
  const errorId = error == null ? undefined : `${id}-error`;
  return <div {...props} ref={ref} className={cx('field', className)}>
    {label != null && <label className="field-label" htmlFor={inputId}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
    <FieldContext.Provider value={{ id: inputId, required, 'aria-describedby': cx(hintId, errorId) || undefined, 'aria-invalid': errorId ? true : undefined }}>
      {children}
    </FieldContext.Provider>
    {hintId && <span id={hintId} className="field-hint">{hint}</span>}
    {errorId && <span id={errorId} className="field-error">{error}</span>}
  </div>;
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  const field = useControl(props);
  return <input {...props} {...field} ref={ref} className={cx('input', className)} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  const field = useControl(props);
  return <select {...props} {...field} ref={ref} className={cx('select', className)} />;
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { code?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, code, ...props }, ref) {
  const field = useControl(props);
  return <textarea {...props} {...field} ref={ref} className={cx('textarea', code && 'textarea-code', className)} />;
});

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> { icon?: ReactNode; shortcut?: ReactNode }
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, icon = <Icon name="search" />, shortcut, ...props }, ref,
) {
  const field = useControl(props);
  return <div className={cx('search', className)}>
    {icon}
    <input {...props} {...field} ref={ref} type="search" />
    {shortcut && <kbd className="kbd" aria-hidden="true">{shortcut}</kbd>}
  </div>;
});
