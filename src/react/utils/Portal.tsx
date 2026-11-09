import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [appearance, setAppearance] = useState<{ theme?: string; preset?: string }>();

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const update = () => {
      const theme = element.closest<HTMLElement>('[data-theme]')?.dataset.theme;
      const preset = element.closest<HTMLElement>('[data-ut-preset]')?.dataset.utPreset;
      setAppearance((current) => current && current.theme === theme && current.preset === preset ? current : { theme, preset });
    };
    const observer = new MutationObserver(update);
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['data-theme', 'data-ut-preset'] });
    }
    update();
    return () => observer.disconnect();
  }, []);

  return <>
    <span ref={marker} hidden aria-hidden="true" />
    {appearance && createPortal(
      <div className="ut-portal" data-theme={appearance.theme} data-ut-preset={appearance.preset}>{children}</div>,
      document.body,
    )}
  </>;
}
