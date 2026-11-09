import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { ThemeProvider, ThemeSwitch, ThemeToggle, themeScript, useTheme } from '../src/react/index.js';

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return <><output>{theme}/{resolvedTheme}</output>
    <button onClick={() => setTheme('light')}>Light</button>
    <button onClick={() => setTheme('system')}>Auto</button></>;
}

test('stores a preference, updates the root, and reads it back on remount', async () => {
  const user = userEvent.setup();
  const first = render(<ThemeProvider><Probe /></ThemeProvider>);
  await user.click(screen.getByRole('button', { name: 'Light' }));
  expect(localStorage.getItem('utkristi-theme')).toBe('light');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(document.documentElement).toHaveClass('light');
  first.unmount();
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByText('light/light')).toBeInTheDocument();
});

test('system follows media changes', async () => {
  const user = userEvent.setup();
  const media = new EventTarget() as EventTarget & { matches: boolean };
  media.matches = true;
  vi.mocked(window.matchMedia).mockReturnValue(media as unknown as MediaQueryList);
  render(<ThemeProvider><Probe /></ThemeProvider>);
  await user.click(screen.getByRole('button', { name: 'Auto' }));
  expect(screen.getByText('system/light')).toBeInTheDocument();
  act(() => { media.matches = false; media.dispatchEvent(new Event('change')); });
  expect(screen.getByText('system/dark')).toBeInTheDocument();
});

test('falls back to Night when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByText('dark/dark')).toBeInTheDocument();
});

test('Glass persists, applies before paint, and can be left from the toggle', async () => {
  const user = userEvent.setup();
  render(<ThemeProvider><ThemeSwitch /><ThemeToggle /></ThemeProvider>);
  await user.click(screen.getByRole('radio', { name: 'Glass' }));
  expect(localStorage.getItem('utkristi-theme')).toBe('glass');
  expect(document.documentElement).toHaveAttribute('data-theme', 'glass');
  expect(document.documentElement).toHaveClass('glass');
  document.documentElement.removeAttribute('data-theme');
  new Function(themeScript())();
  expect(document.documentElement).toHaveAttribute('data-theme', 'glass');
  await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(document.documentElement).not.toHaveClass('glass');
});
