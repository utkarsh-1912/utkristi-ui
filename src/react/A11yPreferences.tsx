'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Checkbox } from './Choice.js';
import { Field, Select } from './Field.js';
import { Button } from './Button.js';
import { useId } from './utils/useId.js';

export interface A11yPreferences {
  contrast: 'system' | 'more';
  motion: 'system' | 'reduce';
  density: 'comfortable' | 'compact';
  textScale: 100 | 125 | 150 | 175 | 200;
  focusRing: 'default' | 'strong';
  readableFont: boolean;
  underlineLinks: boolean;
}

const defaults: A11yPreferences = {
  contrast: 'system', motion: 'system', density: 'comfortable', textScale: 100,
  focusRing: 'default', readableFont: false, underlineLinks: false,
};
const scales = [100, 125, 150, 175, 200] as const;
const preferencesContext = createContext<{
  preferences: A11yPreferences; setPreferences: (value: Partial<A11yPreferences>) => void; reset: () => void;
} | null>(null);

function readPreferences(key: string | null): A11yPreferences {
  if (key === null) return defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
    return {
      contrast: saved.contrast === 'more' ? 'more' : 'system',
      motion: saved.motion === 'reduce' ? 'reduce' : 'system',
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      textScale: scales.includes(saved.textScale) ? saved.textScale : 100,
      focusRing: saved.focusRing === 'strong' ? 'strong' : 'default',
      readableFont: saved.readableFont === true,
      underlineLinks: saved.underlineLinks === true,
    };
  } catch {
    return defaults;
  }
}

export function A11yPreferencesProvider({ children, storageKey = 'utkristi-a11y' }: { children: ReactNode; storageKey?: string | null }) {
  const [preferences, setValue] = useState(defaults);
  const [loadedKey, setLoadedKey] = useState<string | null>();
  useEffect(() => {
    setValue(readPreferences(storageKey));
    setLoadedKey(storageKey);
  }, [storageKey]);
  useEffect(() => {
    if (loadedKey !== storageKey || storageKey === null) return;
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Storage can be blocked. */ }
  }, [loadedKey, storageKey, preferences]);
  return <preferencesContext.Provider value={{ preferences,
    setPreferences: (value) => setValue((current) => ({ ...current, ...value })), reset: () => setValue(defaults) }}>
    <div className="ut-a11y-scope" data-ut-a11y-contrast={preferences.contrast} data-ut-a11y-motion={preferences.motion}
      data-ut-a11y-density={preferences.density} data-ut-a11y-text={preferences.textScale}
      data-ut-a11y-focus={preferences.focusRing} data-ut-a11y-font={preferences.readableFont || undefined}
      data-ut-a11y-links={preferences.underlineLinks || undefined}>{children}</div>
  </preferencesContext.Provider>;
}

export function useA11yPreferences() {
  const context = useContext(preferencesContext);
  if (!context) throw new Error('useA11yPreferences requires an A11yPreferencesProvider');
  return context;
}

export function A11yPanel() {
  const { preferences, setPreferences, reset } = useA11yPreferences();
  const previewId = useId();
  return <fieldset className="ut-a11y-panel">
    <legend>Accessibility preferences</legend>
    <Checkbox label="Increase contrast" checked={preferences.contrast === 'more'} onChange={(event) => setPreferences({ contrast: event.currentTarget.checked ? 'more' : 'system' })} />
    <Checkbox label="Reduce motion" checked={preferences.motion === 'reduce'} onChange={(event) => setPreferences({ motion: event.currentTarget.checked ? 'reduce' : 'system' })} />
    <Checkbox label="Compact controls" checked={preferences.density === 'compact'} onChange={(event) => setPreferences({ density: event.currentTarget.checked ? 'compact' : 'comfortable' })} />
    <Checkbox label="Stronger focus ring" checked={preferences.focusRing === 'strong'} onChange={(event) => setPreferences({ focusRing: event.currentTarget.checked ? 'strong' : 'default' })} />
    <Checkbox label="Readable font" checked={preferences.readableFont} onChange={(event) => setPreferences({ readableFont: event.currentTarget.checked })} />
    <Checkbox label="Underline links" checked={preferences.underlineLinks} onChange={(event) => setPreferences({ underlineLinks: event.currentTarget.checked })} />
    <Field label="Text scale"><Select value={preferences.textScale} onChange={(event) => setPreferences({ textScale: Number(event.target.value) as A11yPreferences['textScale'] })}>
      {scales.map((value) => <option value={value} key={value}>{value}%</option>)}
    </Select></Field>
    <Button variant="ghost" size="sm" onClick={reset}>Reset preferences</Button>
    <p className="muted">Preview your settings on <a href={`#${previewId}`} onClick={(event) => {
      event.preventDefault();
      document.getElementById(previewId)?.focus();
    }}>this link</a> and the next control.</p>
    <Button id={previewId} type="button">Preview focus</Button>
  </fieldset>;
}
