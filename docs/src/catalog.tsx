import { useId, useState } from 'react';
import {
  Accordion, Alert, AlertDialog, AspectRatio, Attachment, Avatar, Badge, Banner, BottomNavigation, Breadcrumb, Bubble, Button,
  BulkActionBar, ButtonGroup, Calendar, Card, CardBody, Carousel, Chart, Checkbox, ClipboardButton, CodeBlock, Collapsible, ColumnChooser, Combobox,
  Command, ContextMenu, DataTable, DatePicker, DateRangePicker, Dialog, Direction, Drawer, DropdownMenu, Empty, FilterBar,
  DeviceMockup, Field, FileInput, FloatingInput, Gallery, HoverCard, Icon, IconPalettePicker, IconTile, Input, InputGroup, InputOTP, Item, Jumbotron, Label, ListGroup, Loader, Marker, MegaMenu, Menubar, Message, NumberInput, PhoneInput,
  MessageScroller, NativeSelect, NavigationMenu, Pagination, Popover, Progress, Questionnaire, Radio,
  QRCode, RadioGroup, Rating, Resizable, ScrollArea, Select, SelectMenu, Separator, Sheet, Sidebar, SpeedDial, Switch, Textarea, TimeInput, Timeline, Toggle, ToggleGroup, Trace, Typography, VideoPlayer,
  type DataColumn, type DataTableRowKey, type Typeface, useToast,
} from '@utkristi/ui';
import type { Example } from './examples';

const demo = (name: string, description: string, preview: Example['preview'], jsx: string, html: string): Example =>
  ({ name, description, preview, jsx, html });

const teams = ['Design', 'Engineering', 'Operations'].map((label) => ({ value: label.toLowerCase(), label }));
const worklistColumns = [{ key: 'name', label: 'Project', required: true }, { key: 'team', label: 'Team' }];

function ColumnsDemo() {
  const [visible, setVisible] = useState(['name', 'team']);
  return <><ColumnChooser columns={worklistColumns} visible={visible} onChange={setVisible} />
    <p className="muted">Visible: {worklistColumns.filter(({ key }) => visible.includes(key)).map(({ label }) => label).join(', ')}</p></>;
}

function DateRangeDemo() {
  const [value, setValue] = useState({ start: '', end: '' });
  return <DateRangePicker value={value} onChange={setValue} />;
}

function FilterBarDemo() {
  const [team, setTeam] = useState('Design');
  return <FilterBar filters={team ? [{ id: 'team', label: team }] : []} onRemove={() => setTeam('')} onReset={() => setTeam('')}>
    <Field label="Team"><Select value={team} onChange={(event) => setTeam(event.currentTarget.value)}>
      <option value="">All teams</option><option>Design</option><option>Engineering</option>
    </Select></Field>
  </FilterBar>;
}

function BulkActionsDemo() {
  const [count, setCount] = useState(3);
  return <><Button variant="ghost" onClick={() => setCount(3)}>Select three rows</Button>
    <BulkActionBar count={count} onClear={() => setCount(0)} /></>;
}
const slides = ['Studio', 'Build', 'Launch'].map((label, index) => ({
  id: label, label, content: <Card pane={index % 2 === 0}><CardBody className="catalog-slide">
    <span className="label">0{index + 1} / {teams[index].label}</span><strong>{label}</strong>
    <span className="muted">A workspace for your team.</span>
  </CardBody></Card>,
}));

