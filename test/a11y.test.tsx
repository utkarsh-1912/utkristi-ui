import { render } from '@testing-library/react';
import axe from 'axe-core';
import { expect, test } from 'vitest';
import {
  Alert, Badge, Button, DataTable, Field, Fieldset, Icon, Input, Select, Sidebar, SidebarLink, SidebarSection,
  Tabs, ThemeProvider,
} from '../src/react/index.js';

const themes = ['dark', 'light', 'glass'] as const;

test.each(themes)('core enterprise primitives have zero axe-core violations in %s theme', async (theme) => {
  const { container } = render(
    <ThemeProvider defaultTheme={theme} storageKey={null}>
      <main data-theme={theme}>
        <h1>Accessibility suite</h1>
        <Alert title="System status" tone="ok">All services operational.</Alert>
        <div className="sample-row">
          <Button>Primary action</Button>
          <Button variant="ghost">Secondary</Button>
          <Badge tone="accent">Verified</Badge>
          <Icon name="shield" label="Protected" />
        </div>
        <Fieldset legend="Account details">
          <Field label="Workspace">
            <Input defaultValue="Studio" />
          </Field>
          <Field label="Region">
            <Select defaultValue="us">
              <option value="us">US East</option>
              <option value="eu">EU West</option>
            </Select>
          </Field>
        </Fieldset>
        <Sidebar heading="Navigation" collapsible>
          <SidebarSection heading="Section">
            <SidebarLink href="#overview" label="Overview" />
          </SidebarSection>
        </Sidebar>
        <Tabs
          label="Sections"
          items={[
            { id: 'one', label: 'First', content: <p>First panel</p> },
            { id: 'two', label: 'Second', content: <p>Second panel</p> },
          ]}
        />
        <DataTable
          caption="Sample orders"
          rows={[{ id: '1', symbol: 'ALP', qty: 100 }]}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'symbol', header: 'Symbol', sortValue: (r) => r.symbol },
            { key: 'qty', header: 'Quantity', num: true, sortValue: (r) => r.qty },
          ]}
        />
      </main>
    </ThemeProvider>,
  );

  // jsdom does not compute CSS color contrast, so disable color-contrast (covered by test/contrast.test.ts)
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
});
