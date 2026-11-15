import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import {
  Button, DataTable, DateRangeCalendar, Field, Fieldset, Form, Input, Modal, Popover,
  Sidebar, SidebarDrawer, SidebarLink, SidebarProvider, SidebarSection, Table, useAsyncValidation, useSidebar,
} from '../src/react/index.js';
import { computePlacement } from '../src/react/utils/placement.js';

test('Table supports expandable rows, inline cell editing with validation, virtualization, and keyboard grid navigation', async () => {
  const user = userEvent.setup();
  const onCellEdit = vi.fn();
  const rows = [
    { id: 'r1', name: 'Alpha', owner: 'Asha' },
    { id: 'r2', name: 'Beta', owner: 'Nora' },
  ];
  render(
    <Table
      caption="Projects"
      rows={rows}
      getRowKey={(r) => r.id}
      gridNavigation
      renderExpandedRow={(r) => <div>Details for {r.name}</div>}
      columns={[
        {
          key: 'name',
          header: 'Project',
          editable: true,
          validate: (val) => (String(val).trim().length < 3 ? 'Name too short' : undefined),
          onCellEdit,
        },
        { key: 'owner', header: 'Owner' },
      ]}
    />,
  );

  // Expandable row
  const expandBtn = screen.getByRole('button', { name: 'Expand row r1' });
  await user.click(expandBtn);
  expect(expandBtn).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Details for Alpha')).toBeInTheDocument();

  // Keyboard grid navigation
  const firstCell = document.querySelector<HTMLElement>('[data-grid-cell="0:0"]')!;
  firstCell.focus();
  await user.keyboard('{ArrowRight}');
  expect(document.querySelector('[data-grid-cell="0:1"]')).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(document.querySelector('[data-grid-cell="1:1"]')).toHaveFocus();
  await user.keyboard('{ArrowLeft}{ArrowUp}');
  expect(firstCell).toHaveFocus();

  // Inline editing + validation error + commit
  await user.keyboard('{Enter}');
  const input = screen.getByRole('textbox', { name: 'Edit Project' });
  await user.clear(input);
  await user.type(input, 'Al{Enter}');
  expect(screen.getByRole('alert')).toHaveTextContent('Name too short');
  expect(onCellEdit).not.toHaveBeenCalled();

  await user.clear(input);
  await user.type(input, 'Atlas{Enter}');
  await waitFor(() => expect(onCellEdit).toHaveBeenCalledWith('r1', 'name', 'Atlas', rows[0]));
});

test('Table virtualizes large datasets with accurate aria-rowcount and aria-rowindex', () => {
  const bigRows = Array.from({ length: 500 }, (_, i) => ({ id: i, name: `Row ${i}` }));
  render(
    <Table
      caption="Large dataset"
      rows={bigRows}
      getRowKey={(r) => r.id}
      virtualize={{ rowHeight: 40, height: 200, overscan: 2 }}
      columns={[{ key: 'name', header: 'Name' }]}
    />,
  );
  const table = screen.getByRole('table');
  expect(table).toHaveAttribute('aria-rowcount', '500');
  const renderedDataRows = table.querySelectorAll('tbody tr[aria-rowindex]');
  expect(renderedDataRows.length).toBeLessThan(20);
  expect(renderedDataRows[0]).toHaveAttribute('aria-rowindex', '1');
});

test('DataTable forwards expandable rows and editable columns', async () => {
  const user = userEvent.setup();
  const onCellEdit = vi.fn();
  const rows = [{ id: '1', name: 'Core' }];
  render(
    <DataTable
      caption="Workspaces"
      rows={rows}
      getRowKey={(r) => r.id}
      renderExpandedRow={(r) => <span>Expanded {r.name}</span>}
      columns={[{ key: 'name', header: 'Name', editable: true, onCellEdit }]}
    />,
  );
  await user.click(screen.getByRole('button', { name: /Expand row/i }));
  expect(screen.getByText('Expanded Core')).toBeInTheDocument();
});