function OverlayDemo({ kind }: { kind: 'alert' | 'dialog' | 'sheet' | 'drawer' }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const Panel = kind === 'sheet' ? Sheet : kind === 'drawer' ? Drawer : Dialog;
  return <>
    <Button variant="ghost" onClick={() => setOpen(true)}>{kind === 'alert' ? 'Archive project' : `Open ${kind}`}</Button>
    {kind === 'alert' ? <AlertDialog title="Archive this project?" description="It will move to the workspace archive."
      open={open} onClose={() => setOpen(false)} destructive confirmLabel="Archive" onConfirm={() => {
        setOpen(false); toast.show({ title: 'Project archived' });
      }} /> : <Panel title="Workspace settings" open={open} onClose={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
        <Field label="Workspace name"><Input defaultValue="Studio" /></Field>
      </Panel>}
  </>;
}
function AttachmentDemo() {
  const [attached, setAttached] = useState(true);
  return attached ? <Attachment name="workspace-notes.md" detail="Markdown · 8 KB" onRemove={() => setAttached(false)} />
    : <Button variant="ghost" size="sm" onClick={() => setAttached(true)}>Restore attachment</Button>;
}
function MenuDemo({ kind }: { kind: 'context' | 'dropdown' | 'bar' }) {
  const toast = useToast();
  const items = ['Open workspace', 'Duplicate'].map((label) => ({
    label, onSelect: () => toast.show({ title: label }),
  }));
  if (kind === 'context') return <ContextMenu label="Workspace actions" items={items}>Right-click or press Enter here</ContextMenu>;
  if (kind === 'bar') return <Menubar aria-label="Workspace commands" menus={[
    { id: 'file', label: 'File', items }, { id: 'edit', label: 'Edit', items: [items[1]] },
  ]} />;
  return <DropdownMenu align="start" items={items} trigger={(props) => <Button {...props} variant="ghost">Actions</Button>} />;
}
function CommandDemo() {
  const toast = useToast();
  return <Command label="Workspace commands" placeholder="Find an action…" options={[
    ...teams.map((entry) => ({ ...entry, group: 'Teams', keywords: ['open'], onSelect: () => toast.show({ title: `Opening ${entry.label}` }) })),
    { value: 'create', label: 'Create a workspace', group: 'Actions', keywords: ['new'], onSelect: () => toast.show({ title: 'Workspace created' }) },
  ]} />;
}
function BannerDemo() {
  const [open, setOpen] = useState(true);
  return open ? <Banner onDismiss={() => setOpen(false)}><strong>Workspace update</strong><br />Your new dashboard is ready.</Banner>
    : <Button variant="ghost" onClick={() => setOpen(true)}>Restore banner</Button>;
}
// A short, silent motion sample for the isolated video preview.
const motionSample = 'data:video/webm;base64,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';
const qrSample = '111111100011101111111 100000101110101000001 101110100011101011101 101110101100101011101 101110100100101011101 100000101001001000001 111111101010101111111 000000000100000000000 111110111001010101010 110110011111101111111 011000110110110000110 010110000001100101110 110110101110101000010 000000001100100010010 111111101011000001010 100000100000010011111 101110101101010101001 101110101010110010100 101110101000110000000 100000101011110001100 111111101010000110010'.split(' ').map((row) => Array.from(row, (bit) => bit === '1'));
function PageDemo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} totalPages={8} onPageChange={setPage} />;
}
const workspaceRows = [
  { id: 'design', name: 'Design', count: 24 },
  { id: 'build', name: 'Build', count: 18 },
  { id: 'launch', name: 'Launch', count: 32 },
];
const workspaceColumns: DataColumn<typeof workspaceRows[number]>[] = [
  { key: 'name', header: 'Team', sortValue: (row) => row.name },
  { key: 'count', header: 'Rooms', num: true, sortValue: (row) => row.count },
];
function DataTableDemo() {
  const [selected, setSelected] = useState<readonly DataTableRowKey[]>([]);
  return <>
    <DataTable rows={workspaceRows} columns={workspaceColumns} getRowKey={(row) => row.id} pageSize={2}
      aria-label="Workspace teams" selection={{ selectedKeys: selected, onSelectionChange: setSelected,
        getRowCheckboxLabel: (row) => `Select ${row.name}` }} />
    <div className="data-table-controls">
      <span role="status">{selected.length} selected</span>
      <Button variant="ghost" size="sm" onClick={() => setSelected([])} disabled={!selected.length}>Clear selection</Button>
    </div>
  </>;
}
function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const id = useId();
  return <Sidebar collapsed={collapsed} heading={<Button variant="plain" size="sm" aria-controls={id}
    aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>Workspace {collapsed ? '+' : '−'}</Button>}>
    <nav id={id} aria-label="Workspace"><a href="#/overview" aria-current="page">Overview</a><a href="#/showcase">Showcase</a></nav>
  </Sidebar>;
}
function QuestionnaireDemo() {
  const toast = useToast();
  return <Questionnaire questions={[
    { id: 'name', prompt: 'Name your workspace', placeholder: 'Studio', required: true },
    { id: 'team', prompt: 'Choose a team', options: teams, required: true },
  ]} onSubmit={(answers) => toast.show({ title: 'Workspace ready', body: String(answers.name) })} />;
}
function RadioDemo() {
  const name = useId();
  return <RadioGroup aria-label="Visibility" className="sample-row">
    <Radio label="Private" name={name} defaultChecked /><Radio label="Shared" name={name} />
  </RadioGroup>;
}
function LabelDemo() {
  const id = useId();
  return <div className="sample-stack"><Label htmlFor={id}>Workspace name</Label><Input id={id} placeholder="Studio" /></div>;
}

