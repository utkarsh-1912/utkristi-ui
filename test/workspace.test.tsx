import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Workspace } from '../src/react/Workspace.js';

const navigation = [
  { id: 'orders', label: 'Orders', icon: '▦', content: <p>Order blotter</p> },
  { id: 'activity', label: 'Activity', icon: '◷', content: <p>Recent fills</p> },
];

test('icon navigation has accessible names and switches content from the keyboard', async () => {
  const user = userEvent.setup();
  render(<Workspace title="Execution" variant="trading" navigation={navigation} />);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Orders' })).toHaveFocus();
  await user.tab();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Activity' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('region', { name: 'Activity' })).toHaveTextContent('Recent fills');
  expect(screen.queryByText('Order blotter')).not.toBeInTheDocument();
});

test('controlled workspace requests navigation and handles removed destinations', async () => {
  const user = userEvent.setup();
  const onActiveChange = vi.fn();
  const view = render(<Workspace title="Execution" activeId="orders" onActiveChange={onActiveChange} navigation={navigation} />);
  await user.click(screen.getByRole('button', { name: 'Activity' }));
  expect(onActiveChange).toHaveBeenCalledWith('activity');
  expect(screen.getByRole('region', { name: 'Orders' })).toBeInTheDocument();
  view.rerender(<Workspace title="Execution" activeId="orders" navigation={navigation.slice(1)} />);
  expect(screen.getByRole('region', { name: 'Activity' })).toBeInTheDocument();
  view.rerender(<Workspace title="Execution" navigation={[]} />);
  expect(screen.getByRole('region', { name: 'Workspace content' })).toBeEmptyDOMElement();
});
