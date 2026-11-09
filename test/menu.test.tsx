import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Menu } from '../src/react/index.js';

test('opens from the keyboard, skips disabled items, supports typeahead, and returns focus', async () => {
  const user = userEvent.setup();
  const pick = vi.fn();
  render(<>
    <Menu trigger={<button>Options</button>} items={[
      { label: 'Archive', onSelect: pick }, { label: 'Blocked', disabled: true }, { label: 'Copy', onSelect: pick },
    ]} />
    <button>Outside</button>
  </>);
  const trigger = screen.getByRole('button', { name: 'Options' });
  trigger.focus();
  await user.keyboard('{ArrowDown}');
  const archive = screen.getByRole('menuitem', { name: 'Archive' });
  const copy = screen.getByRole('menuitem', { name: 'Copy' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(archive).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(copy).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(archive).toHaveFocus();
  await user.keyboard('{End}');
  expect(copy).toHaveFocus();
  await user.keyboard('{Home}c');
  expect(copy).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(pick).toHaveBeenCalledOnce();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.keyboard('{ArrowUp}');
  expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  await user.click(trigger);
  await user.tab();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
