import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Checkbox, DataTable, Dialog, Empty, Field,
  Icon, Input, ScrollArea, Select, Switch, Tabs, type DataTableRowKey, useToast,
} from '@utkristi/ui';
import type { Example } from './examples';
import { workflowBlocks } from './workflow-blocks';

const stack: CSSProperties = { display: 'grid', gap: 16, minWidth: 0 };
const actions: CSSProperties = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 };
const initialProjects = [
  { id: 1, name: 'Design system', owner: 'Asha Rao', status: 'Active' },
  { id: 2, name: 'Product website', owner: 'Nora Chen', status: 'Active' },
  { id: 3, name: 'Partner launch', owner: 'Mika Laurent', status: 'Draft' },
];

function ProjectDirectory() {
  const toast = useToast();
  const nextId = useRef(4);
  const [rows, setRows] = useState(initialProjects);
  const [selected, setSelected] = useState<readonly DataTableRowKey[]>([]);
  const [editing, setEditing] = useState<typeof initialProjects[number] | 'new' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const project = editing === 'new' ? undefined : editing ?? undefined;
  return <Card>
    <CardHeader style={{ flexWrap: 'wrap' }}><div><span className="label">Workspace</span><div><strong>Projects</strong> <Badge>{rows.length}</Badge></div></div>
      <Button size="sm" iconLeft={<Icon name="plus" />} onClick={() => setEditing('new')}>Add project</Button>
    </CardHeader>
    <CardBody style={stack}>
      {selected.length > 0 && <div style={actions}><span role="status">{selected.length} selected</span>
        <Button size="sm" variant="ghost" onClick={() => setDeleting(true)}>Delete selected</Button></div>}
      {rows.length ? <DataTable rows={rows} aria-label="Projects" getRowKey={(row) => row.id} searchLabel="Search projects" pageSize={5}
        selection={{ selectedKeys: selected, onSelectionChange: setSelected, getRowCheckboxLabel: (row) => `Select ${row.name}` }}
        columns={[
          { key: 'name', header: 'Project', sortValue: (row) => row.name },
          { key: 'owner', header: 'Owner', sortValue: (row) => row.owner },
          { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Active' ? 'ok' : 'neutral'}>{row.status}</Badge> },
          { key: 'actions', header: 'Actions', render: (row) => <Button size="sm" variant="plain" aria-label={`Edit ${row.name}`} onClick={() => setEditing(row)}>Edit</Button> },
        ]} /> : <Empty title="No projects yet"><p>Add a project to start organizing your work.</p></Empty>}
    </CardBody>
    <Dialog open={editing !== null} title={project ? 'Edit project' : 'Add project'} onClose={() => setEditing(null)}
      footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save project</Button></>}
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget);
        const name = String(form.get('project') ?? '').trim();
        const owner = String(form.get('owner') ?? '').trim();
        if (!name || !owner) return;
        const entry = { id: project?.id ?? nextId.current++, name, owner, status: String(form.get('status')) };
        setRows((current) => project ? current.map((row) => row.id === entry.id ? entry : row) : [...current, entry]);
        setEditing(null);
        toast.show({ title: project ? 'Project updated' : 'Project added' });
      }}>
      <Field label="Project name" required><Input name="project" defaultValue={project?.name} pattern=".*\S.*" /></Field>
      <Field label="Owner" required><Input name="owner" defaultValue={project?.owner} pattern=".*\S.*" /></Field>
      <Field label="Status"><Select name="status" defaultValue={project?.status ?? 'Draft'}><option>Draft</option><option>Active</option></Select></Field>
    </Dialog>
    <Dialog open={deleting} title="Delete selected projects?" description="The selected rows will be removed from this workspace."
      onClose={() => setDeleting(false)} footer={<><Button variant="ghost" onClick={() => setDeleting(false)}>Cancel</Button>
        <Button variant="danger" onClick={() => {
          setRows((current) => current.filter((row) => !selected.includes(row.id)));
          setSelected([]);
          setDeleting(false);
          toast.show({ title: 'Projects deleted' });
        }}>Delete projects</Button></>} />
  </Card>;
}

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  return <Card style={{ maxWidth: 420, marginInline: 'auto' }}><CardBody style={stack}>
    <div><span className="label">Workspace access</span><h2 style={{ margin: '6px 0 0' }}>Sign in</h2></div>
    <form style={stack} onSubmit={(event) => {
      event.preventDefault();
      setAddress(String(new FormData(event.currentTarget).get('email')));
      event.currentTarget.reset();
    }}>
      <Field label="Email address" required><Input name="email" type="email" autoComplete="email" /></Field>
      <Field label="Password" required><Input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" /></Field>
      <Checkbox label="Show password" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
      <Button type="submit" block>Sign in</Button>
    </form>
    {address && <Alert title="Form submitted" tone="ok">The example accepted {address}. Connect your authentication service to sign users in.</Alert>}
  </CardBody></Card>;
}

