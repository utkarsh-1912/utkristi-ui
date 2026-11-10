import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import {
  Accordion, AlertDialog, Calendar, Carousel, ColumnChooser, Combobox, Command, ContextMenu, DataTable, DatePicker, DateRangePicker, Field,
  InputOTP, Loader, Progress, Questionnaire, Resizable, SelectMenu, ToastProvider, useToast,
  type DataTableRowKey, type DataTableState,
} from '../src/react/index.js';

test('keyboard users can sort a remote review queue and select eligible rows across pages without activating a row', async () => {
  const user = userEvent.setup();
  const open = vi.fn();
  const menu = vi.fn();
  const approve = vi.fn();
  const rows = [
    { id: 'A', amount: 18, status: 'Pending' }, { id: 'B', amount: 12, status: 'Pending' },
    { id: 'C', amount: 30, status: 'Pending' }, { id: 'D', amount: 4, status: 'Closed' },
  ];
  function Queue() {
    const [state, setState] = useState<DataTableState>({ query: '', page: 1 });
    const [selectedKeys, setSelectedKeys] = useState<readonly DataTableRowKey[]>([]);
    const matching = rows.filter(({ status }) => status.toLowerCase().includes(state.query.toLowerCase()));
    if (state.sort) matching.sort((a, b) => state.sort?.descending ? b.amount - a.amount : a.amount - b.amount);
    return <DataTable caption="Reconciliation queue" density="compact" stickyHeader
      toolbar={<button disabled={!selectedKeys.length} onClick={() => approve(selectedKeys)}>Approve selected</button>}
      rows={matching.slice((state.page - 1) * 2, state.page * 2)} pageSize={2} getRowKey={(row) => row.id} onRowClick={open}
      columns={[{ key: 'amount', header: 'Amount', sortable: true },
        { key: 'action', header: 'Actions', render: (row) => <button onClick={() => menu(row.id)}>Open menu</button> }]}
      selection={{ selectedKeys, onSelectionChange: setSelectedKeys, isRowSelectable: (row) => row.id !== 'A' }}
      remote={{ state, onStateChange: setState, totalRows: matching.length }} />;
  }
  render(<Queue />);
  screen.getByRole('searchbox').focus();
  await user.keyboard('pending');
  screen.getByRole('button', { name: 'Amount' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveAttribute('aria-sort', 'ascending');
  expect(screen.getByRole('checkbox', { name: 'Select row A' })).toBeDisabled();
  screen.getByRole('checkbox', { name: 'Select all on this page' }).focus();
  await user.keyboard(' ');
  screen.getByRole('button', { name: 'Next page' }).focus();
  await user.keyboard('{Enter}');
  screen.getByRole('checkbox', { name: 'Select row C' }).focus();
  await user.keyboard(' ');
  expect(screen.getByText('2 selected across pages')).toBeVisible();
  const action = screen.getByRole('button', { name: 'Open menu' });
  action.focus();
  await user.keyboard('{Enter}');
  expect(menu).toHaveBeenCalledWith('C');
  expect(open).not.toHaveBeenCalled();
  screen.getByRole('button', { name: 'Approve selected' }).focus();
  await user.keyboard('{Enter}');
  expect(approve).toHaveBeenCalledWith(['B', 'C']);
  screen.getByRole('button', { name: 'Clear selection' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('searchbox')).toHaveFocus();
  expect(screen.getByRole('checkbox', { name: 'Select row C' })).not.toBeChecked();
});

test('form-backed pickers use Field labels and reset submitted values', async () => {
  const user = userEvent.setup();
  render(<form aria-label="Booking">
    <Field label="Team" hint="Pick an owner" error="Review this team" required>
      <Combobox name="team" options={[{ value: 'ops', label: 'Operations' }, { value: 'design', label: 'Design' }]} defaultValue={['ops']} />
    </Field>
    <Field label="Booking date" hint="Local calendar date">
      <DatePicker name="bookingDate" defaultValue="2026-11-09" locale="en-US" />
    </Field>
    <button type="reset">Reset booking</button>
  </form>);
  const form = screen.getByRole<HTMLFormElement>('form', { name: 'Booking' });
  const team = screen.getByRole('combobox', { name: 'Team' });
  expect(team).toHaveAccessibleDescription('Pick an owner Review this team');
  expect(team).toHaveAttribute('aria-invalid', 'true');
  await user.click(team);
  await user.click(screen.getByRole('option', { name: 'Design' }));
  const date = screen.getByLabelText('Booking date');
  expect(date).toHaveAccessibleDescription('Local calendar date');
  await user.click(date);
  await user.click(screen.getByRole('button', { name: 'Tuesday, November 10, 2026' }));
  expect(Object.fromEntries(new FormData(form))).toEqual({ team: 'design', bookingDate: '2026-11-10' });
  await user.click(screen.getByRole('button', { name: 'Reset booking' }));
  expect(Object.fromEntries(new FormData(form))).toEqual({ team: 'ops', bookingDate: '2026-11-09' });
});

test('remote tables preserve server order and expose request controls with stable page selection', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const retry = vi.fn();
  const accessor = vi.fn((row: { id: number; name: string }) => row.name);
  const rows = [{ id: 27, name: 'Zulu' }, { id: 21, name: 'Alpha' }];
  const state = { query: 'query supplied to the server', page: 2 };
  const view = (status: 'idle' | 'refreshing' | 'error') => <DataTable rows={rows}
    columns={[{ key: 'name', header: 'Project', sortValue: accessor }]} getRowKey={(row) => row.id}
    pageSize={2} selection={{ defaultSelectedKeys: [10] }}
    remote={{ state, status, onStateChange: change, onRetry: retry, totalRows: 6 }} />;
  const { rerender } = render(view('idle'));
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['', 'Zulu', '', 'Alpha']);
  expect(accessor).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(change).toHaveBeenLastCalledWith({ ...state, page: 3 });
  await user.click(screen.getByRole('button', { name: 'Project' }));
  expect(change).toHaveBeenLastCalledWith({ ...state, page: 1, sort: { key: 'name', descending: false } });
  await user.click(screen.getByRole('checkbox', { name: 'Select all on this page' }));
  expect(screen.getByRole('checkbox', { name: 'Select row 27' })).toBeChecked();
  rerender(view('refreshing'));
  expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('checkbox', { name: 'Select row 27' })).toBeDisabled();
  rerender(view('error'));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load rows');
  expect(screen.getByText('Zulu')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(retry).toHaveBeenCalledOnce();
});

test('date bounds are inclusive and the column chooser protects the identifying column', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<><DateRangePicker min="2026-01-01" max="2026-12-31"
    value={{ start: '2026-04-01', end: '2026-04-01' }} onChange={change} />
    <ColumnChooser columns={[{ key: 'id', label: 'ID', required: true }, { key: 'owner', label: 'Owner' }]}
      visible={['owner']} onChange={change} /></>);
  expect(screen.getByLabelText('Start date')).toHaveAttribute('max', '2026-04-01');
  expect(screen.getByLabelText('End date')).toHaveAttribute('min', '2026-04-01');
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-04-02' } });
  expect(change).toHaveBeenLastCalledWith({ start: '2026-04-01', end: '2026-04-02' });
  const columns = screen.getByRole('button', { name: 'Columns' });
  await user.click(columns);
  expect(screen.getByRole('checkbox', { name: 'ID' })).toBeDisabled();
  await user.click(screen.getByRole('checkbox', { name: 'Owner' }));
  expect(change).toHaveBeenLastCalledWith(['id']);
  await user.keyboard('{Escape}');
  expect(columns).toHaveFocus();
});

