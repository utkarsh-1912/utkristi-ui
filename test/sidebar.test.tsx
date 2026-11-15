import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Sidebar } from '../src/react/Layout.js';

test('sidebar toggle exposes its state and removes collapsed links from keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<Sidebar heading="Workspace" variant="rail" collapsible defaultCollapsed>
    <nav aria-label="Workspace"><a href="#overview" aria-current="page">Overview</a></nav>
  </Sidebar>);
  const toggle = screen.getByRole('button', { name: 'Toggle sidebar navigation' });
  const content = document.getElementById(toggle.getAttribute('aria-controls')!);
  expect(screen.getByRole('complementary')).toHaveClass('sidebar-rail');
  expect(content).toHaveAttribute('hidden');
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  await user.tab();
  expect(toggle).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await user.tab();
  expect(screen.getByRole('link', { current: 'page' })).toHaveFocus();
});

test('controlled sidebar reports a toggle and waits for the parent to update', async () => {
  const user = userEvent.setup();
  const onCollapsedChange = vi.fn();
  const { rerender } = render(<Sidebar collapsible collapsed onCollapsedChange={onCollapsedChange}>Links</Sidebar>);
  const toggle = screen.getByRole('button');
  await user.click(toggle);
  expect(onCollapsedChange).toHaveBeenCalledWith(false);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  rerender(<Sidebar collapsible collapsed={false} onCollapsedChange={onCollapsedChange}>Links</Sidebar>);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
});
