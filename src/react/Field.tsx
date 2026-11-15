import {
  forwardRef, useCallback, useEffect, useRef, useState,
  type FieldsetHTMLAttributes, type FormHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes,
  type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { ControlIcon } from './ControlIcon.js';
import { SearchIconData } from './icons/generated/SearchIcon.js';
import { cx } from './utils/cx.js';
import { useId } from './utils/useId.js';
import { geometryStyle, type ComponentGeometry } from './utils/geometry.js';
import { FieldContext, useControl } from './utils/field.js';

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
    {errorId && <span id={errorId} className="field-error" data-ut-slot="field-error">{error}</span>}
  </div>;
});

export type InputProps = InputHTMLAttributes<HTMLInputElement> & ComponentGeometry;
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, radius, inlineSize, style, ...props }, ref) {
  const field = useControl(props);
  return <input {...props} {...field} ref={ref} className={cx('input', className)} style={geometryStyle({ radius, inlineSize }, style)} />;
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & ComponentGeometry;
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, radius, inlineSize, style, ...props }, ref) {
  const field = useControl(props);
  return <select {...props} {...field} ref={ref} className={cx('select', className)} style={geometryStyle({ radius, inlineSize }, style)} />;
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, ComponentGeometry { code?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, code, radius, inlineSize, style, ...props }, ref) {
  const field = useControl(props);
  return <textarea {...props} {...field} ref={ref} className={cx('textarea', code && 'textarea-code', className)}
    style={geometryStyle({ radius, inlineSize }, style)} />;
});

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement>, ComponentGeometry { icon?: ReactNode; shortcut?: ReactNode }
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, icon = <ControlIcon glyph={SearchIconData} />, shortcut, radius, inlineSize, ...props }, ref,
) {
  const field = useControl(props);
  return <div className={cx('search', className)} style={geometryStyle({ radius, inlineSize }, undefined)}>
    {icon}
    <input {...props} {...field} ref={ref} type="search" />
    {shortcut && <kbd className="kbd" aria-hidden="true">{shortcut}</kbd>}
  </div>;
});

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  orientation?: 'vertical' | 'horizontal';
}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  { legend, description, error, orientation = 'vertical', className, children, ...props }, ref,
) {
  const id = useId();
  const descId = description != null ? `${id}-desc` : undefined;
  const errId = error != null ? `${id}-error` : undefined;
  return <fieldset {...props} ref={ref} className={cx('fieldset', orientation === 'horizontal' && 'fieldset-horizontal', className)}
    aria-describedby={cx(descId, errId) || undefined} aria-invalid={errId ? true : undefined}>
    {legend != null && <legend className="fieldset-legend">{legend}</legend>}
    {descId && <p id={descId} className="field-hint fieldset-desc">{description}</p>}
    <div className="fieldset-fields">{children}</div>
    {errId && <span id={errId} role="alert" className="field-error" data-ut-slot="field-error">{error}</span>}
  </fieldset>;
});

export function useAsyncValidation<T = string>(
  validator: (value: T) => Promise<string | undefined> | string | undefined,
  delayMs = 0,
) {
  const [error, setError] = useState<string | undefined>();
  const [validating, setValidating] = useState(false);
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    clearTimeout(timer.current);
    requestId.current += 1;
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    requestId.current += 1;
    setValidating(false);
    setError(undefined);
  }, []);

  const validate = useCallback((value: T) => {
    clearTimeout(timer.current);
    const id = ++requestId.current;
    setValidating(true);
    return new Promise<string | undefined>((resolve) => {
      const run = async () => {
        try {
          const message = await validator(value);
          if (requestId.current !== id) { resolve(undefined); return; }
          setError(message);
          setValidating(false);
          resolve(message);
        } catch (err) {
          if (requestId.current !== id) { resolve(undefined); return; }
          const message = err instanceof Error ? err.message : 'Validation failed';
          setError(message);
          setValidating(false);
          resolve(message);
        }
      };
      if (delayMs > 0) timer.current = setTimeout(run, delayMs);
      else void run();
    });
  }, [validator, delayMs]);

  return { error, validating, validate, reset };
}

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  error?: ReactNode;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { error, className, children, ...props }, ref,
) {
  return <form {...props} ref={ref} className={cx('ut-form', className)}>
    {error != null && <div role="alert" className="field-error ut-form-error" data-ut-slot="field-error">{error}</div>}
    {children}
  </form>;
});
