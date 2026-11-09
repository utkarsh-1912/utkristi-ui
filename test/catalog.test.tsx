import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import {
  Accordion, AlertDialog, Calendar, Carousel, Combobox, ContextMenu, DataTable, DatePicker,
  InputOTP, Loader, Progress, Questionnaire, Resizable, SelectMenu, ToastProvider, useToast,
} from '../src/react/index.js';

test('carousel moves with arrows and keyboard and respects boundaries', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<Carousel slides={[{ id: 'a', content: 'First' }, { id: 'b', content: 'Second' }, { id: 'c', content: 'Third' }]}
    onSlideChange={change} aria-label="Featured work" />);
  expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Next slide' }));
  expect(screen.getByRole('status')).toHaveTextContent('Slide 2 of 3');
  const viewport = screen.getByRole('region', { name: 'Slides' });
  viewport.focus();
  await user.keyboard('{End}');
  expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 2]);
});

test('loading distinguishes known and indeterminate progress and clamps values', () => {
  render(<><Loader label="Syncing" /><Loader variant="progress" label="Uploading" value={82} />
    <Progress label="Waiting" /><Progress label="Finished" value={120} max={100} /></>);
  expect(screen.getByRole('status')).toHaveTextContent('Syncing');
  expect(screen.getByRole('progressbar', { name: 'Uploading' })).toHaveAttribute('aria-valuenow', '82');
  expect(screen.getByRole('progressbar', { name: 'Waiting' })).not.toHaveAttribute('aria-valuenow');
  expect(screen.getByRole('progressbar', { name: 'Finished' })).toHaveAttribute('aria-valuenow', '100');
});

test('combobox filters and skips disabled choices and select-only submits a value', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const options = [{ value: 'draft', label: 'Draft', disabled: true }, { value: 'design', label: 'Design' }];
  render(<><Combobox label="Team" options={options} onValueChange={change} />
    <form aria-label="Role form"><SelectMenu label="Role" name="role" options={options} /></form></>);
  const combo = screen.getByRole('combobox', { name: 'Team' });
  await user.type(combo, 'd');
  await user.keyboard('{ArrowDown}{Enter}');
  expect(combo).toHaveValue('Design');
  expect(change).toHaveBeenCalledWith(['design']);
  const select = screen.getByRole('combobox', { name: 'Role' });
  select.focus();
  await user.keyboard('{ArrowDown}{Enter}');
  const form = screen.getByRole<HTMLFormElement>('form', { name: 'Role form' });
  expect(new FormData(form).get('role')).toBe('design');
});

test('OTP pastes one sanitized value and announces completion once', async () => {
  const user = userEvent.setup();
  const complete = vi.fn();
  render(<InputOTP length={6} onComplete={complete} />);
  const input = screen.getByRole('textbox', { name: 'Verification code' });
  await user.click(input);
  await user.paste('A 123-456');
  expect(input).toHaveValue('123456');
  expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
});

test('calendar keyboard navigation crosses a month boundary and date picker returns focus', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const initial = new Date(2026, 9, 31);
  render(<><Calendar locale="en" defaultValue={initial} onValueChange={change} />
    <DatePicker locale="en" defaultValue={initial} /></>);
  const day = screen.getByRole('button', { name: 'Saturday, October 31, 2026' });
  day.focus();
  await user.keyboard('{ArrowRight}{Enter}');
  expect(change).toHaveBeenCalledWith(new Date(2026, 10, 1));
  const trigger = screen.getByRole('button', { name: 'Oct 31, 2026' });
  await user.click(trigger);
  const picker = screen.getByRole('dialog', { name: 'Calendar' });
  await user.click(within(picker).getByRole('button', { name: 'Sunday, November 1, 2026' }));
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent('Nov 1, 2026');
});

test('alert dialog focuses Cancel, refuses backdrop dismissal, and restores the trigger', async () => {
  const user = userEvent.setup();
  function Demo() {
    const [open, setOpen] = useState(false);
    return <><button onClick={() => setOpen(true)}>Archive</button>
      <AlertDialog open={open} title="Archive project?" onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} /></>;
  }
  render(<Demo />);
  const trigger = screen.getByRole('button', { name: 'Archive' });
  await user.click(trigger);
  const dialog = screen.getByRole('alertdialog');
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  fireEvent.mouseDown(dialog.parentElement!);
  expect(dialog).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
});

