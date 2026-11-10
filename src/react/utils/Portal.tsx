import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { CSSVariables } from './cx.js';

export function Portal({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [appearance, setAppearance] = useState<{ theme?: string; preset?: string; radius?: string; motion?: string }>();

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const update = () => {
      const theme = element.closest<HTMLElement>('[data-theme]')?.dataset.theme;
      const preset = element.closest<HTMLElement>('[data-ut-preset]')?.dataset.utPreset;
      const motion = element.closest<HTMLElement>('[data-ut-motion]')?.dataset.utMotion;
      const radius = getComputedStyle(element).getPropertyValue('--ut-shape-radius').trim() || undefined;
      setAppearance((current) => current && current.theme === theme && current.preset === preset && current.radius === radius && current.motion === motion
        ? current : { theme, preset, radius, motion });
    };
    const observer = new MutationObserver(update);
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['data-theme', 'data-ut-preset', 'data-ut-radius', 'data-ut-motion', 'style', 'class'] });
    }
    update();
    return () => observer.disconnect();
  }, []);

  return <>
    <span ref={marker} hidden aria-hidden="true" />
    {appearance && createPortal(
      <div className="ut-portal" data-theme={appearance.theme} data-ut-preset={appearance.preset} data-ut-motion={appearance.motion}
        style={{ '--ut-shape-radius': appearance.radius } as CSSVariables}>{children}</div>,
      document.body,
    )}
  </>;
}
