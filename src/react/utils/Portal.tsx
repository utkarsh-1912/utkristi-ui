import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [theme, setTheme] = useState<string | null>();

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const update = () => setTheme(element.closest('[data-theme]')?.getAttribute('data-theme') ?? null);
    const observer = new MutationObserver(update);
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['data-theme'] });
    }
    update();
    return () => observer.disconnect();
  }, []);

  return <>
    <span ref={marker} hidden aria-hidden="true" />
    {theme !== undefined && createPortal(
      <div className="ut-portal" data-theme={theme ?? undefined}>{children}</div>,
      document.body,
    )}
  </>;
}
