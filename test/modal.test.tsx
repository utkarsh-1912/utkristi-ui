import { createRef, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Modal } from '../src/react/index.js';

test('traps focus, restores it on close, and locks body scroll', async () => {
  const user = userEvent.setup();
  const close = vi.fn();
  function Fixture() {
    const [open, setOpen] = useState(false);
    const initial = createRef<HTMLInputElement>();
    return <div data-theme="light">
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => { close(); setOpen(false); }} title="Edit" description="Review changes"
        initialFocus={initial} footer={<button>Save</button>}>
        <input aria-label="Name" ref={initial} />
      </Modal>
    </div>;
  }
  render(<Fixture />);
  const trigger = screen.getByRole('button', { name: 'Open' });
  await user.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Edit', description: 'Review changes' });
  const first = within(dialog).getByRole('button', { name: 'Close' });
  const last = within(dialog).getByRole('button', { name: 'Save' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog.closest('[data-theme]')).toHaveAttribute('data-theme', 'light');
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  last.focus();
  await user.tab();
  expect(first).toHaveFocus();
  await user.tab({ shift: true });
  expect(last).toHaveFocus();
  fireEvent.mouseDown(dialog);
  expect(close).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  expect(close).toHaveBeenCalledOnce();
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
  await user.click(trigger);
  fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
  expect(close).toHaveBeenCalledTimes(2);
});

test('defaults to the first focusable control and preserves a nested scroll lock', () => {
  const close = vi.fn();
  const { rerender } = render(<Modal title="Parent" open onClose={close} />);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  rerender(<><Modal title="Parent" open onClose={close} /><Modal title="Child" open onClose={close} /></>);
  expect(document.body.style.overflow).toBe('hidden');
  rerender(<><Modal title="Parent" open onClose={close} /><Modal title="Child" open={false} onClose={close} /></>);
  expect(document.body.style.overflow).toBe('hidden');
});
