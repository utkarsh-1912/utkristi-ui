import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { Segmented, Tabs } from '../src/react/index.js';

const items = ['One', 'Two', 'Three'].map((label) => ({ id: label, label, content: `${label} content` }));

test('manual tabs move the tab stop and wire the active panel', async () => {
  const user = userEvent.setup();
  render(<Tabs label="Pages" items={items} activation="manual" />);
  const one = screen.getByRole('tab', { name: 'One' });
  const two = screen.getByRole('tab', { name: 'Two' });
  const three = screen.getByRole('tab', { name: 'Three' });
  await user.tab();
  expect(one).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(two).toHaveFocus();
  expect(two).toHaveAttribute('tabindex', '0');
  expect(one).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{End}');
  expect(three).toHaveFocus();
  await user.keyboard('{Enter}');
  const panel = screen.getByRole('tabpanel', { name: 'Three' });
  expect(panel).toHaveAttribute('id', three.getAttribute('aria-controls'));
  expect(three).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{Home}');
  expect(one).toHaveFocus();
});

test('segmented navigation moves focus and selection together', async () => {
  const user = userEvent.setup();
  render(<Segmented aria-label="Views" items={items} />);
  const [one, two, three] = screen.getAllByRole('radio');
  await user.tab();
  await user.keyboard('{ArrowDown}');
  expect(two).toHaveFocus();
  expect(two).toBeChecked();
  expect(one).toHaveAttribute('tabindex', '-1');
  await user.keyboard('{End}');
  expect(three).toBeChecked();
  await user.keyboard('{Home}');
  expect(one).toBeChecked();
});