function WorkspaceSettings() {
  const id = useId();
  const [saved, setSaved] = useState('Studio');
  const [name, setName] = useState(saved);
  const [digest, setDigest] = useState(true);
  const [savedDigest, setSavedDigest] = useState(true);
  const changed = name !== saved || digest !== savedDigest;
  const toast = useToast();
  return <Card style={{ maxWidth: 640, marginInline: 'auto' }}>
    <CardHeader><strong>Workspace settings</strong><Badge tone={changed ? 'warn' : 'ok'}>{changed ? 'Unsaved' : 'Saved'}</Badge></CardHeader>
    <CardBody><form aria-labelledby={id} style={stack} onSubmit={(event) => {
      event.preventDefault();
      setName(name.trim());
      setSaved(name.trim());
      setSavedDigest(digest);
      toast.show({ title: 'Settings saved' });
    }}>
      <span className="label" id={id}>General preferences</span>
      <Field label="Workspace name" required><Input value={name} pattern=".*\S.*" onChange={(event) => setName(event.target.value)} /></Field>
      <Switch label="Send a weekly activity digest" checked={digest} onCheckedChange={setDigest} />
      <div style={actions}><Button type="submit" disabled={!changed}>Save changes</Button>
        <Button variant="ghost" disabled={!changed} onClick={() => { setName(saved); setDigest(savedDigest); }}>Discard changes</Button></div>
    </form></CardBody>
  </Card>;
}

const plans = [
  { name: 'Starter', description: 'For individuals and prototypes.', monthly: 0, yearly: 0, features: ['One workspace', 'Shared components'] },
  { name: 'Team', description: 'For teams building together.', monthly: 24, yearly: 19, features: ['Unlimited workspaces', 'Shared components', 'Team permissions'] },
  { name: 'Studio', description: 'For multiple teams and brands.', monthly: 48, yearly: 39, features: ['Everything in Team', 'Brand themes', 'Priority support'] },
];

function PricingPlans() {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState('');
  return <div style={stack}>
    <div style={{ ...actions, justifyContent: 'space-between' }}><strong>Choose your plan</strong>
      <Switch label="Bill yearly" checked={yearly} onCheckedChange={setYearly} /></div>
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))' }}>
      {plans.map((plan) => <Card key={plan.name}>
        <CardBody style={{ ...stack, height: '100%', gridTemplateRows: 'auto auto 1fr auto' }}>
          <div><strong>{plan.name}</strong><div className="muted">{plan.description}</div></div>
          <div><strong style={{ fontSize: 30 }}>${yearly ? plan.yearly : plan.monthly}</strong> / month</div>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <Button block variant={plan.name === 'Team' ? 'solid' : 'ghost'} aria-pressed={selected === plan.name}
            onClick={() => setSelected(plan.name)}>{selected === plan.name ? 'Selected' : `Choose ${plan.name}`}</Button>
        </CardBody>
      </Card>)}
    </div>
    {selected && <Alert title={`${selected} selected`} tone="ok">Billing period: {yearly ? 'Yearly' : 'Monthly'}.</Alert>}
  </div>;
}

const templatePresets = [['signal', 'Signal'], ['ledger', 'Ledger'], ['terminal', 'Terminal']] as const;

