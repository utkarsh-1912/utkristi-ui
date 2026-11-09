import { useId, useRef, useState, type CSSProperties } from 'react';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Checkbox, DataTable, Dialog, Empty, Field,
  Icon, Input, Select, Switch, type DataTableRowKey, useToast,
} from '@utkristi/ui';
import type { Example } from './examples';

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
      {plans.map((plan) => <Card key={plan.name} pane={plan.name === 'Team'}>
        <CardBody style={{ ...stack, height: '100%', gridTemplateRows: 'auto auto 1fr auto' }}>
          <div><strong>{plan.name}</strong><div>{plan.description}</div></div>
          <div><strong style={{ fontSize: 30 }}>${yearly ? plan.yearly : plan.monthly}</strong> / month</div>
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <Button block variant={plan.name === 'Team' ? 'solid' : 'ghost'} onClick={() => setSelected(plan.name)}>Choose {plan.name}</Button>
        </CardBody>
      </Card>)}
    </div>
    {selected && <Alert title={`${selected} selected`} tone="ok">Billing period: {yearly ? 'Yearly' : 'Monthly'}.</Alert>}
  </div>;
}

export const blocks = {
  'project-directory': { name: 'Project directory', category: 'Application', description: 'Search and sort projects, edit rows, and confirm bulk deletion.',
    preview: ProjectDirectory, jsx: '', html: '<section class="card"><header class="card-head">Projects</header><div class="card-body"><table class="table"><thead><tr><th scope="col">Project</th><th scope="col">Owner</th></tr></thead><tbody><tr><td>Design system</td><td>Asha Rao</td></tr></tbody></table></div></section>' },
  'sign-in': { name: 'Sign in', category: 'Account', description: 'A compact sign-in form with validation and password visibility.',
    preview: SignIn, jsx: '', html: '<form class="card card-body"><label class="field">Email address<input class="input" type="email" name="email" required></label><label class="field">Password<input class="input" type="password" name="password" required></label><button class="btn btn-solid" type="submit">Sign in</button></form>' },
  'workspace-settings': { name: 'Workspace settings', category: 'Application', description: 'Save preferences or discard edits with a clear unsaved state.',
    preview: WorkspaceSettings, jsx: '', html: '<section class="card"><header class="card-head">Workspace settings</header><div class="card-body"><label class="field">Workspace name<input class="input" value="Studio"></label><label><input class="checkbox" type="checkbox" checked> Send a weekly activity digest</label></div></section>' },
  'pricing-plans': { name: 'Pricing plans', category: 'Marketing', description: 'Compare three plans and switch between monthly and yearly billing.',
    preview: PricingPlans, jsx: '', html: '<section class="card"><header class="card-head">Team</header><div class="card-body"><p><strong>$24</strong> / month</p><ul><li>Unlimited workspaces</li><li>Team permissions</li></ul><button class="btn btn-solid" type="button">Choose Team</button></div></section>' },
} satisfies Record<string, Example & { category: string }>;
