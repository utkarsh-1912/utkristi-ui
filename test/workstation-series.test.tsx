import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { createChartStream } from '../src/react/chart-stream.js';
import { workflowBlocks } from '../docs/src/workflow-blocks';

test('a burst wraps the sample window and keeps extrema, corrections and chronological order', () => {
  const source = createChartStream(4);
  let notices = 0;
  const unsubscribe = source.subscribe(() => notices++);
  source.append([1, 2, 90, -8, 5].map((value, time) => ({ value, time })));
  source.append([{ time: 4, value: 7 }, { time: 1, value: 99 }, { time: 5, value: NaN }]);
  expect(source.snapshot(1)).toEqual([{ time: 1, open: 2, high: 90, low: -8, close: 7 }]);
  unsubscribe();
  source.append([{ time: 5, value: 8 }]);
  expect(notices).toBe(2);
  expect(source.snapshot(2)).toHaveLength(2);
});

test('conversation model and attachment stay attributed when switching threads', () => {
  const Desk = workflowBlocks['conversation-desk'].preview;
  render(<Desk />);
  const modelPicker = screen.getByRole('combobox', { name: 'Reply model' });
  expect(modelPicker).toHaveTextContent('Relay');
  expect(screen.queryByText('Local model demo')).toBeNull();
  fireEvent.click(modelPicker);
  fireEvent.click(screen.getByRole('option', { name: 'Analyst' }));
  expect(modelPicker).toHaveTextContent('Analyst');
  fireEvent.change(screen.getByLabelText('Attach image'), { target: { files: [new File(['abc'], 'plot.png', { type: 'image/png' })] } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Inspect feed' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(screen.getByText(/Input summary: 2 words/)).toHaveTextContent('3 bytes');
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
  expect(screen.queryByText('plot.png')).toBeNull();
  fireEvent.change(screen.getByLabelText('Conversation history'), { target: { value: '1' } });
  expect(screen.getByText('plot.png')).toBeVisible();
});
