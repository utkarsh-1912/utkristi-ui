'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { CSSVariables } from './cx.js';

const a11yAttributes = ['contrast', 'motion', 'density', 'text', 'focus', 'font', 'links'].map((name) => `data-ut-a11y-${name}`);

export function Portal({ children }: { children: ReactNode }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [appearance, setAppearance] = useState<{ theme?: string; preset?: string; radius?: string; motion?: string; density?: string; direction?: string; scoped: boolean; a11y: Record<string, string> }>();

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const update = () => {
      const theme = element.closest<HTMLElement>('[data-theme]')?.dataset.theme;
      const preset = element.closest<HTMLElement>('[data-ut-preset]')?.dataset.utPreset;
      const motion = element.closest<HTMLElement>('[data-ut-motion]')?.dataset.utMotion;
      const density = element.closest<HTMLElement>('[data-ut-density]')?.dataset.utDensity;
      const direction = element.closest<HTMLElement>('[dir]')?.dir;
      const scoped = !!element.closest('[data-ut-scope]');
      const radius = getComputedStyle(element).getPropertyValue('--ut-shape-radius').trim() || undefined;
      const a11y = Object.fromEntries(a11yAttributes.flatMap((name) => {
        const value = element.closest(`[${name}]`)?.getAttribute(name);
        return value == null ? [] : [[name, value]];
      }));
      setAppearance((current) => current && current.theme === theme && current.preset === preset && current.radius === radius &&
        current.motion === motion && current.density === density && current.direction === direction && current.scoped === scoped &&
        a11yAttributes.every((name) => current.a11y[name] === a11y[name]) ? current : { theme, preset, radius, motion, density, direction, scoped, a11y });
    };
    const observer = new MutationObserver(update);
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['data-theme', 'data-ut-preset', 'data-ut-radius', 'data-ut-motion', 'data-ut-density', 'data-ut-scope', 'dir', 'style', 'class', ...a11yAttributes] });
    }
    update();
    return () => observer.disconnect();
  }, []);

  return <>
    <span ref={marker} hidden aria-hidden="true" />
    {appearance && createPortal(
      <div className={appearance.a11y['data-ut-a11y-motion'] ? 'ut-portal ut-a11y-scope' : 'ut-portal'} {...appearance.a11y} data-theme={appearance.theme} data-ut-preset={appearance.preset} data-ut-motion={appearance.motion}
        data-ut-scope={appearance.scoped ? '' : undefined} data-ut-density={appearance.density} dir={appearance.direction}
        style={{ '--ut-shape-radius': appearance.radius } as CSSVariables}>{children}</div>,
      marker.current?.closest('dialog[open]') ?? marker.current?.ownerDocument.body ?? document.body,
    )}
  </>;
}
