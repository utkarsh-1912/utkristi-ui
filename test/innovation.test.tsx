import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  A11yPanel, A11yPreferencesProvider, Combobox, createCollabChannel, createDataTableStream, CursorLayer, DataTable,
  LogViewer, Menu, Modal, Popover, PresenceStack, SelectMenu, Tabs, Tooltip, useCollabAdapter,
  type CollabAdapter, type CollabCursor, type CollabThread, type CollabUser,
} from '../src/react/index.js';
import '../src/react/elements.js';
import { createWebSocketCollabAdapter } from '../src/react/collab/ws.js';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

test('tabs commit the native transition and bypass motion when reduced', async () => {
  const animate = vi.fn((commit: () => void) => {
    commit();
    return { skipTransition: vi.fn(), ready: Promise.resolve(), finished: Promise.resolve() };
  });
  const previous = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
  Object.defineProperty(document, 'startViewTransition', { configurable: true, value: animate });
  try {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const items = [{ id: 'a', label: 'First', content: 'First panel' }, { id: 'b', label: 'Second', content: 'Second panel' }];
    const view = render(<Tabs label="Panels" items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
    expect(animate).toHaveBeenCalledOnce();
    await act(async () => {});
    view.rerender(<div data-ut-a11y-motion="reduce"><Tabs label="Panels" items={items} /></div>);
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
    expect(animate).toHaveBeenCalledOnce();
  } finally {
    if (previous) Object.defineProperty(document, 'startViewTransition', previous);
    else Reflect.deleteProperty(document, 'startViewTransition');
  }
});

test.each([false, true])('all anchored surfaces retain keyboard behavior with native mode %s', async (native) => {
  const shown = vi.fn();
  const oldShow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
  if (native) {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: shown });
    vi.stubGlobal('CSS', { supports: () => true });
  }
  try {
    const options = [{ value: 'design', label: 'Design' }];
    const view = render(<>
      <Menu items={[{ label: 'Save' }]} trigger={(props) => <button {...props}>Actions</button>} />
      <Popover label="Details" trigger="Open details"><button>More</button></Popover>
      <Combobox label="Team search" options={options} />
      <SelectMenu label="Team select" options={options} />
      <Tooltip content="Details tip" delay={0}><button>Help</button></Tooltip>
    </>);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = screen.getByRole('menu');
    expect(menu.hasAttribute('popover')).toBe(native);
    fireEvent.keyDown(within(menu).getByRole('menuitem'), { key: 'Escape' });
    expect(menu).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open details' }));
    const popover = screen.getByRole('dialog', { name: 'Details' });
    expect(popover.hasAttribute('popover')).toBe(native);
    fireEvent.keyDown(popover, { key: 'Escape' });
    expect(popover).not.toBeInTheDocument();
    for (const name of ['Team search', 'Team select']) {
      const control = screen.getByRole('combobox', { name });
      fireEvent.keyDown(control, { key: 'ArrowDown' });
      expect(screen.getByRole('listbox').parentElement?.hasAttribute('popover')).toBe(native);
      fireEvent.keyDown(control, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Help' }));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.hasAttribute('popover')).toBe(native);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(tooltip).not.toBeInTheDocument();
    expect(shown).toHaveBeenCalledTimes(native ? 5 : 0);
    view.unmount();
  } finally {
    if (oldShow) Object.defineProperty(HTMLElement.prototype, 'showPopover', oldShow);
    else Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  }
});

test('native dialogs use showModal and keep Escape ordering with child overlays', () => {
  const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
  const open = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: open });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
  try {
    const onClose = vi.fn();
    const view = render(<Modal title="Settings" open onClose={onClose}><Popover label="More settings" trigger="Details">Details</Popover></Modal>);
    const modal = screen.getByRole('dialog', { name: 'Settings' });
    expect(modal.tagName).toBe('DIALOG');
    expect(open).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'More settings' }), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    view.unmount();
  } finally {
    if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShow);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  }
});

test('adaptive accessibility persists preferences and resets the scope', () => {
  const fixture = <A11yPreferencesProvider><A11yPanel /></A11yPreferencesProvider>;
  const first = render(fixture);
  for (const name of ['Increase contrast', 'Reduce motion', 'Compact controls', 'Stronger focus ring', 'Readable font', 'Underline links']) {
    fireEvent.click(screen.getByRole('checkbox', { name }));
  }
  fireEvent.change(screen.getByRole('combobox', { name: 'Text scale' }), { target: { value: '200' } });
  expect(first.container.querySelector('.ut-a11y-scope')).toMatchObject({ dataset: {
    utA11yContrast: 'more', utA11yMotion: 'reduce', utA11yDensity: 'compact', utA11yText: '200',
    utA11yFocus: 'strong', utA11yFont: 'true', utA11yLinks: 'true',
  } });
  first.unmount();
  render(fixture);
  expect(screen.getByRole('checkbox', { name: 'Reduce motion' })).toBeChecked();
  expect(screen.getByRole('combobox', { name: 'Text scale' })).toHaveValue('200');
  fireEvent.click(screen.getByRole('button', { name: 'Reset preferences' }));
  expect(screen.getByRole('checkbox', { name: 'Reduce motion' })).not.toBeChecked();
  expect(screen.getByRole('combobox', { name: 'Text scale' })).toHaveValue('100');
});

