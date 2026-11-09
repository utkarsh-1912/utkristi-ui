import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Logo, Navbar } from '../src/react/index.js';

test('the dock menu is themed and restores focus after dismissal and navigation', async () => {
  const user = userEvent.setup();
  const search = vi.fn();
  render(<div data-theme="glass"><Navbar variant="dock" brand={<a href="#home"><Logo /></a>}
    links={[{ href: '#home', label: 'Home', active: true }, { href: '#docs', label: 'Docs' }]}
    onSearch={search} /></div>);
  const header = screen.getByRole('banner');
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  expect(header).toHaveClass('header-dock');
  expect(within(header).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

  await user.click(trigger);
  const sheet = screen.getByRole('dialog', { name: 'Menu' });
  expect(sheet).toHaveClass('sheet-dock');
  expect(sheet.closest('[data-theme]')).toHaveAttribute('data-theme', 'glass');
  expect(within(sheet).getByRole('button', { name: 'Close menu' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(sheet).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();

  await user.click(trigger);
  await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Docs' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();

  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Search pages' }));
  expect(search).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(trigger);
  await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: /Utkristi UI/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('logo retains accessible text when used as a standalone mark', () => {
  render(<Logo compact size={20} name="Utkristi" suffix="Design" />);
  const mark = screen.getByRole('img', { name: 'Utkristi Design' });
  expect(mark.querySelector('svg')).toHaveAttribute('width', '20');
  expect(mark.querySelectorAll('svg path')).toHaveLength(3);
  expect(mark).toHaveTextContent(/^$/);
});