function TemplateSurface({ name, preset, controls, children }: {
  name: string;
  preset: typeof templatePresets[number][0];
  controls?: ReactNode;
  children: ReactNode;
}) {
  const [active, setActive] = useState(preset);
  return <section className="ut-template" aria-label={name} data-ut-preset={active}>
    <div className="ut-template-toolbar">
      <strong>{name}</strong>
      <div>{controls}<Select aria-label="Template preset" value={active} onChange={(event) => {
        const next = templatePresets.find(([id]) => id === event.target.value);
        if (next) setActive(next[0]);
      }}>{templatePresets.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select></div>
    </div>
    {children}
  </section>;
}

const capabilities = [
  { name: 'Release confidence', icon: 'layers', detail: 'See rollout status and ownership at a glance. Give every team a clear path from staging to production.' },
  { name: 'Access governance', icon: 'shield-check', detail: 'Define approval boundaries and keep access reviews in the same workspace as the work.' },
  { name: 'Operational visibility', icon: 'activity-pulse', detail: 'Connect service health, change history, and incident ownership in one view.' },
] as const;

function EnterpriseLanding() {
  const features = useRef<HTMLElement>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  return <TemplateSurface name="Meridian Cloud" preset="signal">
    <div className="ut-enterprise-hero">
      <div className="ut-enterprise-intro">
        <span className="label">Enterprise infrastructure</span>
        <h2>Ship across teams with confidence.</h2>
        <p>Give engineering, security, and operations one place to release software and see what changed.</p>
        <div className="ut-template-actions">
          <Button onClick={() => setContactOpen(true)} iconRight={<Icon name="arrow-right" />}>Request a demo</Button>
          <Button variant="ghost" onClick={() => features.current?.focus()}>Explore capabilities</Button>
        </div>
        {requested && <p role="status">Demo request recorded for this preview.</p>}
      </div>
      <div className="ut-enterprise-preview" aria-label="Release workspace illustration">
        <div className="ut-enterprise-preview-head"><span><Icon name="layers" /> Production workspace</span><Badge tone="ok">Healthy</Badge></div>
        <div className="ut-enterprise-metric"><span className="label">Release 24.08</span><strong>Ready to promote</strong>
          <span>3 of 3 checks passed</span></div>
        <ul>{['Build verified', 'Access review complete', 'Rollback tested'].map((check) =>
          <li key={check}><Icon name="check" size={16} />{check}</li>)}</ul>
      </div>
    </div>
    <div className="ut-enterprise-strip" aria-label="Platform controls">
      {['Single sign-on', 'Role-based access', 'Audit trail', 'Release approvals'].map((item) => <span key={item}>{item}</span>)}
    </div>
    <section ref={features} tabIndex={-1} className="ut-enterprise-features">
      <div><span className="label">Platform capabilities</span><h3>Built for shared ownership</h3></div>
      <div>{capabilities.map((item) => <article key={item.name}>
        <Icon name={item.icon} size={22} /><h4>{item.name}</h4><p>{item.detail}</p>
      </article>)}</div>
    </section>
    <Dialog open={contactOpen} onClose={() => setContactOpen(false)} title="Request a demo">
      <form className="ut-template-form" onSubmit={(event) => {
        event.preventDefault();
        setContactOpen(false);
        setRequested(true);
      }}>
        <Field label="Work email" required><Input type="email" name="email" autoComplete="email" /></Field>
        <Button type="submit">Submit demo request</Button>
      </form>
    </Dialog>
  </TemplateSurface>;
}

const sampleOrders = [
  { id: 'EX-1042', symbol: 'ALP', side: 'Buy', quantity: 12000, limit: 184.30, route: 'SIM-A', strategy: 'VWAP', status: 'Partial',
    fills: [{ time: '14:31:02', quantity: 1800, price: 184.26 }, { time: '14:31:16', quantity: 1400, price: 184.28 }] },
  { id: 'EX-1043', symbol: 'NVOX', side: 'Sell', quantity: 8500, limit: 92.15, route: 'SIM-B', strategy: 'Limit', status: 'Working',
    fills: [] },
  { id: 'EX-1044', symbol: 'MIDX', side: 'Buy', quantity: 5000, limit: 48.90, route: 'SIM-C', strategy: 'TWAP', status: 'Filled',
    fills: [{ time: '14:28:10', quantity: 2000, price: 48.87 }, { time: '14:29:35', quantity: 3000, price: 48.89 }] },
  { id: 'EX-1045', symbol: 'ORBT', side: 'Sell', quantity: 2400, limit: 126.80, route: 'SIM-A', strategy: 'Limit', status: 'Rejected',
    fills: [] },
  { id: 'EX-1046', symbol: 'HYPR', side: 'Buy', quantity: 6000, limit: 37.42, route: 'SIM-B', strategy: 'POV', status: 'Working',
    fills: [] },
];

const orderStatusTones = { Working: 'neutral', Partial: 'warn', Filled: 'ok', Rejected: 'bad' } as const;
const orderQuantity = new Intl.NumberFormat('en-US');
const orderPrice = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function filledQuantity(order: typeof sampleOrders[number]) {
  return order.fills.reduce((sum, fill) => sum + fill.quantity, 0);
}

function ExecutionDesk() {
  const [selected, setSelected] = useState(sampleOrders[0].id);
  const [status, setStatus] = useState('');
  const [compact, setCompact] = useState(true);
  const [stale, setStale] = useState(false);
  const rows = sampleOrders.filter((order) => !status || order.status === status);
  const order = rows.find((item) => item.id === selected) ?? rows[0];
  return <TemplateSurface name="Execution workstation" preset="terminal"
    controls={<Switch label="Compact rows" checked={compact} onCheckedChange={setCompact} />}>
    <div className="ut-desk" data-density={compact ? 'compact' : 'comfortable'}>
      <div className="ut-desk-summary">
        <div><span className="label">Execution / equities</span><h2>Order blotter</h2></div>
        <div className="ut-template-actions"><Badge>Simulation</Badge><span role="status"><Badge tone={stale ? 'warn' : 'ok'}>
          {stale ? 'Snapshot stale' : 'Snapshot current'}</Badge></span>
          <time dateTime="14:31:21Z">14:31:21 UTC</time></div>
      </div>
      {stale && <Alert tone="warn" title="Stale snapshot">Order and fill details show the last simulated update.</Alert>}
      <div className="ut-desk-workspace">
        <section className="ut-desk-blotter" aria-label="Order blotter">
          <div className="ut-desk-panel-head"><strong>Orders</strong>
            <Select aria-label="Order status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {Object.keys(orderStatusTones).map((label) => <option key={label}>{label}</option>)}
            </Select>
          </div>
          <ScrollArea className="ut-desk-table" orientation="horizontal" aria-label="Scrollable orders">
            <DataTable aria-label="Simulated orders" searchLabel="Search orders" pageSize={8} rows={rows} getRowKey={(item) => item.id} columns={[
              { key: 'id', header: 'Order', sortValue: (item) => item.id, render: (item) =>
                <Button size="sm" variant="quiet" aria-pressed={item.id === order?.id} onClick={() => setSelected(item.id)}>{item.id}</Button> },
              { key: 'symbol', header: 'Symbol', sortValue: (item) => item.symbol },
              { key: 'side', header: 'Side', render: (item) => <span data-side={item.side}>{item.side}</span> },
              { key: 'quantity', header: 'Qty', num: true, sortValue: (item) => item.quantity, render: (item) => orderQuantity.format(item.quantity) },
              { key: 'filled', header: 'Filled', num: true, sortValue: filledQuantity, render: (item) => orderQuantity.format(filledQuantity(item)) },
              { key: 'status', header: 'Status', render: (item) =>
                <Badge tone={orderStatusTones[item.status as keyof typeof orderStatusTones]}>{item.status}</Badge> },
            ]} />
          </ScrollArea>
        </section>
        {order && <section className="ut-desk-inspector" aria-label="Selected order">
          <div className="ut-desk-panel-head"><div><span className="label">{order.id}</span><h3>{order.symbol}</h3></div>
            <Badge tone={orderStatusTones[order.status as keyof typeof orderStatusTones]}>{order.status}</Badge></div>
          <dl><div><dt>Limit</dt><dd>${orderPrice.format(order.limit)}</dd></div>
            <div><dt>Filled / Order qty</dt><dd>{orderQuantity.format(filledQuantity(order))} / {orderQuantity.format(order.quantity)}</dd></div></dl>
          <Tabs label="Selected order details" items={[
            { id: 'route', label: 'Route', content: <dl><div><dt>Destination</dt><dd>{order.route}</dd></div>
              <div><dt>Strategy</dt><dd>{order.strategy}</dd></div></dl> },
            { id: 'fills', label: 'Fills', content: order.fills.length ? <ul className="ut-desk-fills">
              {order.fills.map((fill) => <li key={fill.time}><time>{fill.time}</time><span>{orderQuantity.format(fill.quantity)} @ ${orderPrice.format(fill.price)}</span></li>)}</ul> : <p>No fills for this order.</p> },
          ]} />
        </section>}
      </div>
      <div className="ut-desk-foot"><span>Sample orders and prices</span>
        <Switch label="Simulate stale data" checked={stale} onCheckedChange={setStale} /></div>
    </div>
  </TemplateSurface>;
}

export const blocks = {
  ...workflowBlocks,
  'enterprise-landing': { name: 'Enterprise landing', category: 'Marketing',
    description: 'Product-led landing page with a release preview, trust strip, and a demo request flow.',
    preview: EnterpriseLanding, jsx: '',
    html: '<section class="ut-template" data-ut-preset="signal"><div class="ut-template-toolbar"><strong>Meridian Cloud</strong></div><div class="ut-enterprise-hero"><div class="ut-enterprise-intro"><span class="label">Enterprise infrastructure</span><h2>Ship across teams with confidence.</h2><p>One workspace to release software and see what changed.</p><a class="btn btn-solid" href="#capabilities">Explore capabilities</a></div><div class="ut-enterprise-preview"><div class="ut-enterprise-metric"><span class="label">Release 24.08</span><strong>Ready to promote</strong><span>3 of 3 checks passed</span></div></div></div><section id="capabilities" class="ut-enterprise-features"><h3>Built for shared ownership</h3><p>Release confidence, access governance, and operational visibility.</p></section></section>' },
  'execution-desk': { name: 'Execution desk', category: 'Application',
    description: 'Simulated multi-order blotter with status filters, density control, and linked route and fill details.',
    preview: ExecutionDesk, jsx: '',
    html: '<section class="ut-template" data-ut-preset="terminal"><div class="ut-template-toolbar"><strong>Execution workstation</strong><span class="badge">Simulation</span></div><div class="ut-desk" data-density="compact"><header class="ut-desk-summary"><h2>Order blotter</h2><time datetime="14:31:21Z">14:31:21 UTC</time></header><div class="ut-desk-table ut-scrollbar" tabindex="0" role="region" aria-label="Simulated orders"><table class="table"><thead><tr><th scope="col">Order</th><th scope="col">Symbol</th><th scope="col">Side</th><th scope="col">Quantity</th><th scope="col">Status</th></tr></thead><tbody><tr><td>EX-1042</td><td>ALP</td><td>Buy</td><td>12,000</td><td>Partial</td></tr></tbody></table></div></div></section>' },
  'project-directory': { name: 'Project directory', category: 'Application', description: 'Search and sort projects, edit rows, and confirm bulk deletion.',
    preview: ProjectDirectory, jsx: '', html: '<section class="card"><header class="card-head">Projects</header><div class="card-body"><table class="table"><thead><tr><th scope="col">Project</th><th scope="col">Owner</th></tr></thead><tbody><tr><td>Design system</td><td>Asha Rao</td></tr></tbody></table></div></section>' },
  'sign-in': { name: 'Sign in', category: 'Account', description: 'A compact sign-in form with validation and password visibility.',
    preview: SignIn, jsx: '', html: '<form class="card card-body"><label class="field">Email address<input class="input" type="email" name="email" required></label><label class="field">Password<input class="input" type="password" name="password" required></label><button class="btn btn-solid" type="submit">Sign in</button></form>' },
  'workspace-settings': { name: 'Workspace settings', category: 'Application', description: 'Save preferences or discard edits with a clear unsaved state.',
    preview: WorkspaceSettings, jsx: '', html: '<section class="card"><header class="card-head">Workspace settings</header><div class="card-body"><label class="field">Workspace name<input class="input" value="Studio"></label><label><input class="checkbox" type="checkbox" checked> Send a weekly activity digest</label></div></section>' },
  'pricing-plans': { name: 'Pricing plans', category: 'Marketing', description: 'Compare three plans and switch between monthly and yearly billing.',
    preview: PricingPlans, jsx: '', html: '<section class="card"><header class="card-head">Team</header><div class="card-body"><p><strong>$24</strong> / month</p><ul><li>Unlimited workspaces</li><li>Team permissions</li></ul><button class="btn btn-solid" type="button">Choose Team</button></div></section>' },
} satisfies Record<string, Example & { category: string }>;
