import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from './Button.js';
import { Chip } from './Badge.js';
import { Input, Select } from './Field.js';
import { cx } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';
import { useControl, useFormReset } from './utils/field.js';

export const NativeSelect = Select;

export const InputGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  start?: ReactNode; end?: ReactNode;
}>(function InputGroup({ start, end, children, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('input-group', className)}>
    {start && <span className="input-group-addon">{start}</span>}{children}
    {end && <span className="input-group-addon">{end}</span>}
  </div>;
});

export interface InputOTPProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'maxLength'> {
  value?: string; defaultValue?: string; length?: number; alphanumeric?: boolean;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  { length = 6, alphanumeric, value, defaultValue = '', onValueChange, onComplete, onChange, className,
    onPaste, onSelect, ...props }, ref,
) {
  const count = Math.max(1, Math.min(32, Number.isFinite(length) ? Math.floor(length) : 6));
  const clean = (text: string) => text.replace(alphanumeric ? /[^a-z0-9]/gi : /\D/g, '').slice(0, count);
  const [raw, setRaw] = useControllable(value, clean(defaultValue), onValueChange);
  const text = clean(raw);
  const [caret, setCaret] = useState(0);
  function update(next: string) {
    const sanitized = clean(next);
    if (sanitized === text) return;
    setRaw(sanitized);
    if (sanitized.length === count) onComplete?.(sanitized);
  }
  return <div className={cx('input-otp', className)}>
    <input {...props} ref={ref} className="input-otp-control" type="text" value={text}
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Verification code')}
      autoComplete={props.autoComplete ?? 'one-time-code'} inputMode={alphanumeric ? 'text' : 'numeric'} maxLength={count}
      onSelect={(event) => { onSelect?.(event); setCaret(event.currentTarget.selectionStart ?? 0); }}
      onChange={(event) => { onChange?.(event); update(event.target.value); setCaret(event.target.selectionStart ?? 0); }}
      onPaste={(event) => {
        onPaste?.(event);
        if (event.defaultPrevented || props.readOnly || props.disabled) return;
        event.preventDefault();
        const start = event.currentTarget.selectionStart ?? text.length;
        const end = event.currentTarget.selectionEnd ?? start;
        const pasted = clean(event.clipboardData.getData('text'));
        update(text.slice(0, start) + pasted + text.slice(end));
        setCaret(Math.min(count, start + pasted.length));
      }} />
    <div className="input-otp-slots" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <span key={index} className="input-otp-slot"
        data-active={index === Math.min(caret, count - 1) || undefined}>{text[index] ?? '·'}</span>)}
    </div>
  </div>;
});

export interface SearchOption {
  value: string; label: string; keywords?: readonly string[]; disabled?: boolean; group?: string;
  icon?: ReactNode; description?: string;
}
interface SearchListProps extends HTMLAttributes<HTMLDivElement> {
  options: readonly SearchOption[]; label?: string; placeholder?: string; emptyText?: string;
  selected?: readonly string[]; onPick: (value: string) => void; popup?: boolean; multiple?: boolean; disabled?: boolean; selectOnly?: boolean;
  inputIcon?: ReactNode;
  form?: string;
  required?: boolean;
  onResetValue?: () => void;
}

