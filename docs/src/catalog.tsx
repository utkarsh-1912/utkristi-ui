import { useId, useState } from 'react';
import {
  Accordion, Alert, AlertDialog, AspectRatio, Attachment, Avatar, Badge, Breadcrumb, Bubble, Button,
  ButtonGroup, Calendar, Card, CardBody, Carousel, Chart, Checkbox, CodeBlock, Collapsible, Combobox,
  Command, ContextMenu, DataTable, DatePicker, Dialog, Direction, Drawer, DropdownMenu, Empty,
  Field, HoverCard, Input, InputGroup, InputOTP, Item, Label, Loader, Marker, Menubar, Message,
  MessageScroller, NativeSelect, NavigationMenu, Pagination, Popover, Progress, Questionnaire, Radio,
  RadioGroup, Resizable, ScrollArea, Select, SelectMenu, Separator, Sheet, Sidebar, Switch, Textarea, Toggle, ToggleGroup, Trace, Typography,
  type Typeface, useToast,
} from '@utkristi/ui';
import type { Example } from './examples';

const demo = (name: string, description: string, preview: Example['preview'], jsx: string, html: string): Example =>
  ({ name, description, preview, jsx, html });

const teams = ['Design', 'Engineering', 'Operations'].map((label) => ({ value: label.toLowerCase(), label }));
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
  return <Command label="Workspace commands" placeholder="Search commands" options={teams.map((entry) => ({
    ...entry, onSelect: () => toast.show({ title: `Opening ${entry.label}` }),
  }))} />;
}
function PageDemo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} totalPages={8} onPageChange={setPage} />;
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
    '<section class="carousel" aria-label="Workspaces"><div class="carousel-viewport" tabindex="0"><div class="carousel-slide">Studio</div><div class="carousel-slide">Build</div></div></section>'),
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
    '<div class="command"><input class="input" role="combobox" aria-label="Commands" aria-expanded="true" aria-controls="actions"><div id="actions" role="listbox" class="search-results"><button type="button" role="option" aria-selected="false" class="menu-item">Open workspace</button></div></div>'),
  'context-menu': demo('Context Menu', 'Open actions at the pointer or with the keyboard.',
    () => <MenuDemo kind="context" />, '<ContextMenu label="Workspace actions" items={items}>Open actions</ContextMenu>',
    '<div class="menu-anchor context-menu"><button class="context-trigger" aria-haspopup="menu" aria-expanded="false">Open actions</button></div>'),
  'data-table': demo('Data Table', 'Filter, sort, and paginate rows with the kit table.',
    () => <DataTable rows={[{ name: 'Design', count: 24 }, { name: 'Build', count: 18 }, { name: 'Launch', count: 32 }]}
      columns={[{ key: 'name', header: 'Team', sortValue: (row) => row.name }, { key: 'count', header: 'Rooms', num: true, sortValue: (row) => row.count }]}
      getRowKey={(row) => row.name} pageSize={2} />,
    '<DataTable rows={rows} columns={columns} getRowKey={(row) => row.id} pageSize={10} />',
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
  loader: demo('Loader', 'Compose spinner, skeleton, and progress loading states.',
    () => <div className="sample-stack"><Loader label="Syncing workspace" /><Loader variant="skeleton" label="Loading notes" />
      <Loader variant="progress" label="Uploading" value={64} /></div>,
    '<Loader variant="progress" label="Uploading" value={64} />',
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
    '<button class="switch" type="button" role="switch" aria-label="Send workspace updates" aria-checked="true"></button>'),
  textarea: demo('Textarea', 'A multiline form field with optional code styling.',
    () => <Field label="Notes"><Textarea placeholder="Add a note" /></Field>, '<Field label="Notes"><Textarea placeholder="Add a note" /></Field>',
    '<label class="field">Notes<textarea class="textarea" placeholder="Add a note"></textarea></label>'),
  toggle: demo('Toggle', 'A button with pressed and unpressed states.',
    () => <Toggle>Pin workspace</Toggle>, '<Toggle defaultPressed>Pin workspace</Toggle>',
    '<button class="btn btn-ghost toggle" aria-pressed="true">Pin workspace</button>'),
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