test('SidebarProvider persists collapsed state, supports nested SidebarSection, and SidebarDrawer traps focus', async () => {
  const user = userEvent.setup();
  localStorage.clear();

  function NavProbe() {
    const { setMobileOpen } = useSidebar();
    return <>
      <Button onClick={() => setMobileOpen(true)}>Open nav drawer</Button>
      <Sidebar collapsible heading="Workspace">
        <SidebarSection heading="Engineering" defaultOpen>
          <SidebarLink href="#api" label="API" />
        </SidebarSection>
      </Sidebar>
      <SidebarDrawer title="Mobile navigation">
        <SidebarLink href="#home" label="Home" />
      </SidebarDrawer>
    </>;
  }

  const first = render(<SidebarProvider storageKey="test-nav-collapsed"><NavProbe /></SidebarProvider>);
  const sectionTrigger = screen.getByRole('button', { name: 'Engineering' });
  expect(sectionTrigger).toHaveAttribute('aria-expanded', 'true');
  await user.click(sectionTrigger);
  expect(sectionTrigger).toHaveAttribute('aria-expanded', 'false');

  const collapseBtn = screen.getByRole('button', { name: 'Toggle sidebar navigation' });
  await user.click(collapseBtn);
  expect(localStorage.getItem('test-nav-collapsed')).toBe('true');

  await user.click(screen.getByRole('button', { name: 'Open nav drawer' }));
  const drawer = screen.getByRole('dialog', { name: 'Mobile navigation' });
  expect(within(drawer).getByRole('link', { name: 'Home' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  first.unmount();
  render(<SidebarProvider storageKey="test-nav-collapsed"><NavProbe /></SidebarProvider>);
  expect(screen.getByRole('button', { name: 'Toggle sidebar navigation' })).toHaveAttribute('aria-expanded', 'false');
});

test('Fieldset, useAsyncValidation, and DateRangeCalendar support async validation, localization, time ranges, and form reset', async () => {
  const user = userEvent.setup();
  const onRange = vi.fn();

  function AsyncForm() {
    const [name, setName] = useState('');
    const { error, validating, validate, reset } = useAsyncValidation(async (val: string) => {
      if (val === 'taken') return 'Name already taken';
      return undefined;
    });
    return (
      <Form onReset={() => { setName(''); reset(); }}>
        <Fieldset legend="Release window" orientation="horizontal">
          <Field label="Release name" error={error} hint={validating ? 'Checking…' : undefined}>
            <Input value={name} onChange={(e) => { setName(e.target.value); void validate(e.target.value); }} />
          </Field>
          <Field label="Window">
            <DateRangeCalendar
              name="window"
              locale="en-US"
              showTime
              defaultValue={{ start: '2026-11-10', end: '2026-11-12', startTime: '09:30', endTime: '17:00' }}
              onValueChange={onRange}
            />
          </Field>
        </Fieldset>
        <Button type="reset">Reset</Button>
      </Form>
    );
  }

  render(<AsyncForm />);
  const input = screen.getByRole('textbox', { name: 'Release name' });
  await user.type(input, 'taken');
  await waitFor(() => expect(screen.getByText('Name already taken')).toBeInTheDocument());

  const rangeBtn = screen.getByRole('button', { name: 'Window' });
  await user.click(rangeBtn);
  const timeInput = screen.getByLabelText('End time');
  fireEvent.change(timeInput, { target: { value: '18:15' } });
  expect(onRange).toHaveBeenCalledWith(expect.objectContaining({ endTime: '18:15' }));

  await user.click(screen.getByRole('button', { name: 'Reset' }));
  await waitFor(() => expect(screen.queryByText('Name already taken')).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Window' })).toHaveTextContent(/Nov 10, 2026 09:30 – Nov 12, 2026 17:00/i);
});

test('Nested Popover inside Modal closes top-down on Escape and computePlacement flips on collision', async () => {
  const user = userEvent.setup();
  const onModalClose = vi.fn();

  render(
    <Modal open onClose={onModalClose} title="Parent modal">
      <Popover trigger="Options" label="Option panel">
        <button type="button">Inner action</button>
      </Popover>
    </Modal>,
  );

  await user.click(screen.getByRole('button', { name: 'Options' }));
  expect(screen.getByRole('dialog', { name: 'Option panel' })).toBeInTheDocument();

  // First Escape closes only the Popover, leaving the Modal open
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog', { name: 'Option panel' })).not.toBeInTheDocument();
  expect(onModalClose).not.toHaveBeenCalled();

  // Second Escape closes the Modal
  await user.keyboard('{Escape}');
  expect(onModalClose).toHaveBeenCalledOnce();

  // Collision-aware placement flips near bottom-right viewport edge
  expect(
    computePlacement(
      { top: 700, bottom: 740, left: 950, right: 1010 },
      { width: 220, height: 180 },
      { side: 'bottom', align: 'start' },
      { width: 1024, height: 768 },
    ),
  ).toEqual({ side: 'top', align: 'end' });
});