const SearchList = forwardRef<HTMLDivElement, SearchListProps>(function SearchList(
  { options, label, placeholder, emptyText = 'No results.', selected = [], onPick, popup, multiple, disabled, selectOnly,
    className, inputIcon, form, required, onResetValue, ...props }, ref,
) {
  const id = useId();
  const field = useControl({ required, 'aria-describedby': props['aria-describedby'], 'aria-invalid': props['aria-invalid'] });
  const control = useRef<HTMLInputElement | HTMLButtonElement | null>(null);
  useFormReset(control, onResetValue && (() => {
    onResetValue();
    setOpen(false);
    setQuery('');
    setCursor(-1);
  }), form);
  useEffect(() => {
    if (control.current instanceof HTMLInputElement && popup) {
      control.current.setCustomValidity(field.required && selected.length === 0 ? 'Choose an option.' : '');
    }
  }, [popup, field.required, selected.length]);
  const results = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const visible = !popup || open;
  const normalizedQuery = query.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  const terms = normalizedQuery.split(' ').filter(Boolean);
  const matches = options.filter((item) => {
    const searchable = [item.label, ...(item.keywords ?? [])].join(' ').toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
  if (!popup && normalizedQuery) {
    const score = ({ label, value }: SearchOption) => {
      const name = label.toLocaleLowerCase();
      if (name === normalizedQuery || value.toLocaleLowerCase() === normalizedQuery) return 0;
      if (name.startsWith(normalizedQuery)) return 1;
      if (name.includes(normalizedQuery)) return 2;
      return 3;
    };
    matches.sort((a, b) => Number(!!a.disabled) - Number(!!b.disabled) || score(a) - score(b));
  }
  const groups = new Map<string | undefined, SearchOption[]>();
  for (const item of matches) {
    const items = groups.get(item.group);
    if (items) items.push(item);
    else groups.set(item.group, [item]);
  }
  const available = [...groups.values()].flat().filter((item) => !item.disabled);
  const active = available[cursor] ?? (!popup && !disabled ? available[0] : undefined);
  const selectedLabel = multiple ? '' : options.find((item) => item.value === selected[0])?.label ?? '';
  const optionId = (item: SearchOption) => `${id}-option-${options.indexOf(item)}`;
  const activeId = visible && active ? optionId(active) : undefined;
  useEffect(() => {
    const list = results.current;
    const option = activeId ? document.getElementById(activeId) : null;
    if (!list || !option) return;
    const bounds = list.getBoundingClientRect();
    const item = option.getBoundingClientRect();
    if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
  }, [activeId, query]);
  function pick(value: string) {
    onPick(value);
    setQuery('');
    setCursor(-1);
    if (!multiple) setOpen(false);
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && popup && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false); setQuery(''); setCursor(-1);
      return;
    }
    if (event.nativeEvent.isComposing || disabled) return;
    if (event.key === 'Enter' && visible && (active || !popup)) {
      event.preventDefault();
      if (active) pick(active.value);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', ...(selectOnly ? ['Home', 'End'] : [])].includes(event.key)) return;
    event.preventDefault();
    setOpen(true);
    const current = active ? available.indexOf(active) : -1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % available.length : current <= 0 ? available.length - 1 : current - 1;
    setCursor(available.length ? next : -1);
  }

  const renderOption = (item: SearchOption) => <button type="button" tabIndex={-1} key={item.value} id={optionId(item)}
    role="option" aria-disabled={(item.disabled || disabled) || undefined}
    aria-label={item.description ? item.label : undefined} aria-describedby={item.description ? `${optionId(item)}-description` : undefined}
    aria-selected={popup ? selected.includes(item.value) : active === item}
    className="menu-item search-option" data-highlighted={active === item || undefined}
    onMouseDown={(event) => event.preventDefault()} onClick={() => { if (!item.disabled && !disabled) pick(item.value); }}>
    {item.icon && <span className="search-option-icon" aria-hidden="true">{item.icon}</span>}
    <span className="search-option-copy"><span>{item.label}</span>
      {item.description && <small id={`${optionId(item)}-description`} className="search-option-description">{item.description}</small>}
    </span>{selected.includes(item.value) && <span aria-hidden="true">✓</span>}
  </button>;

  return <div {...props} ref={ref} className={cx(popup ? 'combobox' : 'command', className)} onBlur={(event) => {
    props.onBlur?.(event);
    if (popup && !event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(''); setCursor(-1); }
  }}>
    {multiple && selected.length > 0 && <div className="combobox-chips">
      {selected.map((value) => <Chip key={value} onRemove={disabled ? undefined : () => onPick(value)}>
        {options.find((item) => item.value === value)?.label ?? value}</Chip>)}
    </div>}
    {selectOnly
      ? <Button ref={(node) => { control.current = node as HTMLButtonElement | null; }} id={field.id} form={form}
        variant="ghost" className="select-menu-trigger" role="combobox" aria-haspopup="listbox"
        aria-label={label ?? (field.id ? undefined : 'Choose an option')} aria-expanded={visible} aria-controls={visible ? id : undefined}
        aria-invalid={field['aria-invalid']} aria-describedby={field['aria-describedby']} aria-labelledby={props['aria-labelledby']}
        aria-activedescendant={activeId} disabled={disabled}
        onClick={() => setOpen(!open)} onKeyDown={handleKey}>
        <span>{selectedLabel || placeholder || 'Select an option'}</span><span aria-hidden="true">⌄</span>
      </Button>
      : <div className={cx('search-list-input', inputIcon != null && 'search-list-input-icon')}>
        {inputIcon != null && <span className="search-list-leading" aria-hidden="true">{inputIcon}</span>}
        <Input ref={(node) => { control.current = node; }} form={form} required={false} aria-required={popup && field.required || undefined}
        role="combobox" aria-autocomplete="list" aria-label={label ?? (field.id ? undefined : 'Choose an option')}
        aria-labelledby={props['aria-labelledby']} aria-invalid={props['aria-invalid']} aria-describedby={props['aria-describedby']}
        aria-expanded={visible} aria-controls={visible ? id : undefined}
        aria-activedescendant={activeId} autoComplete="off" placeholder={placeholder} disabled={disabled}
        value={popup && !open ? selectedLabel : query} onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setCursor(-1); setOpen(true); }} onKeyDown={handleKey} />
      </div>}
    {visible && <div ref={results} className={cx('search-results', 'ut-scrollbar', popup && 'search-results-floating')}>
      {matches.length === 0 && <p role="status" className="search-empty">{emptyText}</p>}
      <div role="listbox" id={id} aria-label={label ?? 'Options'} aria-multiselectable={multiple || undefined}>
        {[...groups].map(([group, items]) => group ? <div key={group} role="group" aria-label={group}>
          <div aria-hidden="true" className="search-group-label">{group}</div>{items.map(renderOption)}
        </div> : items.map(renderOption))}
      </div>
    </div>}
  </div>;
});

