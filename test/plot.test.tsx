import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Plot } from '../src/react/Plot.js';
import { chartVariants } from '../docs/src/chart-variants';

test('all 68 chart examples render an SVG and an accessible data table', () => {
  expect(Object.keys(chartVariants)).toHaveLength(68);
  for (const example of Object.values(chartVariants)) {
    const Preview = example.preview;
    const view = render(<Preview />);
    const plot = view.container.querySelector('figure')!;
    expect(plot.querySelector('svg')).toBeInTheDocument();
    expect(plot.querySelector('table th[scope=row]')).toBeInTheDocument();
    expect(plot.querySelector('svg')!.outerHTML).not.toMatch(/NaN|Infinity/);
    view.unmount();
  }
});

test('signed bars, keyboard-friendly selection and formatted detail retain negative values', () => {
  const { container } = render(<Plot kind="bar" title="Changes" series={[{ label: 'Actual' }]} interactive
    rows={[{ label: 'Gain', values: [20] }, { label: 'Loss', values: [-10] }]} tooltipValue={n => n + ' ms'} />);
  const bars = container.querySelectorAll('rect');
  expect(Number(bars[0].getAttribute('y'))).toBeLessThan(Number(bars[1].getAttribute('y')));
  fireEvent.change(screen.getByRole('combobox', { name: 'Inspect' }), { target: { value: '1' } });
  expect(within(container.querySelector('.plot-tooltip') as HTMLElement).getByText('-10 ms')).toBeVisible();
});

test('all-zero pie and absent data render without invalid geometry', () => {
  const { container, rerender } = render(<Plot kind="pie" title="Allocation" rows={[{ label: 'Queue', values: [0] }]} series={[{ label: 'Size' }]} />);
  expect(container.querySelector('svg path')).toBeNull();
  rerender(<Plot kind="pie" title="Allocation" rows={[]} series={[{ label: 'Size' }]} />);
  expect(screen.getByText('No data')).toBeVisible();
});
