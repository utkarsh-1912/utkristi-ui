import { forwardRef, type SelectHTMLAttributes } from 'react';
import { IconButton, type IconButtonProps } from './Button.js';
import { Select } from './Field.js';
import { ControlIcon } from './ControlIcon.js';
import { LayersIconData } from './icons/generated/LayersIcon.js';
import { MoonIconData } from './icons/generated/MoonIcon.js';
import { SunIconData } from './icons/generated/SunIcon.js';
import { Segmented, type SegmentedProps } from './Segmented.js';
import { useTheme } from './theme/ThemeProvider.js';
import { themeIds, themes, type Theme } from './theme/themes.js';

export const ThemeToggle = forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'label'>>(function ThemeToggle({ onClick, ...props }, ref) {
  const { resolvedTheme, setTheme } = useTheme();
  const next = themes[(themeIds.indexOf(resolvedTheme) + 1) % themes.length];
  const glyph = next.id === 'dark' ? MoonIconData : next.id === 'light' ? SunIconData : LayersIconData;
  return <IconButton {...props} ref={ref} label={`Switch to ${next.label} theme`} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented) setTheme(next.id);
  }}><ControlIcon glyph={glyph} size={18} /></IconButton>;
});

const items = [...themes.map(({ id, label }) => ({ id, label })), { id: 'system', label: 'Auto' }];
export const ThemeSwitch = forwardRef<HTMLDivElement, Omit<SegmentedProps, 'items' | 'value' | 'defaultValue' | 'onChange'>>(
  function ThemeSwitch(props, ref) {
    const { theme, setTheme } = useTheme();
    return <Segmented aria-label="Theme" {...props} ref={ref} items={items} value={theme} onChange={(value) => setTheme(value as Theme)} />;
  },
);

export type ThemeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'multiple' | 'size' | 'value' | 'defaultValue'>;

export const ThemeSelect = forwardRef<HTMLSelectElement, ThemeSelectProps>(function ThemeSelect(
  { onChange, 'aria-label': label = 'Theme', ...props }, ref,
) {
  const { theme, setTheme } = useTheme();
  return <Select {...props} ref={ref} aria-label={label} value={theme} onChange={(event) => {
    onChange?.(event);
    if (!event.defaultPrevented) setTheme(event.target.value as Theme);
  }}>
    {themes.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
    <option value="system">System</option>
  </Select>;
});