export interface ComboboxProps extends Omit<SearchListProps, 'selected' | 'onPick' | 'popup' | 'selectOnly' | 'onResetValue'> {
  value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: readonly string[]) => void;
  name?: string;
}
const emptyOptions: readonly string[] = [];
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(function Combobox(
  { value, defaultValue = emptyOptions, onValueChange, multiple, name, ...props }, ref,
) {
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange);
  return <>
    {name && selected.map((key) => <input key={key} type="hidden" name={name} form={props.form} value={key} disabled={props.disabled} />)}
    <SearchList {...props} ref={ref} selected={selected} multiple={multiple} popup
      onResetValue={() => setSelected(defaultValue)}
      onPick={(next) => setSelected(multiple ? selected.includes(next) ? selected.filter((item) => item !== next) : [...selected, next] : [next])} />
  </>;
});

export interface CommandOption extends SearchOption { onSelect: () => void }
export const Command = forwardRef<HTMLDivElement, Omit<SearchListProps, 'options' | 'onPick' | 'selected' | 'popup' | 'multiple' | 'selectOnly' | 'onResetValue'> & {
  options: readonly CommandOption[];
}>(function Command({ options, ...props }, ref) {
  return <SearchList {...props} ref={ref} options={options} onPick={(value) => options.find((item) => item.value === value)?.onSelect()} />;
});

export interface SelectMenuProps extends Omit<ComboboxProps, 'multiple' | 'value' | 'defaultValue' | 'onValueChange'> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void; name?: string;
}

export const SelectMenu = forwardRef<HTMLDivElement, SelectMenuProps>(function SelectMenu(
  { value, defaultValue = '', onValueChange, name, ...props }, ref,
) {
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange);
  return <>
    {name && <input type="hidden" name={name} form={props.form} value={selected} disabled={props.disabled} />}
    <SearchList {...props} ref={ref} selected={selected ? [selected] : []} popup selectOnly onPick={setSelected}
      onResetValue={() => setSelected(defaultValue)} />
  </>;
});