test('accordion navigation skips a disabled section and context menu opens from the keyboard', async () => {
  const user = userEvent.setup();
  const run = vi.fn();
  render(<><Accordion items={[
    { id: 'a', label: 'First section', content: 'A' }, { id: 'b', label: 'Disabled section', content: 'B', disabled: true },
    { id: 'c', label: 'Last section', content: 'C' },
  ]} /><div data-theme="glass"><ContextMenu label="Project actions" items={[{ label: 'Duplicate', onSelect: run }]}>Project</ContextMenu></div></>);
  screen.getByRole('button', { name: 'First section' }).focus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByRole('button', { name: 'Last section' })).toHaveAttribute('aria-expanded', 'true');
  const target = screen.getByRole('button', { name: 'Project actions' });
  target.focus();
  await user.keyboard('{Shift>}{F10}{/Shift}');
  expect(screen.getByRole('menu').closest('[data-theme]')).toHaveAttribute('data-theme', 'glass');
  await user.keyboard('{Enter}');
  expect(run).toHaveBeenCalledOnce();
  expect(target).toHaveFocus();
});

test('data table sorts and filters while resetting its page and resizable supports arrows', async () => {
  const user = userEvent.setup();
  render(<><DataTable rows={[{ name: 'Zulu' }, { name: 'Alpha' }, { name: 'Beta' }]}
    columns={[{ key: 'name', header: 'Team', sortValue: (row) => row.name }]} getRowKey={(row) => row.name} pageSize={1} />
    <Resizable first="Files" second="Preview" /></>);
  await user.click(screen.getByRole('button', { name: 'Team' }));
  expect(screen.getByRole('cell')).toHaveTextContent('Alpha');
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('cell')).toHaveTextContent('Beta');
  await user.type(screen.getByRole('searchbox'), 'Zulu');
  expect(screen.getByRole('cell')).toHaveTextContent('Zulu');
  const separator = screen.getByRole('separator', { name: 'Resize panels' });
  separator.focus();
  await user.keyboard('{ArrowRight}{End}');
  expect(separator).toHaveAttribute('aria-valuenow', '85');
});

test('questionnaire validates required answers and retains them across steps', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Questionnaire questions={[{ id: 'name', prompt: 'Name', required: true },
    { id: 'access', prompt: 'Access', options: [{ value: 'private', label: 'Private' }], required: true }]} onSubmit={submit} />);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Enter an answer to continue.')).toBeInTheDocument();
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Studio');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('radio', { name: 'Private' }));
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Studio');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(submit).toHaveBeenCalledWith({ name: 'Studio', access: 'private' });
});

test('paging a sorted table with 5,000 rows does not recalculate sort keys or mount extra rows', async () => {
  const user = userEvent.setup();
  const rows = Array.from({ length: 5_000 }, (_, id) => ({ id, name: 'Workspace ' + id }));
  const sortValue = vi.fn((row: typeof rows[number]) => row.id);
  render(<DataTable rows={rows} columns={[{ key: 'name', header: 'Name', sortValue }]} getRowKey={(row) => row.id} pageSize={20} />);
  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(sortValue).toHaveBeenCalled();
  sortValue.mockClear();
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(sortValue).not.toHaveBeenCalled();
  expect(screen.getAllByRole('cell')).toHaveLength(20);
  expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Workspace 20');
});

test('a toast preserves its remaining dismissal time while progress is paused', () => {
  vi.useFakeTimers();
  try {
    function ToastDemo() {
      const toast = useToast();
      return <button onClick={() => toast.show({ title: 'Sync complete', duration: 1000 })}>Notify</button>;
    }
    render(<ToastProvider><ToastDemo /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    const toast = screen.getByText('Sync complete').closest('.toast')!;
    const progress = toast.querySelector('.toast-track')!;
    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(toast);
    expect(progress).toHaveAttribute('data-paused', 'true');
    act(() => vi.advanceTimersByTime(2000));
    expect(toast).toBeInTheDocument();
    fireEvent.mouseLeave(toast);
    expect(progress).not.toHaveAttribute('data-paused');
    act(() => vi.advanceTimersByTime(650));
    expect(toast).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