test('stream patches use stable keys and a large log keeps its DOM window small', () => {
  vi.useFakeTimers();
  try {
    const rows = [{ id: 'a', label: 'Delta', price: 20 }, { id: 'b', label: 'Beta', price: 15 }];
    const stream = createDataTableStream<typeof rows[number]>();
    const view = render(<><DataTable rows={rows} getRowKey={({ id }) => id} stream={stream}
      columns={[{ key: 'label', header: 'Symbol' }, { key: 'price', header: 'Price' }]} />
      <LogViewer lines={Array.from({ length: 100_000 }, (_, i) => `Line ${i}`)} defaultFollow={false} /></>);
    act(() => {
      stream.applyPatch({ remove: ['b'], upsert: [{ id: 'a', label: 'Delta', price: 25 }, { id: 'c', label: 'Gamma', price: 8 }] });
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText(/\+5/)).toHaveClass('market-up');
    expect(screen.getByRole('status')).toHaveTextContent('1 new row received');
    expect(view.container.querySelectorAll('.live-log-line').length).toBeLessThan(30);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter log lines' }), { target: { value: 'Line 99999' } });
    expect(screen.getByText('Line 99999')).toBeInTheDocument();
  } finally { vi.useRealTimers(); }
});

test('collaboration channels announce presence and render a visual-only cursor', () => {
  const users$ = createCollabChannel<CollabUser>();
  const cursors$ = createCollabChannel<CollabCursor>();
  const comments$ = createCollabChannel<CollabThread>();
  const adapter: CollabAdapter = { users$, cursors$, comments$, send: vi.fn() };
  function Fixture() {
    const { users, cursors } = useCollabAdapter(adapter);
    return <><PresenceStack users={users} /><CursorLayer users={users} cursors={cursors} /></>;
  }
  const { container } = render(<Fixture />);
  act(() => {
    users$.publish([{ id: 'a', name: 'Asha Rao' }]);
    cursors$.publish([{ userId: 'a', x: 30, y: 20, updatedAt: Date.now() }]);
  });
  expect(screen.getByRole('status')).toHaveTextContent('Asha Rao joined');
  expect(container.querySelector('.collab-cursor')?.closest('[aria-hidden="true"]')).toBeTruthy();
});

test('WebSocket collaboration keeps valid snapshots and unsubscribes on disposal', () => {
  const socket = Object.assign(new EventTarget(), { readyState: 1, send: vi.fn() }) as unknown as WebSocket;
  const adapter = createWebSocketCollabAdapter(socket);
  const changed = vi.fn();
  const unsubscribe = adapter.users$.subscribe(changed);
  socket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ users: [{ id: 'a', name: 'Asha' }] }) }));
  socket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ users: [null] }) }));
  expect(changed).toHaveBeenCalledOnce();
  expect(adapter.users$.getSnapshot()).toEqual([{ id: 'a', name: 'Asha' }]);
  adapter.send({ type: 'follow', userId: 'a' });
  expect(socket.send).toHaveBeenCalledWith('{"action":{"type":"follow","userId":"a"}}');
  adapter.dispose();
  socket.dispatchEvent(new MessageEvent('message', { data: '{"users":[]}' }));
  expect(changed).toHaveBeenCalledOnce();
  unsubscribe();
});

test('light-DOM elements upgrade the markup without React and update scoped themes', () => {
  const root = document.createElement('div');
  root.innerHTML = '<ut-theme theme="glass"><ut-tabs><div role="tablist" data-ut-tabs><button role="tab" aria-selected="false" aria-controls="unit-panel">Details</button></div><div role="tabpanel" id="unit-panel" hidden>Panel</div></ut-tabs></ut-theme>';
  document.body.append(root);
  try {
    expect(root.querySelector('ut-theme')).toHaveAttribute('data-theme', 'glass');
    fireEvent.click(within(root).getByRole('tab'));
    expect(within(root).getByRole('tabpanel')).toBeVisible();
  } finally { root.remove(); }
});
