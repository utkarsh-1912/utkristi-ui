'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { isTheme, themeIds, type ResolvedTheme, type Theme } from './themes.js';

export { themes, themeIds, themeLabel, isTheme, isResolvedTheme, iconThemeKey, type ResolvedTheme, type Theme } from './themes.js';
interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const storage = 'utkristi-theme';
const mediaQuery = '(prefers-color-scheme: light)';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string | null;
  target?: HTMLElement | (() => HTMLElement | null) | null;
  forcedTheme?: ResolvedTheme;
}

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = storage, target, forcedTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme);
  const [loadedKey, setLoadedKey] = useState<string | null>();
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');
  const resolvedTheme = forcedTheme ?? (theme === 'system' ? systemTheme : theme);

  useEffect(() => {
    let preference: string | null = null;
    try { if (storageKey !== null) preference = localStorage.getItem(storageKey); } catch { /* Storage can be blocked. */ }
    setTheme(isTheme(preference) ? preference : defaultTheme);
    setLoadedKey(storageKey);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia?.(mediaQuery);
    if (!media) return;
    const sync = () => setSystemTheme(media.matches ? 'light' : 'dark');
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [theme]);

  useEffect(() => {
    if (loadedKey !== storageKey) return;
    const element = typeof target === 'function' ? target() : target === undefined ? document.documentElement : target;
    if (!element) return;
    element.dataset.theme = resolvedTheme;
    for (const id of themeIds) element.classList.toggle(id, id === resolvedTheme);
  }, [loadedKey, resolvedTheme, storageKey, target]);

  return <ThemeContext.Provider value={{ theme: forcedTheme ?? theme, resolvedTheme, setTheme(next) {
    setTheme(next);
    try { if (storageKey !== null && !forcedTheme) localStorage.setItem(storageKey, next); } catch { /* Storage can be blocked. */ }
  } }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme requires a ThemeProvider');
  return context;
}

export function themeScript(key = storage) {
  const literal = JSON.stringify(key).replace(/</g, '\\u003c');
  const ids = JSON.stringify(themeIds);
  return `(()=>{let t;try{t=localStorage.getItem(${literal})}catch{}const a=${ids};const d=t==="system"?(window.matchMedia?.("${mediaQuery}").matches?"light":"dark"):a.includes(t)?t:"dark";const e=document.documentElement;e.dataset.theme=d;for(const n of a)e.classList.toggle(n,n===d)})()`;
}
