import { forwardRef, useRef, useState, type HTMLAttributes } from 'react';
import { IconButton } from './Button.js';
import { Icon } from './icons.js';
import { Popover } from './Overlays.js';
import { assignRef, cx } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

function day(year: number, month: number, date: number) {
  const value = new Date(0);
  value.setFullYear(year, month, date);
  value.setHours(0, 0, 0, 0);
  return value;
}
function from(date: Date, delta = 0) { return day(date.getFullYear(), date.getMonth(), date.getDate() + delta); }
function same(a: Date, b?: Date) { return !!b && +a === +from(b); }

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date; defaultValue?: Date; onValueChange?: (date: Date) => void;
  locale?: string; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; min?: Date; max?: Date;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value, defaultValue, onValueChange, locale, weekStartsOn = 0, min, max, className, ...props }, ref,
) {
  const id = useId();
  const [selected, select] = useControllable<Date | undefined>(value, defaultValue, (date) => { if (date) onValueChange?.(date); });
  const clamp = (date: Date) => min && date < from(min) ? from(min) : max && date > from(max) ? from(max) : date;
  const [focused, setFocused] = useState(() => clamp(from(value ?? defaultValue ?? new Date())));
  const [lastValue, setLastValue] = useState(value?.getTime());
  if (value?.getTime() !== lastValue) {
    setLastValue(value?.getTime());
    if (value) setFocused(clamp(from(value)));
  }
  const focusRequest = useRef<number>();
  const year = focused.getFullYear();
  const month = focused.getMonth();
  const start = day(year, month, 1);
  const today = from(new Date());
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(start);
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  const first = from(start, -((start.getDay() - weekStartsOn + 7) % 7));
  const days = Array.from({ length: 42 }, (_, index) => from(first, index));
  const unavailable = (date: Date) => (min && date < from(min)) || (max && date > from(max));

  function move(date: Date, focus: boolean) {
    const target = clamp(date);
    if (focus) focusRequest.current = +target;
    setFocused(target);
  }

  function moveMonth(amount: number, focus = false) {
    const last = day(year, month + amount + 1, 0).getDate();
    move(day(year, month + amount, Math.min(last, focused.getDate())), focus);
  }

  return <div {...props} ref={ref} className={cx('calendar', className)}>
    <div className="calendar-header">
      <IconButton label="Previous month" size="sm" onClick={() => moveMonth(-1)} disabled={!!min && day(year, month, 1) <= from(min)}><Icon name="arrowLeft" /></IconButton>
      <strong id={id} aria-live="polite">{monthLabel}</strong>
      <IconButton label="Next month" size="sm" onClick={() => moveMonth(1)} disabled={!!max && day(year, month + 1, 1) > from(max)}><Icon name="arrowRight" /></IconButton>
    </div>
    <table className="calendar-grid" aria-labelledby={id} role="grid">
      <thead><tr>{days.slice(0, 7).map((date) => <th key={+date} scope="col">{weekdayFormat.format(date)}</th>)}</tr></thead>
      <tbody>{Array.from({ length: 6 }, (_, week) => <tr key={week}>
        {days.slice(week * 7, week * 7 + 7).map((date) => <td key={+date} aria-selected={same(date, selected)}>
          <button type="button" className="calendar-day" aria-label={dateFormat.format(date)} aria-current={same(date, today) ? 'date' : undefined}
            data-outside={date.getMonth() !== month || undefined} disabled={!!unavailable(date)}
            tabIndex={same(date, focused) ? 0 : -1} ref={(button) => {
              if (button && focusRequest.current === +date) { focusRequest.current = undefined; button.focus(); }
            }} onClick={() => { select(date); move(date, true); }} onKeyDown={(event) => {
              const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
              const offset = (date.getDay() - weekStartsOn + 7) % 7;
              const offsets: Record<string, number> = {
                ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7, Home: -offset, End: 6 - offset,
              };
              if (Object.hasOwn(offsets, event.key)) {
                event.preventDefault();
                move(from(date, offsets[event.key]), true);
              } else if (event.key === 'PageUp' || event.key === 'PageDown') {
                event.preventDefault();
                moveMonth((event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1), true);
              }
            }}>{date.getDate()}</button>
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>;
});

export interface DatePickerProps extends CalendarProps { placeholder?: string; label?: string }
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { value, defaultValue, onValueChange, locale, min, max, weekStartsOn, placeholder = 'Choose a date',
    label = 'Calendar', className, ...props }, ref,
) {
  const [selected, select] = useControllable<Date | undefined>(value, defaultValue, (date) => { if (date) onValueChange?.(date); });
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  return <Popover {...props} ref={(node) => { root.current = node; assignRef(ref, node); }} label={label} className={cx('date-picker', className)} open={open} onOpenChange={setOpen}
    trigger={selected ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(selected) : placeholder}>
    <Calendar value={selected} locale={locale} weekStartsOn={weekStartsOn} min={min} max={max}
      onValueChange={(date) => {
        select(date);
        root.current?.querySelector<HTMLElement>('button[aria-haspopup="dialog"]')?.focus();
        setOpen(false);
      }} />
  </Popover>;
});
