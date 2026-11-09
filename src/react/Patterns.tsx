import { useId, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type VideoHTMLAttributes } from 'react';
import { Button, type ButtonProps } from './Button.js';
import { Input } from './Field.js';
import { Popover, type PopoverProps } from './Overlays.js';
import { cx } from './utils/cx.js';

export interface BannerProps extends HTMLAttributes<HTMLElement> {
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  sticky?: boolean;
}
export function Banner({ action, onDismiss, dismissLabel = 'Dismiss banner', sticky, className, children, ...props }: BannerProps) {
  return <aside {...props} data-sticky={sticky || undefined} className={cx('kit-banner', className)}>
    <div>{children}</div>{action}
    {onDismiss && <Button size="sm" variant="quiet" aria-label={dismissLabel} onClick={onDismiss}>×</Button>}
  </aside>;
}

export interface PatternLink { label: ReactNode; href: string; active?: boolean; icon?: ReactNode }
export interface BottomNavigationProps extends HTMLAttributes<HTMLElement> { items: readonly PatternLink[]; fixed?: boolean }
export function BottomNavigation({ items, fixed, className, ...props }: BottomNavigationProps) {
  return <nav aria-label="Quick navigation" {...props} data-fixed={fixed || undefined} className={cx('bottom-nav', className)}>
    {items.map(({ href, label, active, icon }) => <a key={href} href={href} aria-current={active ? 'page' : undefined}>
      {icon && <span aria-hidden="true">{icon}</span>}<span>{label}</span>
    </a>)}
  </nav>;
}

export type ClipboardButtonProps = Omit<Extract<ButtonProps, { href?: undefined }>, 'onClick' | 'value'> & {
  text: string;
  copiedLabel?: string;
  errorLabel?: string;
};
export function ClipboardButton({ text, children = 'Copy', copiedLabel = 'Copied', errorLabel = 'Could not copy', ...props }: ClipboardButtonProps) {
  const [feedback, setFeedback] = useState<{ text: string; message: string }>();
  return <><Button {...props} onClick={async () => {
    try { await navigator.clipboard.writeText(text); setFeedback({ text, message: copiedLabel }); }
    catch { setFeedback({ text, message: errorLabel }); }
  }}>{children}</Button><span className="clipboard-feedback" role="status">{feedback?.text === text ? feedback.message : ''}</span></>;
}

export interface DeviceMockupProps extends HTMLAttributes<HTMLDivElement> { device?: 'phone' | 'tablet' | 'desktop' }
export function DeviceMockup({ device = 'phone', className, children, ...props }: DeviceMockupProps) {
  return <div {...props} className={cx('device-frame', className)} data-device={device}>
    <div className="device-screen">{children}</div>
  </div>;
}

export type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue'>;
export function FileInput({ className, ...props }: FileInputProps) {
  return <Input {...props} type="file" className={cx('file-input', className)} />;
}

export interface FileDropzoneProps {
  label?: string;
  description?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /** Receives the files from a drop or the native picker. The app handles upload and validation. */
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ label = 'Choose files', description = 'Or drag files here.', multiple, disabled, className, onFiles }: FileDropzoneProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  function pick(files: FileList | null) {
    if (disabled || !files?.length) return;
    onFiles(multiple ? Array.from(files) : [files[0]]);
  }
  return <div className={cx('file-dropzone', className)} data-dragging={dragging && !disabled || undefined}
    onDragEnter={(event) => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      depth.current++;
      setDragging(true);
    }}
    onDragOver={(event) => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    }}
    onDragLeave={() => {
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setDragging(false);
    }}
    onDrop={(event) => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      pick(event.dataTransfer.files);
    }}>
    <input hidden ref={input} type="file" multiple={multiple} disabled={disabled} onChange={(event) => {
      pick(event.currentTarget.files);
      event.currentTarget.value = '';
    }} />
    <Button variant="ghost" disabled={disabled} aria-describedby={id} onClick={() => input.current?.click()}>{label}</Button>
    <span id={id} className="muted">{description}</span>
  </div>;
}

export type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export function NumberInput(props: NativeInputProps) { return <Input {...props} type="number" />; }
export function PhoneInput(props: NativeInputProps) { return <Input autoComplete="tel" {...props} type="tel" />; }
export function TimeInput(props: NativeInputProps) { return <Input {...props} type="time" />; }

export interface FloatingInputProps extends Omit<NativeInputProps, 'placeholder'> { label: string }
export function FloatingInput({ id, label, className, ...props }: FloatingInputProps) {
  const generated = useId();
  const controlId = id ?? generated;
  return <div className={cx('floating-field', className)}>
    <Input {...props} id={controlId} type="text" placeholder=" " />
    <label htmlFor={controlId}>{label}</label>
  </div>;
}

