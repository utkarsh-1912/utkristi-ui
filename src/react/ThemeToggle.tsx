import { forwardRef } from 'react';
import { IconButton, type IconButtonProps } from './Button.js';
import { Icon } from './icons.js';
import { Segmented, type SegmentedProps } from './Segmented.js';
import { useTheme, type Theme } from './theme/ThemeProvider.js';

export const ThemeToggle = forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'label'>>(function ThemeToggle({ onClick, ...props }, ref) {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : resolvedTheme === 'light' ? 'glass' : 'dark';
  return <IconButton {...props} ref={ref} label={`Switch to ${next} theme`} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented) setTheme(next);
  }}><Icon name={next === 'glass' ? 'layers' : next === 'light' ? 'sun' : 'moon'} size={18} /></IconButton>;
});

const items = [{ id: 'dark', label: 'Dark' }, { id: 'light', label: 'Light' }, { id: 'glass', label: 'Glass' }, { id: 'system', label: 'Auto' }];
export const ThemeSwitch = forwardRef<HTMLDivElement, Omit<SegmentedProps, 'items' | 'value' | 'defaultValue' | 'onChange'>>(
  function ThemeSwitch(props, ref) {
    const { theme, setTheme } = useTheme();
    return <Segmented aria-label="Theme" {...props} ref={ref} items={items} value={theme} onChange={(value) => setTheme(value as Theme)} />;
  },
);
