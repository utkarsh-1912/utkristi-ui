import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import {
  deriveCustomPalette, Icon, iconHues, iconManifest, IconPalettePicker, IconPaletteProvider,
  iconPaletteScript, iconPaletteTable, IconTile, ThemeProvider, useIconPalette, wcagContrast,
} from '../src/react/index.js';

function toPascalCase(kebab: string) {
  return kebab.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('') + 'Icon';
}

test('every source SVG has a 24x24 viewBox, no raw hex colour, and no <style>', () => {
  expect(iconManifest.length).toBeGreaterThanOrEqual(256);
  for (const entry of iconManifest) {
    const svgPath = join('icons', 'source', `${entry.name}.svg`);
    expect(existsSync(svgPath), svgPath).toBe(true);
    const svg = readFileSync(svgPath, 'utf8');
    expect(svg, `${entry.name} viewBox`).toContain('viewBox="0 0 24 24"');
    expect(svg, `${entry.name} raw hex`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(svg, `${entry.name} <style>`).not.toMatch(/<style\b/i);
  }
});

test('every manifest entry has its line, filled, duotone, and 2.5D / 3D files when has3d is true', () => {
  for (const entry of iconManifest) {
    for (const style of ['line', 'filled', 'duotone'] as const) {
      expect(existsSync(join('dist', 'icons', 'svg', style, `${entry.name}.svg`)), `${entry.name} ${style}`).toBe(true);
    }
    expect(existsSync(join('src', 'react', 'icons', 'generated', `${toPascalCase(entry.name)}.tsx`)), entry.name).toBe(true);
    if (entry.has3d) {
      expect(existsSync(join('dist', 'icons', 'svg', '2.5d', `${entry.name}.svg`)), `${entry.name} 2.5d`).toBe(true);
      expect(existsSync(join('icons', '3d', 'render', 'night', 'blue', `${entry.name}@1x.png`)), `${entry.name} night 3d`).toBe(true);
      expect(existsSync(join('icons', '3d', 'render', 'paper', 'blue', `${entry.name}@1x.png`)), `${entry.name} paper 3d`).toBe(true);
      expect(existsSync(join('icons', '3d', 'render', 'glass', 'lime', `${entry.name}@1x.png`)), `${entry.name} glass 3d`).toBe(true);
    }
  }
  expect(existsSync(join('dist', 'icons', 'sprite.svg'))).toBe(true);
});

test('every palette stroke reaches >=3:1 against bg surfaces and every on reaches >=4.5:1 against base', () => {
  const surfaces = {
    night: { bg: '#0B0B0A', bg2: '#131311', raise: '#181816', ink: '#E8E6DF' },
    paper: { bg: '#F5F7FB', bg2: '#FCFDFF', raise: '#FFFFFF', ink: '#0E1A33' },
    glass: { bg: '#F7F4FB', bg2: '#FCFAFE', raise: '#FFFFFF', ink: '#202021' },
  } as const;

  for (const theme of ['night', 'paper', 'glass'] as const) {
    const surface = surfaces[theme];
    for (const hue of iconHues) {
      const roles = iconPaletteTable[theme][hue];
      if (theme === 'glass') {
        expect(roles.stroke, `glass ${hue} stroke must be ink`).toBe('var(--ut-ink)');
      }
      const strokeHex = roles.stroke === 'var(--ut-ink)' ? surface.ink : roles.stroke;
      expect(wcagContrast(strokeHex, surface.bg), `${theme} ${hue} stroke on bg`).toBeGreaterThanOrEqual(3);
      expect(wcagContrast(strokeHex, surface.bg2), `${theme} ${hue} stroke on bg-2`).toBeGreaterThanOrEqual(3);
      expect(wcagContrast(strokeHex, surface.raise), `${theme} ${hue} stroke on raise`).toBeGreaterThanOrEqual(3);
      expect(wcagContrast(roles.on, roles.base), `${theme} ${hue} on vs base`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test('<Icon label> renders role="img", without label is aria-hidden, and legacy camelCase names work', () => {
  render(
    <>
      <Icon name="bell" label="Notifications" />
      <Icon name="chevronDown" data-testid="legacy-chevron" />
      <Icon name="arrowLeft" data-testid="legacy-arrow" />
      <IconTile name="settings" hue="violet" size="lg" label="Workspace settings" />
    </>,
  );
  const labelled = screen.getByRole('img', { name: 'Notifications' });
  expect(labelled).not.toHaveAttribute('aria-hidden');
  expect(screen.getByTestId('legacy-chevron')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('legacy-arrow')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('img', { name: 'Workspace settings' })).toBeInTheDocument();
});

test('two 2.5D icons on one page never share a gradient id and 3D swaps to 2.5D on custom hue', () => {
  const { container } = render(
    <ThemeProvider>
      <Icon name="rocket" variant="2.5d" />
      <Icon name="rocket" variant="2.5d" />
      <Icon name="rocket" variant="3d" data-testid="raster-3d" label="Launch 3D" />
      <Icon name="rocket" variant="3d" hue="custom" customColor="#5B8DEF" label="Custom 3D" />
    </ThemeProvider>,
  );
  const gradients = Array.from(container.querySelectorAll('linearGradient'), (el) => el.getAttribute('id'));
  expect(gradients.length).toBeGreaterThanOrEqual(3);
  expect(new Set(gradients).size).toBe(gradients.length);
  expect(screen.getByRole('img', { name: 'Launch 3D' }).querySelector('picture img')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Custom 3D' }).tagName.toLowerCase()).toBe('svg');
});

test('picker supports arrow keys, persists across remount, and derives stroke and on for light and dark custom colours', async () => {
  const user = userEvent.setup();
  localStorage.clear();

  function Probe() {
    const { hue, custom } = useIconPalette();
    return (
      <>
        <div data-testid="palette-state">{hue}:{custom}</div>
        <IconPalettePicker />
      </>
    );
  }

  const first = render(
    <ThemeProvider defaultTheme="light">
      <IconPaletteProvider>
        <Probe />
      </IconPaletteProvider>
    </ThemeProvider>,
  );

  const blueRadio = screen.getByRole('radio', { name: 'Blue' });
  blueRadio.focus();
  await user.keyboard('{ArrowRight}{ArrowRight}');
  expect(screen.getByRole('radio', { name: 'Violet' })).toBeChecked();
  expect(document.documentElement).toHaveAttribute('data-icon-hue', 'violet');

  await user.keyboard('{End}');
  expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
  const hexInput = screen.getByRole('textbox', { name: 'Custom hex colour' });
  await user.clear(hexInput);
  await user.type(hexInput, '#E8F0FE');
  expect(screen.getByRole('status')).toHaveTextContent(/Too light for paper/i);

  first.unmount();
  document.documentElement.removeAttribute('data-icon-hue');
  new Function(iconPaletteScript())();
  expect(document.documentElement).toHaveAttribute('data-icon-hue', 'custom');

  render(
    <ThemeProvider defaultTheme="light">
      <IconPaletteProvider>
        <Probe />
      </IconPaletteProvider>
    </ThemeProvider>,
  );
  expect(screen.getByTestId('palette-state')).toHaveTextContent('custom:#E8F0FE');

  // Verify light custom colour (#E8F0FE) vs dark custom colour (#1B2A4A)
  const lightOnPaper = deriveCustomPalette('#E8F0FE', 'light');
  const lightOnNight = deriveCustomPalette('#E8F0FE', 'dark');
  expect(lightOnPaper.passesStroke).toBe(false);
  expect(lightOnPaper.stroke).toBe('var(--ut-ink)');
  expect(lightOnPaper.on).toBe('#0B0B0A');
  expect(lightOnNight.passesStroke).toBe(true);
  expect(lightOnNight.stroke).toBe('#E8F0FE');
  expect(lightOnNight.on).toBe('#0B0B0A');

  const darkOnPaper = deriveCustomPalette('#1B2A4A', 'light');
  const darkOnNight = deriveCustomPalette('#1B2A4A', 'dark');
  expect(darkOnPaper.passesStroke).toBe(true);
  expect(darkOnPaper.stroke).toBe('#1B2A4A');
  expect(darkOnPaper.on).toBe('#FFFFFF');
  expect(darkOnNight.passesStroke).toBe(false);
  expect(darkOnNight.stroke).toBe('var(--ut-ink)');
  expect(darkOnNight.on).toBe('#FFFFFF');
});