export interface GalleryProps extends HTMLAttributes<HTMLDivElement> { columns?: 2 | 3 | 4 }
export function Gallery({ columns = 3, className, ...props }: GalleryProps) {
  return <div {...props} className={cx('media-gallery', className)} data-columns={columns} />;
}

export interface JumbotronProps extends HTMLAttributes<HTMLElement> { eyebrow?: ReactNode; actions?: ReactNode }
export function Jumbotron({ eyebrow, actions, children, className, ...props }: JumbotronProps) {
  return <section {...props} className={cx('jumbotron', className)}>
    {eyebrow && <div className="label">{eyebrow}</div>}{children}
    {actions && <div className="jumbotron-actions">{actions}</div>}
  </section>;
}

export function ListGroup({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul {...props} className={cx('list-group', className)} />;
}

export interface MegaMenuProps extends Omit<PopoverProps, 'children'> { columns: readonly { title: string; links: readonly PatternLink[] }[] }
export function MegaMenu({ columns, className, ...props }: MegaMenuProps) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const changeOpen = (shown: boolean) => { setOpen(shown); props.onOpenChange?.(shown); };
  return <Popover {...props} open={props.open ?? open} onOpenChange={changeOpen} className={cx('mega-menu', className)}>
    <div className="mega-menu-grid">{columns.map(({ title, links }) => <div key={title}>
      <p className="label">{title}</p>
      <ul>{links.map(({ href, label, active, icon }) => <li key={href}>
        <a className="menu-item" href={href} aria-current={active ? 'page' : undefined} onClick={() => changeOpen(false)}>{icon}{label}</a>
      </li>)}</ul>
    </div>)}</div>
  </Popover>;
}

export interface QRCodeProps {
  /** Square module matrix supplied by a QR encoder, without the quiet zone. */
  matrix: readonly (readonly boolean[])[];
  label: string;
  size?: number;
  className?: string;
}
export function QRCode({ matrix, label, size = 128, className }: QRCodeProps) {
  const extent = matrix.length + 8;
  const path = matrix.map((row, y) => row.map((filled, x) => filled ? `M${x + 4} ${y + 4}h1v1h-1Z` : '').join('')).join('');
  return <svg role="img" aria-label={label} width={size} height={size} viewBox={`0 0 ${extent} ${extent}`}
    className={cx('qr-code', className)} shapeRendering="crispEdges">
    <rect width={extent} height={extent} fill="white" /><path d={path} fill="black" />
  </svg>;
}

export interface RatingProps extends HTMLAttributes<HTMLSpanElement> { value: number; max?: number; label?: string }
export function Rating({ value, max = 5, label, className, ...props }: RatingProps) {
  const total = Math.max(1, Math.min(10, Number.isFinite(max) ? Math.floor(max) : 5));
  const score = Number.isFinite(value) ? Math.min(total, Math.max(0, value)) : 0;
  return <span {...props} role="img" aria-label={label ?? `${score} out of ${total} stars`} className={cx('star-rating', className)}>
    {Array.from({ length: total }, (_, index) => <span key={index} className="star-rating-icon" aria-hidden="true">
      ☆<span style={{ inlineSize: `${Math.min(1, Math.max(0, score - index)) * 100}%` }}>★</span>
    </span>)}
  </span>;
}

export interface SpeedDialProps extends PopoverProps { placement?: 'above' | 'below' | 'fixed' }
export function SpeedDial({ placement = 'above', className, ...props }: SpeedDialProps) {
  return <Popover {...props} align={props.align ?? (placement === 'fixed' ? 'end' : 'start')}
    data-placement={placement} className={cx('speed-dial', className)} />;
}

export interface TimelineEntry { id: string; title: ReactNode; date?: string; dateLabel?: string; detail?: ReactNode }
export interface TimelineProps extends HTMLAttributes<HTMLOListElement> { entries: readonly TimelineEntry[]; orientation?: 'vertical' | 'horizontal' }
export function Timeline({ entries, orientation = 'vertical', className, ...props }: TimelineProps) {
  return <ol {...props} data-orientation={orientation} className={cx('activity-timeline', className)}>
    {entries.map(({ id, title, date, dateLabel, detail }) => <li key={id}>
      {date && <time dateTime={date}>{dateLabel ?? date}</time>}<strong>{title}</strong>
      {detail && <div>{detail}</div>}
    </li>)}
  </ol>;
}

export function VideoPlayer({ className, controls = true, ...props }: VideoHTMLAttributes<HTMLVideoElement>) {
  // Consumers supply language-appropriate caption tracks with their video source.
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video {...props} controls={controls} className={cx('kit-video', className)} />;
}
