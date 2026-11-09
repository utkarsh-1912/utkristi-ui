import { useId, useState, type ReactNode } from 'react';
import { ArrowUpRight, Bell, Check, Copy, Ellipsis, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
import {
  Avatar, AvatarGroup, Badge, Button, Card, CardBody, CardHeader, Checkbox, Chip, Code, Dot, EmptyState,
  Field, Footer, IconButton, Input, Kbd, Logo, Menu, Modal, Navbar, Radio, RadioGroup, RichText, SearchInput,
  Segmented, Select, Shell, Skeleton, Slider, Spinner, SplitButton, Stat, Stats, Steps, Switch, Table, Tabs,
  Textarea, ThemeSwitch, ThemeToggle, Tooltip, useToast,
} from '@utkristi/ui';

import { catalog } from './catalog';

export interface Example {
  name: string;
  description: string;
  preview: () => ReactNode;
  html: string;
  jsx: string;
}
const views = [{ id: 'list', label: 'List' }, { id: 'grid', label: 'Grid' }, { id: 'activity', label: 'Activity' }];
const tabs = views.map((view) => ({ ...view, content: <p className="muted">{view.label} view</p> }));
const people = [
  { name: 'Asha Rao', role: 'Designer', changes: 24 },
  { name: 'Nora Chen', role: 'Engineer', changes: 16 },
  { name: 'Mika Laurent', role: 'Maintainer', changes: 8 },
];
const columns = [{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }, { key: 'changes', header: 'Changes', num: true }];
const links = [{ href: '#/overview', label: 'Overview', active: true }, { href: '#/showcase', label: 'Showcase' }];

function ModalPreview() {
  const [open, setOpen] = useState(false);
  return <><Button variant="ghost" onClick={() => setOpen(true)}>Open dialog</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Rename workspace" description="Choose a name your team will recognize."
      label="Workspace" footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
      <Field label="Name"><Input defaultValue="Studio" /></Field>
    </Modal></>;
}
function ToastPreview() {
  const toast = useToast();
  return <Button variant="ghost" onClick={() => toast.show({ title: 'Workspace saved', body: 'Your changes are synced.', tone: 'ok' })}>Show toast</Button>;
}
function ChipPreview() {
  const [pressed, setPressed] = useState(true);
  const [removed, remove] = useState(false);
  return <div className="sample-row"><Chip mono>Design</Chip><Chip accent pressed={pressed} onClick={() => setPressed(!pressed)}>Pinned</Chip>
    {removed ? <Button size="sm" variant="plain" onClick={() => remove(false)}>Restore</Button> : <Chip onRemove={() => remove(true)}>Utkristi</Chip>}</div>;
}
function ChoicePreview() {
  const group = useId();
  return <div className="sample-stack"><Checkbox label="Email updates" defaultChecked /><Checkbox label="Select all" indeterminate />
    <RadioGroup aria-label="Access" className="sample-row"><Radio name={group} label="Public" defaultChecked /><Radio name={group} label="Private" /></RadioGroup>
    <Switch label="Presence" defaultChecked /></div>;
}

function FooterPreview() {
  return <Footer lede={<><b>Build together.</b> Make it yours.</>} word={<>Utkristi <span className="faint">UI</span></>}
    bottom="Utkristi UI · 0.1.0" columns={[{ title: 'Explore', links }]} />;
}

export const examples = {
  ...catalog,
  button: {
    name: 'Button', description: 'Pill buttons for primary, secondary, and destructive actions.',
    preview: () => <div className="sample-row"><Button iconLeft={<Plus size={16} />}>Create</Button><Button variant="ghost">Preview</Button>
      <Button variant="quiet">Later</Button><Button variant="danger">Remove</Button><Button loading>Saving</Button></div>,
    html: '<button type="button" class="btn btn-solid">Create</button>',
    jsx: '<Button iconLeft={<Plus size={16} />}>Create</Button>',
  },
  'icon-button': {
    name: 'IconButton', description: 'Compact controls with an accessible label.',
    preview: () => <div className="sample-row"><IconButton label="Notifications" badge><Bell size={18} /></IconButton>
      <IconButton label="Open workspace" variant="circle"><ArrowUpRight size={18} /></IconButton>
      <IconButton label="Delete workspace" tone="danger"><Trash2 size={17} /></IconButton></div>,
    html: '<button type="button" class="icon-btn" aria-label="Notifications">🔔</button>',
    jsx: '<IconButton label="Notifications" badge><Bell size={18} /></IconButton>',
  },
  'split-button': {
    name: 'SplitButton', description: 'Pair a default action with a menu of related commands.',
    preview: () => <SplitButton label="New room" items={[
      { title: 'Open project', sub: 'Choose an existing workspace', icon: <FolderOpen size={16} /> },
      { title: 'Copy invite', sub: 'Share a link with your team', icon: <Copy size={16} /> },
    ]} />,
    html: '<div class="split-button"><button class="btn btn-solid split-button-main">New room</button><button class="btn btn-solid split-button-toggle" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">▾</button></div>',
    jsx: '<SplitButton label="New room" items={[{ title: "Open project", sub: "Choose a workspace" }]} />',
  },
  card: {
    name: 'Card', description: 'Layered surfaces, with an inverted pane for emphasis.',
    preview: () => <div className="sample-grid"><Card><CardHeader><strong>Workspace</strong><Badge tone="ok">Live</Badge></CardHeader><CardBody>Ready for collaborators.</CardBody></Card>
      <Card pane><CardBody><span className="label">Pane</span><p>An inverted surface.</p></CardBody></Card></div>,
    html: '<div class="card"><div class="card-head">Workspace</div><div class="card-body">Ready for collaborators.</div></div>',
    jsx: '<Card><CardHeader>Workspace</CardHeader><CardBody>Ready for collaborators.</CardBody></Card>',
  },
  field: {
    name: 'Field', description: 'Connect labels, descriptions, and errors to native form controls.',
    preview: () => <div className="sample-grid"><Field label="Workspace" hint="Visible to your team" required><Input placeholder="Studio" /></Field>
      <Field label="Role"><Select defaultValue="editor"><option value="editor">Editor</option><option value="viewer">Viewer</option></Select></Field>
      <Field label="Description"><Textarea placeholder="Add a note" /></Field>
      <Field label="Find a member"><SearchInput placeholder="Search names" shortcut="⌘ K" /></Field></div>,
    html: '<div class="field"><label class="field-label" for="name">Name</label><input class="input" id="name" aria-describedby="hint"><span class="field-hint" id="hint">Visible to your team</span></div>',
    jsx: '<Field label="Name" hint="Visible to your team"><Input /></Field>',
  },
  choice: {
    name: 'Choice', description: 'Native checkboxes and radios plus a labelled switch.',
    preview: ChoicePreview,
    html: '<label class="choice"><input class="checkbox" type="checkbox" checked> Email updates</label>',
    jsx: '<Checkbox label="Email updates" defaultChecked />',
  },
  slider: {
    name: 'Slider', description: 'A native range input with a value bubble and optional marks.',
    preview: () => <Slider label="Volume" defaultValue={40} marks={[0, 25, 50, 75, 100]} format={(value) => `${value}%`} />,
    html: '<div class="slider" style="--p: 40%; --pn: .4"><div class="slider-rail"><input type="range" aria-label="Volume" value="40"><output class="slider-bubble">40%</output></div></div>',
    jsx: '<Slider label="Volume" defaultValue={40} marks={[0, 25, 50, 75, 100]} format={(value) => `${value}%`} />',
  },
  segmented: {
    name: 'Segmented', description: 'A compact radio group for switching between related views.',
    preview: () => <Segmented aria-label="View" items={views} />,
    html: '<div class="seg" role="radiogroup" aria-label="View"><button class="seg-item" role="radio" aria-checked="true">List</button><button class="seg-item" role="radio" aria-checked="false" tabindex="-1">Grid</button></div>',
    jsx: '<Segmented aria-label="View" items={[{ id: "list", label: "List" }, { id: "grid", label: "Grid" }]} />',
  },
  tabs: {
    name: 'Tabs', description: 'Switch between panels with automatic or manual keyboard activation.',
    preview: () => <Tabs label="Workspace views" items={tabs} />,
    html: '<div class="tabs" role="tablist"><button class="tab" role="tab" id="summary" aria-selected="true" aria-controls="summary-panel">Summary</button></div><div class="tab-panel" role="tabpanel" id="summary-panel" aria-labelledby="summary">Details</div>',
    jsx: '<Tabs label="Workspace views" items={[{ id: "summary", label: "Summary", content: "Details" }]} />',
  },
  menu: {
    name: 'Menu', description: 'An action list with arrow navigation and first-letter search.',
    preview: () => <div className="sample-end"><Menu align="end" trigger={(props) => <Button {...props} variant="ghost" iconRight={<Ellipsis size={16} />}>Actions</Button>}
      items={[{ type: 'header', label: 'Workspace', sub: 'Studio' }, { label: 'Open', icon: <FolderOpen size={16} />, kbd: 'O' },
        { label: 'Copy link', icon: <Copy size={16} /> }, { type: 'separator' }, { label: 'Delete', icon: <Trash2 size={16} />, danger: true }]} /></div>,
    html: '<div class="menu" role="menu" aria-label="Actions"><button class="menu-item" role="menuitem">Copy link</button><div class="menu-sep" role="separator"></div><button class="menu-item menu-item-danger" role="menuitem">Delete</button></div>',
    jsx: '<Menu trigger={<button>Actions</button>} items={[{ label: "Copy link", onSelect: copyLink }]} />',
  },
  modal: {
    name: 'Modal', description: 'A themed portal with a focus trap and a mobile bottom sheet.',
    preview: ModalPreview,
    html: '<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="rename"><header class="modal-head"><h3 class="modal-title" id="rename">Rename workspace</h3></header><div class="modal-body">Choose a name.</div></div></div>',
    jsx: '<Modal open={open} onClose={() => setOpen(false)} title="Rename workspace">Choose a name.</Modal>',
  },
  toast: {
    name: 'Toast', description: 'Transient messages with a live announcement and a pausable timer.',
    preview: ToastPreview,
    html: '<div class="toast-region"><div class="toast" role="status"><strong class="toast-title">Workspace saved</strong><div class="toast-body">Your changes are synced.</div><span class="toast-track"></span></div></div>',
    jsx: 'const toast = useToast();\n<Button onClick={() => toast.show({ title: "Workspace saved", tone: "ok" })}>Save</Button>',
  },
  tooltip: {
    name: 'Tooltip', description: 'A short description shown on hover or keyboard focus.',
    preview: () => <Tooltip content="Copy workspace link"><Button variant="ghost" iconLeft={<Copy size={16} />}>Copy link</Button></Tooltip>,
    html: '<button class="btn btn-ghost" data-tip="Copy workspace link">Copy link</button>',
    jsx: '<Tooltip content="Copy workspace link"><Button variant="ghost">Copy link</Button></Tooltip>',
  },
  badge: {
    name: 'Badge', description: 'Compact labels for status, tone, and numeric counts.',
    preview: () => <div className="sample-row"><Badge>Draft</Badge><Badge tone="ok">Live</Badge><Badge tone="warn">Pending</Badge>
      <Badge tone="bad">Failed</Badge><Badge tone="accent">New</Badge><Badge tone="count">12</Badge></div>,
    html: '<span class="badge badge-ok">Live</span>',
    jsx: '<Badge tone="ok">Live</Badge>',
  },
  chip: {
    name: 'Chip', description: 'Small pills for filters, tags, and removable selections.',
    preview: ChipPreview,
    html: '<button class="chip chip-accent" aria-pressed="true">Pinned</button>',
    jsx: '<Chip accent pressed={pinned} onClick={() => setPinned(!pinned)}>Pinned</Chip>',
  },
  dot: {
    name: 'Dot', description: 'A status indicator with an optional accessible label.',
    preview: () => <div className="sample-row"><span className="label"><Dot /> Online</span><span className="label"><Dot tone="warn" /> Away</span>
      <span className="label"><Dot tone="bad" /> Busy</span><span className="label"><Dot tone="off" static /> Offline</span></div>,
    html: '<span class="dot dot-warn" role="img" aria-label="Away"></span>',
    jsx: '<Dot tone="warn" label="Away" />',
  },
  avatar: {
    name: 'Avatar', description: 'Deterministic initials, presence indicators, and overflow counts.',
    preview: () => <AvatarGroup max={3}><Avatar name="Asha Rao" me /><Avatar name="Nora Chen" status="ok" />
      <Avatar name="Mika Laurent" /><Avatar name="Alex Rivera" /></AvatarGroup>,
    html: '<span class="avatar avatar-me" role="img" aria-label="Asha Rao">AR</span>',
    jsx: '<AvatarGroup max={2}><Avatar name="Asha Rao" me /><Avatar name="Nora Chen" status="ok" /></AvatarGroup>',
  },
  skeleton: {
    name: 'Skeleton', description: 'Reserve space for content while it loads.',
    preview: () => <div className="sample-row"><Skeleton variant="circle" /><div className="sample-stack sample-grow">
      <Skeleton variant="text" width="75%" /><Skeleton variant="text" width="52%" /></div></div>,
    html: '<span class="skeleton skeleton-circle" aria-hidden="true"></span>',
    jsx: '<Skeleton variant="circle" />',
  },
  table: {
    name: 'Table', description: 'Responsive data tables with right-aligned numeric columns.',
    preview: () => <Table rows={people} columns={columns} getRowKey={(row) => row.name} caption="Contributors" stack />,
    html: '<div class="table-wrap"><table class="table"><caption>Contributors</caption><thead><tr><th scope="col">Name</th><th scope="col" class="num">Changes</th></tr></thead><tbody><tr><td>Asha Rao</td><td class="num">24</td></tr></tbody></table></div>',
    jsx: '<Table rows={[{ name: "Asha Rao", changes: 24 }]} columns={[{ key: "name", header: "Name" }, { key: "changes", header: "Changes", num: true }]} getRowKey={(row) => row.name} stack />',
  },
  'empty-state': {
    name: 'EmptyState', description: 'A clear next action when a view has nothing to display.',
    preview: () => <EmptyState title="No rooms" action={<Button iconLeft={<Plus size={16} />}>Create room</Button>}><p>Your rooms will appear here.</p></EmptyState>,
    html: '<div class="empty-state"><h2 class="display empty-state-title">No rooms</h2><p>Your rooms will appear here.</p></div>',
    jsx: '<EmptyState title="No rooms" action={<Button>Create room</Button>}><p>Your rooms will appear here.</p></EmptyState>',
  },
  navbar: {
    name: 'Navbar', description: 'Responsive navigation with a full-screen mobile sheet.',
    preview: () => <Navbar links={links} strip={{ left: 'Utkristi UI', right: '0.1.0' }} right={<IconButton label="Search"><Search size={17} /></IconButton>} />,
    html: '<header class="header"><div class="navbar"><div class="navbar-inner"><nav class="navbar-links" aria-label="Primary"><a href="#/overview" class="link">Overview</a></nav><button class="icon-btn burger" aria-label="Open menu">☰</button></div></div></header>',
    jsx: '<Navbar links={[{ href: "/", label: "Overview", active: true }]} />',
  },
  footer: {
    name: 'Footer', description: 'Link columns, an optional theme control, and a fitted wordmark.',
    preview: FooterPreview,
    html: '<footer class="footer"><div class="footer-inner"><div class="footer-top"><p class="lede">Build together.</p></div><div class="footer-bottom">Utkristi UI</div></div></footer>',
    jsx: '<Footer lede="Build together." word="Utkristi UI" themeSwitch={<ThemeSwitch />} bottom="0.1.0" />',
  },
  shell: {
    name: 'Shell', description: 'Compose the header, page content, and footer.',
    preview: () => <Shell className="sample-shell" navbar={{ links: links.slice(0, 1) }} footer={{ bottom: 'Utkristi UI' }}><p>Workspace content</p></Shell>,
    html: '<div class="shell"><header class="header"></header><main class="page">Workspace content</main><footer class="footer"></footer></div>',
    jsx: '<Shell navbar={{ links }} footer={{ bottom: "Utkristi UI" }}>Workspace content</Shell>',
  },
  steps: {
    name: 'Steps', description: 'Numbered navigation with an optional timed progress fill.',
    preview: () => <Steps aria-label="Setup steps" items={[{ id: 'create', label: 'Create' }, { id: 'invite', label: 'Invite' }, { id: 'ship', label: 'Ship' }]} autoplay={5000} />,
    html: '<div class="steps" style="--n: 2" role="radiogroup"><button class="step is-running" role="radio" aria-checked="true"><span class="label">01</span><b>Create</b></button><button class="step" role="radio" aria-checked="false" tabindex="-1"><span class="label">02</span><b>Invite</b></button></div>',
    jsx: '<Steps aria-label="Setup" items={[{ id: "create", label: "Create" }, { id: "invite", label: "Invite" }]} autoplay={5000} />',
  },
  stat: {
    name: 'Stat', description: 'Condensed figures for a single metric or a responsive group.',
    preview: () => <Stats className="sample-stats"><Stat value={24} label="Rooms" desc="This month" /><Stat value={98} suffix="%" label="Uptime" desc="Last 30 days" /></Stats>,
    html: '<div class="stats"><div class="stat"><span class="label">Rooms</span><span class="stat-num">24</span><p class="stat-desc">This month</p></div></div>',
    jsx: '<Stats><Stat value={24} label="Rooms" desc="This month" /></Stats>',
  },
  'theme-toggle': {
    name: 'ThemeToggle', description: 'Cycle through Night, Paper, and Glass with a single labelled button.',
    preview: () => <ThemeToggle />,
    html: '<button class="icon-btn" aria-label="Switch to light theme">☀</button>',
    jsx: '<ThemeToggle />',
  },
  'theme-switch': {
    name: 'ThemeSwitch', description: 'Select Dark, Light, Glass, or the operating-system preference.',
    preview: () => <ThemeSwitch />,
    html: '<div class="seg" role="radiogroup" aria-label="Theme"><button class="seg-item" role="radio" aria-checked="true">Dark</button><button class="seg-item" role="radio" aria-checked="false" tabindex="-1">Light</button><button class="seg-item" role="radio" aria-checked="false" tabindex="-1">Glass</button><button class="seg-item" role="radio" aria-checked="false" tabindex="-1">Auto</button></div>',
    jsx: '<ThemeProvider><ThemeSwitch /></ThemeProvider>',
  },
  'rich-text': {
    name: 'RichText', description: 'Render lightweight Markdown into React elements with HTTP and HTTPS links.',
    preview: () => <RichText text={'## Workspace notes\n\n**Ready** for review. Use `npm run build` to prepare the package.\n\n> Invite a collaborator when you are done.'} />,
    html: '<div class="rich-text"><h3>Workspace notes</h3><p><strong>Ready</strong> for review.</p></div>',
    jsx: '<RichText text={"## Workspace notes\\n\\n**Ready** for review."} />',
  },
  kbd: {
    name: 'Kbd', description: 'Show shortcut keys with a compact mono label.',
    preview: () => <div className="sample-row"><Kbd>Ctrl</Kbd><Kbd>K</Kbd><span className="muted">Search pages</span></div>,
    html: '<kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd>',
    jsx: '<><Kbd>Ctrl</Kbd> <Kbd>K</Kbd></>',
  },
  code: {
    name: 'Code', description: 'Inline code and scrollable blocks with optional line numbers.',
    preview: () => <div className="sample-stack"><p>Run <Code inline>npm test</Code> to check the build.</p><Code lines={['npm run build', 'npm test']} /></div>,
    html: '<pre class="code code-lines"><span>npm run build</span><span>npm test</span></pre>',
    jsx: '<Code lines={["npm run build", "npm test"]} />',
  },
  logo: {
    name: 'Logo', description: 'The ecosystem kit’s geometric U mark with a configurable wordmark.',
    preview: () => <div className="sample-row"><Logo /><Logo compact size={24} /></div>,
    html: '<span class="brand"><span class="brand-name"><span class="brand-pre">Utkristi</span><span class="brand-co">ui</span></span></span>',
    jsx: '<Logo size={30} name="Utkristi" suffix="ui" />',
  },
  spinner: {
    name: 'Spinner', description: 'A small, labelled activity indicator.',
    preview: () => <div className="sample-row"><Spinner size={22} label="Syncing workspace" /><span className="muted">Syncing workspace</span><Check size={16} /></div>,
    html: '<span class="spinner" role="status" aria-label="Syncing workspace"></span>',
    jsx: '<Spinner size={22} label="Syncing workspace" />',
  },
} satisfies Record<string, Example>;

export const componentPages = Object.entries(examples).sort(([, a], [, b]) => a.name.localeCompare(b.name));