test('command runs the first enabled search match with Enter and preserves grouped keyboard order', async () => {
  const user = userEvent.setup();
  const open = vi.fn();
  const create = vi.fn();
  render(<Command label="Workspace actions" options={[
    { value: 'disabled', label: 'Open unavailable', group: 'Workspace', disabled: true, onSelect: vi.fn() },
    { value: 'open', label: 'Open workspace', group: 'Workspace', onSelect: open },
    { value: 'create', label: 'Create workspace', group: 'Actions', onSelect: create },
  ]} />);
  const field = screen.getByRole('combobox', { name: 'Workspace actions' });
  await user.type(field, 'open{Enter}');
  expect(open).toHaveBeenCalledOnce();
  expect(field).toHaveFocus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(create).toHaveBeenCalledOnce();
});

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

test('row selection survives sorting and filtering while select all changes only eligible rows on the current page', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const rowClick = vi.fn();
  render(<DataTable rows={[{ name: 'Gamma' }, { name: 'Alpha' }, { name: 'Beta' }, { name: 'Delta' }]}
    columns={[{ key: 'name', header: 'Team', sortValue: (row) => row.name }]}
    getRowKey={(row, index) => `${row.name}-${index}`} pageSize={2} onRowClick={rowClick}
    selection={{ onSelectionChange: change, isRowSelectable: (row) => row.name !== 'Beta',
      getRowCheckboxLabel: (row) => `Select ${row.name}` }} />);
  const all = screen.getByRole('checkbox', { name: 'Select all on this page' });
  const gamma = screen.getByRole('checkbox', { name: 'Select Gamma' });
  gamma.focus();
  await user.keyboard(' ');
  expect(all).toBePartiallyChecked();
  expect(rowClick).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Team' }));
  expect(all).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Select Beta' })).toBeDisabled();
  await user.click(all);
  expect(all).toBeChecked();
  expect(change).toHaveBeenLastCalledWith(['Gamma-0', 'Alpha-1']);
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(all).toBePartiallyChecked();
  await user.click(all);
  expect(change).toHaveBeenLastCalledWith(['Gamma-0', 'Alpha-1', 'Delta-3']);
  await user.click(all);
  expect(change).toHaveBeenLastCalledWith(['Alpha-1']);
  await user.type(screen.getByRole('searchbox'), 'Alpha');
  expect(screen.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
  await user.type(screen.getByRole('searchbox'), 'x');
  expect(all).toBeDisabled();
});

test('controlled selection reflects the keys supplied by the app', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const rows = [{ id: 1 }, { id: 2 }];
  const view = (keys: readonly number[]) => <DataTable rows={rows} columns={[{ key: 'id', header: 'ID' }]}
    getRowKey={(row) => row.id} selection={{ selectedKeys: keys, onSelectionChange: change }} />;
  const { rerender } = render(view([1]));
  const all = screen.getByRole('checkbox', { name: 'Select all on this page' });
  await user.click(all);
  expect(change).toHaveBeenLastCalledWith([1, 2]);
  expect(all).toBePartiallyChecked();
  rerender(view([1, 2]));
  expect(all).toBeChecked();
  rerender(view([]));
  expect(all).not.toBeChecked();
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
  expect(sortValue).toHaveBeenCalledTimes(5_000);
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
