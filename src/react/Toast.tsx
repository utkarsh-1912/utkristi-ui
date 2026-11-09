import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type HTMLAttributes, type ReactNode } from 'react';
import { Badge, type Tone } from './Badge.js';
import { Button, IconButton } from './Button.js';
import { Icon } from './icons.js';
import { cx } from './utils/cx.js';
import { Portal } from './utils/Portal.js';
import { useId } from './utils/useId.js';

export interface ToastOptions {
  title: ReactNode;
  body?: ReactNode;
  tone?: Tone;
  action?: { label: ReactNode; onClick: () => void };
  duration?: number;
}
interface ToastEntry extends ToastOptions { id: string }
interface ToastContextValue { show: (toast: ToastOptions) => string; dismiss: (id: string) => void }
const ToastContext = createContext<ToastContextValue | null>(null);

function ToastMessage({ entry, dismiss }: { entry: ToastEntry; dismiss: ToastContextValue['dismiss'] }) {
  const { id, title, body, tone = 'neutral', action, duration = 5000 } = entry;
  const [hovered, hover] = useState(false);
  const [focused, focus] = useState(false);
  const remaining = useRef(duration);
  const track = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (duration <= 0 || hovered || focused) return;
    const start = performance.now();
    let frame = 0;
    function update(now: number) {
      track.current?.style.setProperty('--p', String(Math.max(0, remaining.current - (now - start)) / duration));
      frame = requestAnimationFrame(update);
    }
    const timeout = window.setTimeout(() => dismiss(id), remaining.current);
    frame = requestAnimationFrame(update);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      remaining.current = Math.max(0, remaining.current - (performance.now() - start));
    };
  }, [dismiss, duration, focused, hovered, id]);
  return <div className="toast" onMouseEnter={() => hover(true)} onMouseLeave={() => hover(false)}
    onFocus={() => focus(true)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) focus(false);
    }}>
    <div role={tone === 'bad' ? 'alert' : 'status'} aria-live={tone === 'bad' ? 'assertive' : 'polite'} aria-atomic="true">
      {tone !== 'neutral' && <Badge tone={tone} aria-hidden="true">{tone}</Badge>}
      <div className="toast-title">{title}</div>
      {body != null && <div className="toast-body">{body}</div>}
    </div>
    <div className="toast-actions">
      {action && <Button size="sm" variant="ghost" onClick={() => { dismiss(id); action.onClick(); }}>{action.label}</Button>}
      <IconButton label="Dismiss notification" size="sm" onClick={() => dismiss(id)}><Icon name="close" /></IconButton>
    </div>
    {duration > 0 && <span ref={track} className="toast-track" aria-hidden="true" />}
  </div>;
}

export const ToastProvider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ToastProvider(
  { children, className, ...props }, ref,
) {
  const prefix = useId();
  const counter = useRef(0);
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const show = useCallback((toast: ToastOptions) => {
    const id = `${prefix}-${++counter.current}`;
    setEntries((current) => [...current, { ...toast, id }]);
    return id;
  }, [prefix]);
  const dismiss = useCallback((id: string) => setEntries((current) => current.filter((entry) => entry.id !== id)), []);
  const context = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return <ToastContext.Provider value={context}>
    {children}
    <Portal><div {...props} ref={ref} className={cx('toast-region', className)}>
      {entries.map((entry) => <ToastMessage key={entry.id} entry={entry} dismiss={dismiss} />)}
    </div></Portal>
  </ToastContext.Provider>;
});

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast requires a ToastProvider');
  return context;
}