export function FontDemo() {
  const [font, setFont] = useState<Typeface>('geist');
  const fonts = { archivo: 'Archivo', geist: 'Geist', inter: 'Inter', manrope: 'Manrope', serif: 'Newsreader' };
  return <div className="sample-stack">
    <Select aria-label="Typeface" value={font} onChange={(event) => setFont(event.target.value as Typeface)}>
      {Object.entries(fonts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </Select>
    <Typography typeface={font}>
      <h3>Workspace notes</h3><p>Clear hierarchy makes the next decision easier to find.</p>
      <blockquote>Keep the important details close.</blockquote>
      <p>Run <code>npm run build</code> when you’re ready.</p>
    </Typography>
  </div>;
}

const panelMarkup = (type: string, side = '') =>
  `<div class="modal-backdrop ${side ? 'sheet-backdrop' : ''}"><section class="modal ${side ? 'sheet-panel' : ''}"${side ? ` data-side="${side}"` : ''} role="${type}" aria-label="Settings"><div class="modal-body">Settings</div></section></div>`;

export const catalog = {
  banner: demo('Banner', 'Show an announcement with an optional action and dismiss control.', BannerDemo,
    '<Banner onDismiss={dismiss}>Workspace update</Banner>', '<aside class="kit-banner"><div>Workspace update</div></aside>'),
  'bottom-navigation': demo('Bottom Navigation', 'Show frequently used destinations with a visible current page.',
    () => <BottomNavigation items={[{ label: 'Overview', href: '#/overview', active: true, icon: <Icon name="home" /> },
      { label: 'Icons', href: '#/icons', icon: <Icon name="layers" /> }, { label: 'Sandbox', href: '#/sandbox', icon: <Icon name="terminal" /> }]} />,
    '<BottomNavigation items={items} />', '<nav class="bottom-nav" aria-label="Quick navigation"><a href="/" aria-current="page">Overview</a></nav>'),
  clipboard: demo('Clipboard', 'Copy text and announce whether the browser accepted the request.',
    () => <ClipboardButton text="npm install @utkristi/ui" variant="ghost">Copy install command</ClipboardButton>,
    '<ClipboardButton text="npm install @utkristi/ui" />', '<button class="btn btn-ghost" type="button">Copy</button><span role="status"></span>'),
  'device-mockup': demo('Device Mockup', 'Frame artwork or product screenshots as a phone, tablet, or desktop.',
    () => <DeviceMockup device="phone"><AspectRatio ratio={3 / 4} className="catalog-frame"><Icon name="phone" size={48} variant="duotone" /></AspectRatio></DeviceMockup>,
    '<DeviceMockup device="phone">{content}</DeviceMockup>', '<div class="device-frame" data-device="phone"><div class="device-screen">App preview</div></div>'),
  'file-input': demo('File Input', 'Choose local files through a native, labelled file control.',
    () => <Field label="Upload artwork"><FileInput accept="image/*" multiple /></Field>,
    '<Field label="Upload artwork"><FileInput accept="image/*" multiple /></Field>', '<label>Upload artwork<input type="file" class="input file-input" accept="image/*" multiple></label>'),
  'floating-input': demo('Floating Input', 'Keep the field label visible when the input has a value or focus.',
    () => <FloatingInput label="Workspace name" name="workspace" />,
    '<FloatingInput label="Workspace name" name="workspace" />', '<div class="floating-field"><input class="input" id="workspace" placeholder=" "><label for="workspace">Workspace name</label></div>'),
  'number-input': demo('Number Input', 'Use native numeric entry with minimum, maximum, and step constraints.',
    () => <Field label="Seats"><NumberInput min={1} max={100} defaultValue={8} /></Field>,
    '<Field label="Seats"><NumberInput min={1} max={100} /></Field>', '<label>Seats<input class="input" type="number" min="1" max="100"></label>'),
  'phone-input': demo('Phone Input', 'Offer a phone keyboard and telephone autofill on supported devices.',
    () => <Field label="Phone number"><PhoneInput placeholder="+91" /></Field>,
    '<Field label="Phone number"><PhoneInput /></Field>', '<label>Phone number<input class="input" type="tel" autocomplete="tel"></label>'),
  'time-input': demo('Time Input', 'Select a time with the browser’s locale-aware time control.',
    () => <Field label="Start time"><TimeInput defaultValue="09:30" /></Field>,
    '<Field label="Start time"><TimeInput defaultValue="09:30" /></Field>', '<label>Start time<input class="input" type="time" value="09:30"></label>'),
  gallery: demo('Gallery', 'Arrange artwork in a responsive grid with a maximum column count.',
    () => <Gallery columns={3}>{(['image', 'calendar', 'folder'] as const).map((name) => <figure key={name}>
      <AspectRatio className="catalog-frame" ratio={4 / 3}><Icon name={name} variant="duotone" size={40} /></AspectRatio><figcaption>{name}</figcaption></figure>)}</Gallery>,
    '<Gallery columns={3}>{items}</Gallery>', '<div class="media-gallery" data-columns="3"><figure><figcaption>Artwork</figcaption></figure></div>'),
  jumbotron: demo('Jumbotron', 'Compose a landing-page hero with an eyebrow, headline, and actions.',
    () => <Jumbotron eyebrow="Workspace" actions={<Button size="sm" href="#/getting-started">Get started</Button>}>
      <strong className="display display-sm">Build together.</strong><p>One kit across the ecosystem.</p></Jumbotron>,
    '<Jumbotron eyebrow="Workspace" actions={actions}><h1>Build together.</h1></Jumbotron>', '<section class="jumbotron"><p class="label">Workspace</p><h1>Build together.</h1></section>'),
  'list-group': demo('List Group', 'Group related rows with native list semantics.',
    () => <ListGroup><li>Workspace settings</li><li>Members</li><li>Billing</li></ListGroup>,
    '<ListGroup><li>Settings</li></ListGroup>', '<ul class="list-group"><li>Settings</li></ul>'),
  'mega-menu': demo('Mega Menu', 'Organize site destinations into labelled columns in an accessible popover.',
    () => <MegaMenu trigger="Explore" label="Explore Utkristi" columns={[
      { title: 'Design', links: [{ label: 'Icons', href: '#/icons' }, { label: 'Tokens', href: '#/tokens' }] },
      { title: 'Build', links: [{ label: 'Install', href: '#/getting-started' }, { label: 'Sandbox', href: '#/sandbox' }] },
    ]} />, '<MegaMenu trigger="Explore" label="Explore Utkristi" columns={columns} />',
    '<details class="mega-menu"><summary>Explore</summary><nav class="mega-menu-grid"><a href="/">Overview</a></nav></details>'),
  'qr-code': demo('QR Code', 'Render a matrix supplied by a QR encoder with a four-module quiet zone.',
    () => <QRCode matrix={qrSample} label="QR code containing the text Utkristi UI" />,
    '<QRCode matrix={encodedMatrix} label="Workspace link" />', '<img class="qr-code" src="workspace-qr.svg" width="128" height="128" alt="Workspace link">'),
  rating: demo('Rating', 'Present a read-only score with fractional stars and a spoken value.',
    () => <Rating value={4.5} />, '<Rating value={4.5} />', '<span class="star-rating" role="img" aria-label="4 out of 5 stars">★★★★☆</span>'),
  'speed-dial': demo('Speed Dial', 'Reveal a compact group of related actions. Escape closes the dial.',
    () => <SpeedDial trigger={<><Icon name="plus" /> Create</>} label="Create something">
      <Button size="sm" href="#/sandbox">Sandbox</Button><Button size="sm" variant="ghost" href="#/icons">Browse icons</Button></SpeedDial>,
    '<SpeedDial trigger="Create" label="Create something">{actions}</SpeedDial>', '<details class="speed-dial"><summary>Create</summary><button type="button" class="btn">New workspace</button></details>'),
  timeline: demo('Timeline', 'Display dated events in chronological order.',
    () => <Timeline entries={[{ id: 'draft', title: 'Draft created', date: '2026-08-01', dateLabel: 'Aug 1' },
      { id: 'review', title: 'Ready for review', date: '2026-08-04', dateLabel: 'Aug 4', detail: 'The team reviewed the workspace.' }]} />,
    '<Timeline entries={events} />', '<ol class="activity-timeline"><li><time datetime="2026-08-01">Aug 1</time><strong>Draft created</strong></li></ol>'),
  video: demo('Video', 'Choose browser controls or a themed player with playback, seeking, mute, captions, and fullscreen. Set the frame width, corners, and aspect ratio.',
    () => <VideoPlayer aria-label="Silent Utkristi motion sample" src={motionSample} controls="custom" inlineSize="36rem" radius={14} preload="metadata" playsInline muted />,
    '<VideoPlayer src="/demo.mp4" controls="custom" inlineSize="36rem" radius={14} playsInline><track kind="captions" src="/captions.vtt" srcLang="en" label="English" /></VideoPlayer>',
    '<video class="kit-video" controls preload="metadata"><source src="demo.mp4" type="video/mp4"><track kind="captions" src="captions.vtt" srclang="en"></video>'),
  accordion: demo('Accordion', 'Expandable sections with arrow-key navigation.',
    () => <Accordion defaultValue={['design']} items={[{ id: 'design', label: 'Design', content: 'Tokens and patterns.' },
      { id: 'build', label: 'Engineering', content: 'Builds and releases.' }]} />,
    '<Accordion items={[{ id: "design", label: "Design", content: "Tokens and patterns." }]} />',
    '<details class="accordion-item"><summary class="disclosure-trigger">Design</summary><div class="disclosure-body">Tokens and patterns.</div></details>'),
  alert: demo('Alert', 'Inline feedback for success, caution, and errors.',
    () => <Alert title="Check your access" tone="warn">Only owners can invite guests.</Alert>,
    '<Alert title="Check your access" tone="warn">Only owners can invite guests.</Alert>',
    '<div class="alert" data-tone="warn" role="status"><div><strong>Check your access</strong><div class="alert-description">Only owners can invite guests.</div></div></div>'),
  'alert-dialog': demo('Alert Dialog', 'A confirmation dialog that initially focuses Cancel.',
    () => <OverlayDemo kind="alert" />, '<AlertDialog open={open} title="Archive project?" onClose={close} onConfirm={archive} destructive />', panelMarkup('alertdialog')),
  'aspect-ratio': demo('Aspect Ratio', 'Reserve a consistent frame for media.',
    () => <AspectRatio ratio={16 / 9} className="catalog-frame"><span className="label">16 / 9</span></AspectRatio>,
    '<AspectRatio ratio={16 / 9}><img src={image} alt="Workspace" /></AspectRatio>',
    '<div class="aspect-ratio" style="--ut-ratio: 16 / 9"><img src="workspace.jpg" alt="Workspace"></div>'),
  attachment: demo('Attachment', 'Show a file with optional download and removal.',
    AttachmentDemo, '<Attachment name="workspace-notes.md" detail="Markdown · 8 KB" onRemove={removeFile} />',
    '<div class="item attachment"><div class="item-content"><strong>workspace-notes.md</strong><div class="muted">Markdown · 8 KB</div></div></div>'),
  breadcrumb: demo('Breadcrumb', 'Show the current page in its navigation hierarchy.',
    () => <Breadcrumb items={[{ label: 'Workspace', href: '#/overview' }, { label: 'Studio' }]} />,
    '<Breadcrumb items={[{ label: "Workspace", href: "/" }, { label: "Studio" }]} />',
    '<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Workspace</a></li><li><span aria-current="page">Studio</span></li></ol></nav>'),
  bubble: demo('Bubble', 'A conversation surface with variants and reactions.',
    () => <div className="sample-stack"><Bubble>Can you share the notes?</Bubble><Bubble align="end" variant="solid" reactions={<Badge>✓</Badge>}>They’re ready.</Bubble></div>,
    '<Bubble align="end" variant="solid">They’re ready.</Bubble>',
    '<div class="bubble" data-align="end"><div class="bubble-content" data-variant="solid">They’re ready.</div></div>'),
  'button-group': demo('Button Group', 'Join related actions in a row or column.',
    () => <ButtonGroup aria-label="Edit actions"><Button size="sm" variant="ghost">Copy</Button><Button size="sm" variant="ghost">Paste</Button></ButtonGroup>,
    '<ButtonGroup aria-label="Edit actions"><Button variant="ghost">Copy</Button><Button variant="ghost">Paste</Button></ButtonGroup>',
    '<div class="button-group" role="group" aria-label="Edit actions"><button class="btn btn-ghost">Copy</button><button class="btn btn-ghost">Paste</button></div>'),
  calendar: demo('Calendar', 'Browse months and pick a day with pointer or keyboard.',
    () => <Calendar locale="en" defaultValue={new Date(2026, 10, 9)} />,
    '<Calendar defaultValue={new Date(2026, 10, 9)} onValueChange={setDate} />',
    '<div class="calendar"><div class="calendar-header"><strong>November 2026</strong></div><table class="calendar-grid"><tbody><tr><td><button class="calendar-day" aria-label="November 9, 2026">9</button></td></tr></tbody></table></div>'),
  carousel: demo('Carousel', 'Swipe between slides or use the arrows and keyboard.',
    () => <Carousel slides={slides} aria-label="Workspace collection" />,
    '<Carousel aria-label="Workspaces" slides={[{ id: "studio", content: <Card>Studio</Card> }, { id: "build", content: <Card>Build</Card> }]} />',
    '<section class="carousel" aria-label="Workspaces"><div class="carousel-viewport" id="workspace-slides" tabindex="0"><div class="carousel-slide">Studio</div><div class="carousel-slide">Build</div></div><div class="sample-row"><button class="btn btn-ghost" type="button" data-ut-track="workspace-slides" data-ut-step="previous">Previous</button><button class="btn btn-ghost" type="button" data-ut-track="workspace-slides">Next</button></div></section>'),
  chart: demo('Chart', 'Bar and line views with visible values.',
    () => <Chart title="Workspace activity" data={[{ label: 'Design', value: 24 }, { label: 'Build', value: 18 }, { label: 'Launch', value: 32 }]} />,
    '<Chart title="Workspace activity" data={[{ label: "Design", value: 24 }, { label: "Build", value: 18 }]} />',
    '<figure class="chart"><figcaption>Workspace activity</figcaption><dl class="chart-values"><div class="chart-entry"><dt>Design</dt><dd>24</dd><dd class="chart-track" aria-hidden="true"><span style="--ut-bar-start:0%;--ut-bar-size:75%"></span></dd></div></dl></figure>'),
  checkbox: demo('Checkbox', 'Native checked and indeterminate states.',
    () => <div className="sample-stack"><Checkbox label="Notify teammates" defaultChecked /><Checkbox label="Select all" indeterminate /></div>,
    '<Checkbox label="Notify teammates" defaultChecked />',
    '<label class="choice"><input class="checkbox" type="checkbox" checked> Notify teammates</label>'),
  'code-block': demo('Code Block', 'Copyable code and terminal output with optional line numbers.',
    () => <CodeBlock code={'npm run build\nnpm test'} language="Shell" lineNumbers />,
    '<CodeBlock code={"npm run build\\nnpm test"} language="Shell" lineNumbers />',
    '<div class="code-block"><div class="code-block-head"><span class="label">Shell</span></div><pre class="code code-lines"><span>npm run build</span><span>npm test</span></pre></div>'),
  collapsible: demo('Collapsible', 'Reveal one section of optional content.',
    () => <Collapsible label="Release details">Three fixes are included.</Collapsible>,
    '<Collapsible label="Release details">Three fixes are included.</Collapsible>',
    '<details class="collapsible"><summary class="disclosure-trigger">Release details</summary><div class="disclosure-body">Three fixes are included.</div></details>'),
  combobox: demo('Combobox', 'Filter choices and select one or more values.',
    () => <Combobox options={teams} label="Team" placeholder="Choose a team" />,
    '<Combobox label="Team" options={[{ value: "design", label: "Design" }, { value: "ops", label: "Operations" }]} />',
    '<div class="combobox"><input class="input" aria-label="Team" role="combobox" aria-expanded="false" placeholder="Choose a team"></div>'),
  command: demo('Command', 'Filter actions and run the selected command with Enter.',
    CommandDemo, '<Command label="Commands" options={[{ value: "open", label: "Open workspace", onSelect: openWorkspace }]} />',
    '<div class="command"><input class="input" type="search" aria-label="Filter commands" data-ut-filter="actions"><div id="actions" class="search-results"><a class="menu-item" data-ut-option href="#workspace">Open workspace</a><a class="menu-item" data-ut-option href="#settings">Settings</a></div></div>'),
  'context-menu': demo('Context Menu', 'Open actions at the pointer or with the keyboard.',
    () => <MenuDemo kind="context" />, '<ContextMenu label="Workspace actions" items={items}>Open actions</ContextMenu>',
    '<div class="menu-anchor context-menu"><button class="context-trigger" aria-haspopup="menu" aria-expanded="false">Open actions</button></div>'),
  'bulk-action-bar': demo('Bulk Action Bar', 'Announce the selected row count, expose bulk commands, and clear the selection.',
    BulkActionsDemo, '', '<div class="worklist-bulk" role="group" aria-label="Bulk actions"><span role="status">3 selected</span><button class="btn btn-sm">Clear selection</button></div>'),
  'column-chooser': demo('Column Chooser', 'Choose which table columns are visible. Keep identifying columns visible with required.',
    ColumnsDemo, '', '<div class="worklist-column-options"><label><input type="checkbox" checked disabled> Project</label><label><input type="checkbox" checked> Team</label></div>'),
  'filter-bar': demo('Filter Bar', 'Group filter fields, display active filters, and remove them individually or together.',
    FilterBarDemo, '', '<div class="worklist-filters" role="group" aria-label="Filters"><div class="worklist-controls"><button class="btn btn-sm">Remove Design</button><button class="btn btn-sm">Reset filters</button></div></div>'),
  'date-range-picker': demo('Date Range Picker', 'Pick inclusive date-only bounds. Leave either bound blank for an open-ended range.',
    DateRangeDemo, '', '<fieldset class="worklist-dates"><legend>Date range</legend><div class="worklist-controls"><label class="field">Start date<input class="input" type="date"></label><label class="field">End date<input class="input" type="date"></label></div></fieldset>'),
  'data-table': demo('Data Table', 'Filter, sort, and paginate rows. Pass remote for a server-backed page and stable row IDs for selection across pages. Select all affects the current page only.',
    DataTableDemo,
    '<DataTable rows={rows} columns={columns} getRowKey={(row) => row.id} selection={{ selectedKeys, onSelectionChange: setSelectedKeys }} />',
    '<div class="data-table"><input class="input" type="search" aria-label="Filter rows"><table class="table"><thead><tr><th scope="col">Team</th></tr></thead><tbody><tr><td>Design</td></tr></tbody></table></div>'),
  'date-picker': demo('Date Picker', 'Select a date from a calendar in a popover.',
    () => <DatePicker locale="en" />, '<DatePicker onValueChange={setDate} />',
    '<label class="field">Delivery date<input class="input" type="date"></label>'),
  dialog: demo('Dialog', 'A modal with focus management and a labelled title.',
    () => <OverlayDemo kind="dialog" />, '<Dialog open={open} onClose={close} title="Settings">Workspace settings</Dialog>', panelMarkup('dialog')),
  direction: demo('Direction', 'Set writing direction for a component subtree.',
    () => <Direction dir="rtl"><Breadcrumb items={[{ label: 'المشاريع', href: '#/showcase' }, { label: 'مساحة العمل' }]} /></Direction>,
    '<Direction dir="rtl"><Breadcrumb items={items} /></Direction>', '<div dir="rtl" class="muted">مساحة العمل</div>'),
  drawer: demo('Drawer', 'A bottom-aligned modal panel for secondary tasks.',
    () => <OverlayDemo kind="drawer" />, '<Drawer open={open} onClose={close} title="Settings">Workspace settings</Drawer>', panelMarkup('dialog', 'bottom')),
  'dropdown-menu': demo('Dropdown Menu', 'An anchored menu with keyboard navigation and typeahead.',
    () => <MenuDemo kind="dropdown" />, '<DropdownMenu items={items} trigger={<button>Actions</button>} />',
    '<div class="menu" role="menu" aria-label="Actions"><button class="menu-item" role="menuitem">Duplicate</button></div>'),
  empty: demo('Empty', 'Explain an empty state and offer a next action.',
    () => <Empty title="No results" action={<Button href="#/showcase">Browse showcase</Button>}>Try a different search.</Empty>,
    '<Empty title="No results">Try a different search.</Empty>',
    '<div class="empty-state"><h2 class="empty-state-title display">No results</h2><p>Try a different search.</p></div>'),
  'hover-card': demo('Hover Card', 'Preview details when a link is hovered or focused.',
    () => <HoverCard href="#/overview" trigger="Utkristi workspace" content={<Item title="Studio" description="A shared design workspace." />} />,
    '<HoverCard href="/studio" trigger="Studio" content={<p>A shared design workspace.</p>} />',
    '<div class="hover-card"><a class="link" href="/studio">Studio</a></div>'),
  icon: demo('Icon', 'Custom 2D line, filled, duotone, 2.5D layered SVG, and 3D soft-clay icons with a live colour palette.',
    () => <div className="sample-stack"><div className="sample-row"><Icon name="rocket" size={20} /><Icon name="rocket" variant="filled" size={20} />
      <Icon name="rocket" variant="duotone" hue="amber" size={24} /><Icon name="rocket" variant="2.5d" hue="violet" size={36} />
      <IconTile name="settings" hue="teal" size="md" /></div><IconPalettePicker showPreview={false} /></div>,
    '<Icon name="rocket" variant="duotone" hue="amber" size={24} />\n<IconTile name="settings" hue="teal" />',
    '<span class="icon-tile icon-hue-teal"><svg class="icon icon-duotone" viewBox="0 0 24 24" width="22" height="22"></svg></span>'),
  input: demo('Input', 'A native text field with themed focus and error states.',
    () => <Field label="Workspace"><Input placeholder="Studio" /></Field>,
    '<Field label="Workspace"><Input placeholder="Studio" /></Field>',
    '<label class="field">Workspace<input class="input" placeholder="Studio"></label>'),
  'input-group': demo('Input Group', 'Attach context or an action to an input.',
    () => <InputGroup start="https://" end=".app"><Input aria-label="Workspace domain" placeholder="studio" /></InputGroup>,
    '<InputGroup start="https://" end=".app"><Input aria-label="Workspace domain" /></InputGroup>',
    '<div class="input-group"><span class="input-group-addon">https://</span><input class="input" aria-label="Workspace domain"><span class="input-group-addon">.app</span></div>'),
  'input-otp': demo('Input OTP', 'One accessible input with visible slots, paste, and autofill.',
    () => <InputOTP length={6} aria-label="Verification code" />, '<InputOTP length={6} aria-label="Verification code" onComplete={verify} />',
    '<input class="input" aria-label="Verification code" inputmode="numeric" autocomplete="one-time-code" maxlength="6">'),
  item: demo('Item', 'A compact row with leading content and actions.',
    () => <Item title="Studio" description="Design workspace" leading={<Avatar name="Studio" size={30} />} actions={<Badge tone="ok">Live</Badge>} />,
    '<Item title="Studio" description="Design workspace" actions={<Badge tone="ok">Live</Badge>} />',
    '<div class="item"><div class="item-content"><strong>Studio</strong><div class="muted">Design workspace</div></div><span class="badge badge-ok">Live</span></div>'),
  label: demo('Label', 'Connect a visible label to a form control.',
    LabelDemo, '<Label htmlFor="name">Workspace name</Label><Input id="name" />',
    '<label class="field-label" for="name">Workspace name</label><input id="name" class="input">'),
  loader: demo('Loader', 'Use the animated Utkristi mark, a spinner, a skeleton, or a progress bar while content loads.',
    () => <div className="sample-stack"><Loader variant="brand" label="Opening workspace…" />
      <Loader label="Syncing workspace" /><Loader variant="skeleton" label="Loading notes" />
      <Loader variant="progress" label="Uploading" value={64} /></div>,
    '<Loader variant="brand" label="Opening workspace…" />',
    '<div class="loader loader-inline" role="status"><span class="spinner" aria-hidden="true"></span><span class="loader-label">Syncing workspace</span></div>'),
  marker: demo('Marker', 'An inline status note or labelled conversation divider.',
    () => <div className="sample-stack"><Marker variant="separator">Today</Marker><Marker variant="border" icon="✓">Workspace synced</Marker></div>,
    '<Marker variant="separator">Today</Marker>',
    '<div class="marker" data-variant="separator"><span>Today</span></div>'),
  menubar: demo('Menubar', 'Group multiple action menus in a toolbar.',
    () => <MenuDemo kind="bar" />, '<Menubar aria-label="Workspace commands" menus={[{ id: "file", label: "File", items }]} />',
    '<div class="menubar" role="group" aria-label="Workspace commands"><button class="btn btn-plain" aria-haspopup="menu">File</button></div>'),
  message: demo('Message', 'A conversation row with avatar, sender, content, and footer.',
    () => <Message avatar={<Avatar name="Asha Rao" size={30} />} sender="Asha Rao" footer="10:32"><Bubble>The build is ready to review.</Bubble></Message>,
    '<Message sender="Asha Rao" avatar={<Avatar name="Asha Rao" />}><Bubble>The build is ready.</Bubble></Message>',
    '<article class="message"><div class="message-content"><div class="message-sender label">Asha Rao</div><div class="bubble"><div class="bubble-content">The build is ready.</div></div></div></article>'),
  'message-scroller': demo('Message Scroller', 'Scroll history and follow new content when near the end.',
    () => <MessageScroller items={Array.from({ length: 8 }, (_, index) => ({
      id: String(index), content: <Message align={index % 2 ? 'end' : 'start'} sender={index % 2 ? 'Asha' : 'Mika'}>
        <Bubble variant={index % 2 ? 'solid' : 'neutral'}>Workspace update {index + 1}</Bubble></Message>,
    }))} />,
    '<MessageScroller items={[{ id: "1", content: <Message><Bubble>Build complete.</Bubble></Message> }]} />',
    '<div class="message-scroller"><div class="message-viewport" role="log" aria-label="Messages" tabindex="0"><div class="message-feed">Build complete.</div></div></div>'),
  'native-select': demo('Native Select', 'Use the operating system’s select control.',
    () => <Field label="Team"><NativeSelect>{teams.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</NativeSelect></Field>,
    '<Field label="Team"><NativeSelect><option>Design</option><option>Operations</option></NativeSelect></Field>',
    '<label class="field">Team<select class="select"><option>Design</option><option>Operations</option></select></label>'),
  'navigation-menu': demo('Navigation Menu', 'A row of links and grouped destinations.',
    () => <NavigationMenu items={[{ id: 'home', label: 'Home', href: '#/overview' }, { id: 'docs', label: 'Docs', children: [
      { label: 'Components', href: '#/components/button' }, { label: 'Theming', href: '#/theming' },
    ] }]} />, '<NavigationMenu items={[{ id: "home", label: "Home", href: "/" }]} />',
    '<nav class="navigation-menu" aria-label="Navigation"><a class="btn btn-plain" href="/">Home</a></nav>'),
  pagination: demo('Pagination', 'Navigate pages with current-page and boundary states.',
    PageDemo, '<Pagination page={page} totalPages={8} onPageChange={setPage} />',
    '<nav class="pagination" aria-label="Pagination"><a class="btn btn-solid" aria-current="page" href="?page=1">1</a><a class="btn btn-plain" href="?page=2">2</a></nav>'),
  popover: demo('Popover', 'An anchored surface for short interactive content.',
    () => <Popover trigger="Edit details" label="Workspace details"><Field label="Name"><Input defaultValue="Studio" /></Field></Popover>,
    '<Popover trigger="Edit details" label="Workspace details"><Field label="Name"><Input /></Field></Popover>',
    '<details class="popover"><summary class="btn btn-ghost">Edit details</summary><div class="pop pop-left popover-panel">Workspace details</div></details>'),
  progress: demo('Progress', 'Show known progress or an indeterminate operation.',
    () => <div className="sample-stack"><Progress value={64} label="Upload progress" /><Progress label="Waiting for server" /></div>,
    '<Progress value={64} label="Upload progress" />',
    '<div class="progress" role="progressbar" aria-label="Upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" style="--ut-progress:.64"><span class="progress-fill"></span></div>'),
  questionnaire: demo('Questionnaire', 'Collect validated answers in a multi-step form.',
    QuestionnaireDemo, '<Questionnaire questions={[{ id: "name", prompt: "Name your workspace", required: true }]} onSubmit={saveAnswers} />',
    '<form class="questionnaire"><label class="field">Workspace name<input class="input" name="name" required></label><button class="btn btn-solid">Submit</button></form>'),
  'radio-group': demo('Radio Group', 'Select one option from a group of native radios.',
    RadioDemo, '<RadioGroup aria-label="Visibility"><Radio name="access" label="Private" defaultChecked /><Radio name="access" label="Shared" /></RadioGroup>',
    '<div role="radiogroup" aria-label="Visibility"><label class="choice"><input class="radio" type="radio" name="access" checked> Private</label><label class="choice"><input class="radio" type="radio" name="access"> Shared</label></div>'),
  resizable: demo('Resizable', 'Adjust a split with the pointer or arrow keys.',
    () => <Resizable first={<p>Files</p>} second={<p>Preview</p>} />,
    '<Resizable first={<p>Files</p>} second={<p>Preview</p>} defaultValue={40} />',
    '<div class="resizable" style="--ut-split:40%"><div class="resizable-pane">Files</div><div class="resizable-handle"></div><div class="resizable-pane">Preview</div></div>'),
  'scroll-area': demo('Scroll Area', 'A keyboard-scrollable region with themed scrollbars.',
    () => <ScrollArea aria-label="Workspace list">{Array.from({ length: 10 }, (_, index) => <Item key={index} title={`Workspace ${index + 1}`} />)}</ScrollArea>,
    '<ScrollArea aria-label="Workspace list"><Item title="Studio" /></ScrollArea>',
    '<div class="scroll-area" role="region" aria-label="Workspace list" tabindex="0"><div class="item">Studio</div></div>'),
  select: demo('Select', 'An anchored select-only listbox. The existing native Select remains available for forms.',
    () => <SelectMenu label="Access" placeholder="Choose a role" options={[{ value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }]} />,
    '<SelectMenu label="Access" options={[{ value: "editor", label: "Editor" }, { value: "viewer", label: "Viewer" }]} />',
    '<label class="field">Access<select class="select"><option>Editor</option><option>Viewer</option></select></label>'),
  separator: demo('Separator', 'A divider with optional separator semantics.',
    () => <div className="sample-stack"><span>Workspace</span><Separator /><span className="muted">Projects and members</span></div>,
    '<Separator decorative={false} />', '<div class="separator" role="separator" aria-orientation="horizontal"></div>'),
  sheet: demo('Sheet', 'An edge-aligned modal panel.',
    () => <OverlayDemo kind="sheet" />, '<Sheet open={open} onClose={close} title="Settings" side="end">Workspace settings</Sheet>', panelMarkup('dialog', 'end')),
  sidebar: demo('Sidebar', 'A navigation panel that can collapse.',
    SidebarDemo, '<Sidebar heading="Workspace" collapsed={collapsed}><a href="/">Overview</a></Sidebar>',
    '<aside class="sidebar"><div class="sidebar-heading">Workspace</div><div class="sidebar-content"><a href="/">Overview</a></div></aside>'),
  switch: demo('Switch', 'Turn a preference on or off with a labelled switch.',
    () => <Switch label="Send workspace updates" defaultChecked />, '<Switch label="Send workspace updates" defaultChecked />',
    '<button class="switch" type="button" role="switch" aria-label="Send workspace updates" aria-checked="true" data-ut-toggle></button>'),
  textarea: demo('Textarea', 'A multiline form field with optional code styling.',
    () => <Field label="Notes"><Textarea placeholder="Add a note" /></Field>, '<Field label="Notes"><Textarea placeholder="Add a note" /></Field>',
    '<label class="field">Notes<textarea class="textarea" placeholder="Add a note"></textarea></label>'),
  toggle: demo('Toggle', 'A button with pressed and unpressed states.',
    () => <Toggle>Pin workspace</Toggle>, '<Toggle defaultPressed>Pin workspace</Toggle>',
    '<button class="btn btn-ghost toggle" type="button" aria-pressed="true" data-ut-toggle>Pin workspace</button>'),
  'toggle-group': demo('Toggle Group', 'Select related formatting or view actions.',
    () => <ToggleGroup aria-label="Formatting" multiple items={[{ id: 'bold', label: 'Bold' }, { id: 'italic', label: 'Italic' }]} />,
    '<ToggleGroup aria-label="Formatting" multiple items={[{ id: "bold", label: "Bold" }, { id: "italic", label: "Italic" }]} />',
    '<div class="button-group toggle-group" role="group" aria-label="Formatting"><button class="btn btn-ghost toggle" aria-pressed="true">Bold</button></div>'),
  trace: demo('Trace', 'Activity steps with expandable details and status badges.',
    () => <Trace steps={[{ id: 'load', title: 'Loaded files', status: 'done', detail: 'Read three project files.' },
      { id: 'run', title: 'Running checks', status: 'active' }]} />,
    '<Trace steps={[{ id: "load", title: "Loaded files", status: "done", detail: "Read three files." }]} />',
    '<ol class="trace"><li><details><summary class="trace-line">Loaded files</summary><div class="trace-detail">Read three files.</div></details></li></ol>'),
  typography: demo('Typography', 'Choose a typeface and reading rhythm for structured prose.',
    FontDemo, '<Typography as="article" typeface="geist"><h2>Workspace notes</h2><p>Details for your team.</p></Typography>',
    '<article class="typography type-geist"><h2>Workspace notes</h2><p>Details for your team.</p></article>'),
} satisfies Record<string, Example>;
