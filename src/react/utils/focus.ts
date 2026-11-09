import { useEffect, useRef, type RefObject } from 'react';

const focusable = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable="true"]';
const dialogs: HTMLElement[] = [];

export function useDialogFocus(
  scope: RefObject<HTMLElement>,
  onClose: (() => void) | undefined,
  initialFocus?: RefObject<HTMLElement>,
) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const previous = document.activeElement;
    const stops = () => Array.from(root.querySelectorAll<HTMLElement>(focusable)).filter(
      (element) => element.tabIndex >= 0 && !element.matches(':disabled, [aria-disabled="true"]') &&
        !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
        getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'none',
    );
    dialogs.push(root);
    const initial = initialFocus?.current;
    (initial && root.contains(initial) ? initial : stops()[0] ?? root).focus();

    function handleKey(event: KeyboardEvent) {
      if (dialogs.at(-1) !== root || event.defaultPrevented) return;
      if (event.key === 'Escape' && close.current) {
        event.preventDefault();
        close.current();
      }
      if (event.key !== 'Tab') return;
      const items = stops();
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (index === -1 || (event.shiftKey ? index === 0 : index === items.length - 1)) {
        event.preventDefault();
        (items[event.shiftKey ? items.length - 1 : 0] ?? root)?.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      const wasTop = dialogs.at(-1) === root;
      dialogs.splice(dialogs.indexOf(root), 1);
      if (wasTop && previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [scope, initialFocus]);
}

export function navigationIndex(key: string, index: number, length: number) {
  if (!length) return;
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowUp': return (index - 1 + length) % length;
    case 'ArrowRight':
    case 'ArrowDown': return (index + 1) % length;
    case 'Home': return 0;
    case 'End': return length - 1;
  }
}
