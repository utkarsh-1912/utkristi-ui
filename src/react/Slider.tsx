import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { useId } from './utils/useId.js';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'min' | 'max' | 'step' | 'value' | 'defaultValue' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number | 'any';
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  marks?: number[];
  format?: (value: number) => string | number;
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { min = 0, max = 100, step = 1, value, defaultValue = (min + max) / 2, onChange, marks = [], format = String,
    label, id, className, style, ...props }, ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [current, select] = useControllable(value, defaultValue, onChange);
  const normalize = (input: number) => {
    const rounded = step === 'any' ? input : Number((min + Math.round((input - min) / step) * step).toPrecision(14));
    return Math.max(min, Math.min(max, rounded));
  };
  const position = (input: number) => max > min ? (normalize(input) - min) / (max - min) : 0;
  const selected = normalize(current);
  const percent = position(selected);
  return <div className={cx('slider', className)} style={{ '--p': `${100 * percent}%`, '--pn': percent, ...style } as CSSVariables}>
    <div className="slider-rail">
      <input {...props} ref={ref} id={inputId} type="range" min={min} max={max} step={step} value={selected}
        aria-label={props['aria-label'] ?? label} aria-valuetext={String(format(selected))}
        onChange={(event) => select(event.currentTarget.valueAsNumber)} />
      <output className="slider-bubble" htmlFor={inputId} aria-hidden="true">{format(selected)}</output>
    </div>
    {marks.length > 0 && <div className="slider-marks">
      {marks.filter((mark) => mark >= min && mark <= max).map((mark) => <button key={mark} type="button" tabIndex={-1}
        disabled={props.disabled} className={cx(normalize(mark) === selected && 'is-active')}
        style={{ '--ut-mark-position': `${100 * position(mark)}%` } as CSSVariables}
        onClick={() => select(normalize(mark))}>{format(mark)}</button>)}
    </div>}
  </div>;
});
