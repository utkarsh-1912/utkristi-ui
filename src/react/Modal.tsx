import { forwardRef, useRef, type FormEventHandler, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { IconButton } from './Button.js';
import { Icon } from './icons.js';
import { assignRef, cx } from './utils/cx.js';
import { useDialogFocus } from './utils/focus.js';
import { Portal } from './utils/Portal.js';
import { useId } from './utils/useId.js';
import { useScrollLock } from './utils/useScrollLock.js';

export interface ModalProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  description?: ReactNode;
  label?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  backdropClassName?: string;
  handle?: ReactNode;
  dismissOnBackdrop?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  initialFocus?: RefObject<HTMLElement>;
}

const ModalContent = forwardRef<HTMLElement, Omit<ModalProps, 'open'>>(function ModalContent(
  { onClose, title, description, label, footer, handle, wide, onSubmit, initialFocus, backdropClassName, dismissOnBackdrop = true, className, children, ...props }, ref,
) {
  const scope = useRef<HTMLElement | null>(null);
  const id = useId();
  useDialogFocus(scope, onClose, initialFocus);
  const setRef = (element: HTMLElement | null) => { scope.current = element; assignRef(ref, element); };
  const content = <>
    {handle}
    <div className="modal-head">
      <div>
        {label != null && <span className="label">{label}</span>}
        <h3 className="modal-title" id={`${id}-title`}>{title}</h3>
        {description != null && <p className="modal-desc" id={`${id}-desc`}>{description}</p>}
      </div>
      {onClose && <IconButton label="Close" onClick={onClose}><Icon name="close" size={20} /></IconButton>}
    </div>
    {children != null && <div className="modal-body">{children}</div>}
    {footer != null && <div className="modal-foot">{footer}</div>}
  </>;
  const dialog = {
    ...props,
    role: props.role ?? 'dialog',
    'aria-modal': true as const,
    'aria-labelledby': `${id}-title`,
    'aria-describedby': description != null ? `${id}-desc` : props['aria-describedby'],
    tabIndex: -1,
    className: cx('modal', wide && 'modal-wide', className),
  };
  return <div className={cx('modal-backdrop', backdropClassName)} role="presentation" onMouseDown={(event) => {
    if (dismissOnBackdrop && event.target === event.currentTarget) onClose?.();
  }}>
    {onSubmit
      ? <form {...dialog} ref={setRef} onSubmit={(event) => { event.preventDefault(); onSubmit(event); }}>{content}</form>
      : <div {...dialog} ref={setRef}>{content}</div>}
  </div>;
});

export const Modal = forwardRef<HTMLElement, ModalProps>(function Modal({ open, ...props }, ref) {
  useScrollLock(open);
  return open ? <Portal><ModalContent {...props} ref={ref} /></Portal> : null;
});
export const Dialog = Modal;
