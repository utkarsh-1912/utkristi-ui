import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Alert, Sidebar, SidebarLink } from '../src/react/Layout.js';
import { Tabs } from '../src/react/Tabs.js';
import { Accordion } from '../src/react/Disclosure.js';

test('alert action and controlled dismissal work independently', async () => {
  const user = userEvent.setup(); const dismiss = vi.fn(); const action = vi.fn();
  render(<Alert title="Export ready" variant="solid" onDismiss={dismiss} actions={<button onClick={action}>Download</button>}>Saved locally</Alert>);
  await user.click(screen.getByRole('button', {name:'Download'}));
  expect(action).toHaveBeenCalledOnce(); expect(dismiss).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', {name:'Dismiss alert'}));
  expect(dismiss).toHaveBeenCalledOnce(); expect(screen.getByRole('status')).toBeInTheDocument();
});

test('icon collapse preserves accessible navigation while offcanvas removes it', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Sidebar collapsible collapseMode="icons"><SidebarLink href="#projects" label="Projects" /></Sidebar>);
  await user.click(screen.getByRole('button'));
  expect(screen.getByRole('link', {name:'Projects'})).toBeVisible();
  expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed');
  rerender(<Sidebar collapsible collapseMode="offcanvas"><SidebarLink href="#projects" label="Projects" /></Sidebar>);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button')); expect(screen.getByRole('link')).toBeVisible();
});

test('vertical manual tabs skip disabled items and activate with Enter', async () => {
  const user = userEvent.setup();
  render(<Tabs orientation="vertical" activation="manual" items={[
    {id:'one',label:'One',content:'First'}, {id:'two',label:'Two',content:'Second',disabled:true}, {id:'three',label:'Three',content:'Third'},
  ]} />);
  await user.tab(); await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('tab', {name:'Three'})).toHaveFocus();
  expect(screen.getByRole('tab', {name:'One'})).toHaveAttribute('aria-selected','true');
  await user.keyboard('{Enter}'); expect(screen.getByRole('tabpanel')).toHaveTextContent('Third');
});

test('required single accordion stays open until another item is selected', async () => {
  const user = userEvent.setup();
  render(<Accordion collapsible={false} defaultValue={['one']} items={[{id:'one',label:'One',content:'First'},{id:'two',label:'Two',content:'Second'}]} />);
  await user.click(screen.getByRole('button', {name:'One'}));
  expect(screen.getByRole('region', {name:'One'})).toBeVisible();
  await user.click(screen.getByRole('button', {name:'Two'}));
  expect(screen.queryByRole('region', {name:'One'})).not.toBeInTheDocument();
  expect(screen.getByRole('region', {name:'Two'})).toBeVisible();
});
