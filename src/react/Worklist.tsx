import type { ReactNode } from 'react';
import { Button } from './Button.js';
import { Checkbox } from './Choice.js';
import { Field, Input } from './Field.js';
import { Popover } from './Popover.js';

export interface FilterBarProps {
  children?: ReactNode;
  filters?: readonly { id: string; label: string }[];
  onRemove?: (id: string) => void;
  onReset?: () => void;
  label?: string;
}

export function FilterBar({ children, filters = [], onRemove, onReset, label = 'Filters' }: FilterBarProps) {
  return <div className="worklist-filters" role="group" aria-label={label}>
    {children && <div className="worklist-controls">{children}</div>}
    {filters.length > 0 && <div className="worklist-controls" role="group" aria-label="Active filters">
      {filters.map(({ id, label }) => onRemove
        ? <Button key={id} variant="ghost" size="sm" className="worklist-chip"
          aria-label={`Remove filter ${label}`} onClick={() => onRemove(id)}>{label} <span aria-hidden="true">×</span></Button>
        : <span key={id} className="badge">{label}</span>)}
      {onReset && <Button variant="ghost" size="sm" onClick={onReset}>Reset filters</Button>}
    </div>}
  </div>;
}

export interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  children?: ReactNode;
}

export function BulkActionBar({ count, onClear, children }: BulkActionBarProps) {
  return <div className="worklist-bulk" role="group" aria-label="Bulk actions">
    <span role="status">{count > 0 ? `${count} selected` : ''}</span>
    {count > 0 && <div className="worklist-controls">
      {children}<Button size="sm" variant="ghost" onClick={onClear}>Clear selection</Button>
    </div>}
  </div>;
}

export interface ColumnChooserProps {
  columns: readonly { key: string; label: string; required?: boolean }[];
  visible: readonly string[];
  onChange: (keys: string[]) => void;
  label?: string;
}

export function ColumnChooser({ columns, visible, onChange, label = 'Columns' }: ColumnChooserProps) {
  const isVisible = (key: string) => visible.includes(key);
  const count = columns.filter((column) => column.required || isVisible(column.key)).length;
  return <Popover trigger={label} label={label}>
    <div className="worklist-column-options">
      {columns.map(({ key, label, required }) => <Checkbox key={key} label={label}
        checked={required || isVisible(key)} disabled={required || (isVisible(key) && count === 1)}
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          onChange(columns.filter((column) => column.required ||
            (column.key === key ? checked : isVisible(column.key))).map((column) => column.key));
        }} />)}
    </div>
  </Popover>;
}

/** Inclusive date-only bounds in YYYY-MM-DD format. An empty string leaves a bound open. */
export interface DateRangeValue { start: string; end: string }

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  min?: string;
  max?: string;
  label?: string;
  disabled?: boolean;
}

export function DateRangePicker({ value, onChange, min, max, label = 'Date range', disabled }: DateRangePickerProps) {
  const reversed = Boolean(value.start && value.end && value.start > value.end);
  const first = value.end && (!max || value.end < max) ? value.end : max;
  const last = value.start && (!min || value.start > min) ? value.start : min;
  return <fieldset className="worklist-dates" disabled={disabled}>
    <legend className="field-label">{label}</legend>
    <div className="worklist-controls">
      <Field label="Start date">
        <Input type="date" min={min} max={first} value={value.start}
          onChange={(event) => onChange({ ...value, start: event.currentTarget.value })} />
      </Field>
      <Field label="End date" error={reversed ? 'End date must be on or after the start date.' : undefined}>
        <Input type="date" min={last} max={max} value={value.end}
          onChange={(event) => onChange({ ...value, end: event.currentTarget.value })} />
      </Field>
    </div>
  </fieldset>;
}
