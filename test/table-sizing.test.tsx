import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { Table } from '../src/react/Table.js';
const columns = [{key:'id',header:'ID',width:100,pinned:'start' as const,resizable:true},{key:'name',header:'Name',width:160,pinned:'start' as const}];
const rows = [{id:'a',name:'Atlas'}];
test('resizing updates the adjacent pinned offset', () => {
  render(<Table columns={columns} rows={rows} getRowKey={row => row.id} />);
  fireEvent.change(screen.getByRole('slider', {name:'Resize ID'}), {target:{value:'200'}});
  expect(screen.getByRole('columnheader', {name:'Name'}).style.insetInlineStart).toBe('200px');
});
test('controlled widths report changes without overriding the parent', () => {
  const change = vi.fn();
  render(<Table columns={columns} rows={rows} getRowKey={row => row.id} columnWidths={{id:120}} onColumnWidthsChange={change} />);
  fireEvent.change(screen.getByRole('slider'), {target:{value:'240'}});
  expect(change).toHaveBeenCalledWith({id:240});
  expect(screen.getByRole('columnheader', {name:'Name'}).style.insetInlineStart).toBe('120px');
});
