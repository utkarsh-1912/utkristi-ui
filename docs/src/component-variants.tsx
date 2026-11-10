import { useState } from 'react';
import {
  Accordion, AlertDialog, AspectRatio, Attachment, Avatar, AvatarGroup, Badge, Banner, Breadcrumb, Bubble, Button, ButtonGroup,
  BottomNavigation, BulkActionBar, Calendar, Card, CardBody, Carousel, Chart, Checkbox, Chip, ClipboardButton, Code, CodeBlock, Collapsible, ColumnChooser, Combobox, Command, ContextMenu,
  DataTable, DatePicker, DateRangePicker, DeviceMockup, Dialog, Direction, Dot, Drawer, EmptyState, Field, FileInput, FilterBar, FloatingInput, Footer, Gallery, HoverCard, Icon, IconButton,
  Input, InputGroup, InputOTP, Item, Jumbotron, Kbd, Label, ListGroup, Loader, Logo, Marker, MegaMenu, Menu, Menubar, Message, MessageScroller, NativeSelect, NavigationMenu, NumberInput, Pagination, PhoneInput, Popover, Progress, QRCode, Questionnaire, Radio,
  RadioGroup, Rating, Resizable, RichText, ScrollArea, Segmented, SelectMenu, Separator, Sheet, Shell, Sidebar, Skeleton, Slider, SpeedDial, Spinner, SplitButton, Stat, Steps, Switch, Table, Tabs, Textarea, ThemeSelect, ThemeSwitch,
  TimeInput, Timeline, Toggle, ToggleGroup, Tooltip, Trace, Typography, VideoPlayer, useToast,
} from '@utkristi/ui';
import type { Example } from './examples';

const example = (name: string, description: string, preview: Example['preview'], html: string): Example =>
  ({ name, description, preview, html, jsx: '' });

const projects = [{ id: 'studio', name: 'Studio', owner: 'Design' }, { id: 'atlas', name: 'Atlas', owner: 'Engineering' }];
const teamOptions = [{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }, { value: 'ops', label: 'Operations', disabled: true }];
const steps = [{ id: 'design', title: 'Design approved', date: '2026-11-04' }, { id: 'ship', title: 'Released', date: '2026-11-10' }];
const videoPoster = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270"%3E%3Crect width="480" height="270" fill="%2327233d"/%3E%3Ccircle cx="240" cy="135" r="68" fill="%239d88d5"/%3E%3C/svg%3E';
const logSource = 'Build complete\n3 checks passed';
const menuItems = [{ label: 'Open project', onSelect: () => {} }, { label: 'Archive project', danger: true, onSelect: () => {} }];
const sampleLinks = [{ label: 'Projects', href: '#projects', active: true }, { label: 'Team', href: '#team' }];
const chartData = [{ label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }, { label: 'Wed', value: 14 }];
const messages = [{ id: 'review', content: <Bubble>Ready to review</Bubble> }, { id: 'accepted', content: <Bubble align="end" variant="solid">Looks good</Bubble> }];

function menuHtml(label: string, links = '<a class="menu-item" href="#project">Open project</a><a class="menu-item menu-item-danger" href="#archive">Archive project</a>') {
  return `<details class="popover" data-ut-disclosure><summary class="btn btn-ghost">${label}</summary><div class="pop pop-left popover-panel">${links}</div></details>`;
}

function PersistentToast() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: 'Export is ready', body: 'Download your project report.', tone: 'ok', duration: 0,
    action: { label: 'View export', onClick: () => {} } })}>Show export notice</Button>;
}

function FilterChips() {
  const [active, setActive] = useState(true);
  return <FilterBar filters={active ? [{ id: 'team', label: 'Team: Design' }] : []} onRemove={() => setActive(false)} onReset={() => setActive(false)}>
    <Button variant="ghost" size="sm" onClick={() => setActive(true)}>Filter by Design</Button>
  </FilterBar>;
}

function RequiredColumn() {
  const [visible, setVisible] = useState<string[]>(['name', 'owner']);
  return <ColumnChooser columns={[{ key: 'name', label: 'Project', required: true }, { key: 'owner', label: 'Owner' }]}
    visible={visible} onChange={setVisible} label="Visible columns" />;
}

function BulkExport() {
  const [count, setCount] = useState(2);
  return <BulkActionBar count={count} onClear={() => setCount(0)}><Button size="sm" variant="ghost" onClick={() => setCount(0)}>Export selection</Button></BulkActionBar>;
}

function LastPage() {
  const [page, setPage] = useState(12);
  return <Pagination page={page} totalPages={12} onPageChange={setPage} />;
}

function DialogVariant({ kind }: { kind: 'wide' | 'left' | 'drawer' | 'confirm' }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const shared = { open, onClose: close, title: 'Project settings', children: <p>Review access and publishing settings for this project.</p> };
  return <><Button onClick={() => setOpen(true)}>Open settings</Button>
    {kind === 'wide' && <Dialog {...shared} wide />}
    {kind === 'left' && <Sheet {...shared} side="start" />}
    {kind === 'drawer' && <Drawer {...shared} side="end" />}
    {kind === 'confirm' && <AlertDialog {...shared} title="Delete draft?" destructive confirmLabel="Delete" onConfirm={close} />}
  </>;
}

function dialogHtml(id: string, title: string, classes = '', side = '') {
  return `<button type="button" class="btn btn-solid" data-ut-open-dialog="${id}">Open settings</button>
<dialog class="modal ut-native-dialog ${classes}" id="${id}" aria-labelledby="${id}-title"${side ? ` data-side="${side}"` : ''}>
  <div class="modal-body"><h2 id="${id}-title">${title}</h2><p>Review the project before continuing.</p>
    <form method="dialog"><button class="btn btn-ghost" autofocus>Close</button></form>
  </div>
</dialog>`;
}

function DismissBanner() {
  const [visible, setVisible] = useState(true);
  return <><Button size="sm" variant="ghost" onClick={() => setVisible(true)}>Show announcement</Button>
    {visible && <Banner onDismiss={() => setVisible(false)} action={<Button size="sm" href="#release">Release notes</Button>}>Version 2 is ready.</Banner>}
  </>;
}

function RemovableAttachment() {
  const [attached, setAttached] = useState(true);
  return attached ? <Attachment name="brief.pdf" detail="248 KB" onRemove={() => setAttached(false)} />
    : <Button variant="ghost" onClick={() => setAttached(true)}>Restore attachment</Button>;
}

function SearchActions() {
  const [action, setAction] = useState('');
  return <><Command label="Project commands" options={[
    { value: 'new', label: 'Create project', group: 'Project', onSelect: () => setAction('Create project') },
    { value: 'settings', label: 'Open settings', group: 'Workspace', onSelect: () => setAction('Open settings') },
  ]} /><p role="status">{action}</p></>;
}

function DateBounds() {
  const [value, setValue] = useState({ start: '2026-11-02', end: '2026-11-10' });
  return <DateRangePicker label="November reporting window" value={value} onChange={setValue} min="2026-11-01" max="2026-11-30" />;
}

const carouselSlides = ['Discover', 'Plan', 'Launch'].map((label) => ({
  id: label, label, content: <Card><CardBody>{label}</CardBody></Card>,
}));
const formatItems = [{ id: 'bold', label: 'Bold' }, { id: 'italic', label: 'Italic' }];
const navTabItems = [{ id: 'general', label: 'General', content: <p>Project settings</p> }, { id: 'access', label: 'Access', content: <p>Member permissions</p> }];
const requiredEmailHtml = '<label class="field">Work email <input type="email" class="input" required placeholder="name@example.com"></label>';
const horizontalTrackHtml = `<div class="carousel"><div class="carousel-viewport" id="variant-track" tabindex="0" aria-label="Project stages">
  <div class="carousel-slide">Discover</div><div class="carousel-slide">Plan</div><div class="carousel-slide">Launch</div>
</div><div class="sample-row"><button class="btn btn-ghost" type="button" data-ut-track="variant-track" data-ut-step="previous">Previous</button>
<button class="btn btn-ghost" type="button" data-ut-track="variant-track">Next</button></div></div>`;

export const componentVariants = {
  'button--full-width': example('Full-width action', 'Stretch a primary action to the width of its form.',
    () => <Button block radius={8}>Continue to payment</Button>, '<button class="btn btn-solid btn-block" data-ut-radius="soft">Continue to payment</button>'),
  'icon-button--pressed': example('Pressed tool action', 'Pair a compact icon with an accessible toggle state.',
    () => <IconButton label="Pin project" pressed radius={8}><Icon name="pin" /></IconButton>, '<button class="icon-btn" type="button" aria-label="Pin project" data-ut-radius="soft" data-ut-toggle aria-pressed="true">◆</button>'),
  'card--pane': example('Contrast pane', 'Highlight an account summary on a contrasting surface.',
    () => <Card pane radius={10}><CardBody><Badge>Team plan</Badge><h3>Workspace access</h3><p>12 members · 3 editors</p></CardBody></Card>,
    '<section class="pane" style="border-radius:10px"><div class="card-body"><span class="badge">Team plan</span><h3>Workspace access</h3><p>12 members · 3 editors</p></div></section>'),
  'field--validation': example('Validation and help text', 'Connect an error message to its field for assistive technology.',
    () => <Field label="Work email" required error="Enter an email address."><Input type="email" defaultValue="studio" /></Field>,
    '<div class="field"><label class="field-label" for="email-error">Work email</label><input class="input" id="email-error" type="email" required aria-invalid="true" aria-describedby="email-hint" value="studio"><span class="field-error" id="email-hint">Enter an email address.</span></div>'),
  'input--required-email': example('Required email', 'Use browser validation and the email keyboard on mobile.',
    () => <Field label="Work email" required><Input type="email" autoComplete="email" placeholder="name@example.com" /></Field>, requiredEmailHtml),
  'input-group--with-action': example('Trailing copy action', 'Add a copy action beside an input without moving focus away from the field.',
    () => <InputGroup end={<ClipboardButton text="https://studio.example" size="sm">Copy</ClipboardButton>}><Input aria-label="Share link" value="https://studio.example" readOnly /></InputGroup>,
    '<div class="input-group"><input class="input" id="share-link" aria-label="Share link" value="https://studio.example" readonly><button type="button" class="btn btn-quiet btn-sm" data-ut-copy="share-link" data-ut-status="share-copy-status">Copy</button></div><span id="share-copy-status" role="status"></span>'),
  'input-otp--four-digit': example('Four-digit PIN', 'Use the same one-time-code control with four slots.',
    () => <InputOTP length={4} aria-label="Four-digit code" />, '<input class="input" aria-label="Four-digit code" inputmode="numeric" pattern="[0-9]{4}" autocomplete="one-time-code" maxlength="4">'),
  'textarea--code': example('Code entry', 'Use monospace input for commands or configuration.',
    () => <Field label="Configuration"><Textarea code defaultValue={'{\n  "mode": "preview"\n}'} /></Field>,
    '<label class="field">Configuration<textarea class="textarea textarea-code">{\n  "mode": "preview"\n}</textarea></label>'),
  'checkbox--disabled': example('Required permission', 'Show an enabled permission that people cannot remove.',
    () => <Checkbox label="View workspace" disabled defaultChecked />, '<label class="choice"><input type="checkbox" class="checkbox" checked disabled> View workspace</label>'),
  'radio-group--disabled-option': example('Availability in a choice group', 'Keep unavailable destinations visible alongside available choices.',
    () => <RadioGroup aria-label="Delivery"><Radio name="delivery-variant" label="Email" defaultChecked /><Radio name="delivery-variant" label="SMS" disabled /></RadioGroup>,
    '<div role="radiogroup" aria-label="Delivery"><label class="choice"><input type="radio" class="radio" name="delivery" checked> Email</label><label class="choice"><input type="radio" class="radio" name="delivery" disabled> SMS</label></div>'),
  'switch--locked': example('Locked preference', 'Show a policy-controlled preference as read-only.',
    () => <Switch label="Audit logging" defaultChecked disabled />, '<button class="switch" type="button" role="switch" aria-label="Audit logging" aria-checked="true" disabled></button>'),
  'toggle--selected': example('Initially selected', 'Start a preference in its pressed state and let the user switch it off.',
    () => <Toggle defaultPressed>Pin project</Toggle>, '<button class="btn btn-ghost toggle" type="button" aria-pressed="true" data-ut-toggle>Pin project</button>'),
  'toggle-group--formatting': example('Independent formatting', 'Enable multiple formatting options and set one on by default.',
    () => <ToggleGroup aria-label="Formatting" multiple defaultValue={['bold']} items={formatItems} />,
    '<div class="button-group toggle-group" role="group" aria-label="Formatting"><button class="btn btn-ghost toggle" data-ut-toggle aria-pressed="true">Bold</button><button class="btn btn-ghost toggle" data-ut-toggle aria-pressed="false">Italic</button></div>'),
  'button-group--vertical': example('Vertical action group', 'Stack actions when horizontal space is limited.',
    () => <ButtonGroup orientation="vertical" aria-label="Align text"><Button variant="ghost">Left</Button><Button variant="ghost">Center</Button><Button variant="ghost">Right</Button></ButtonGroup>,
    '<div class="button-group" data-orientation="vertical" role="group" aria-label="Align text"><button class="btn btn-ghost">Left</button><button class="btn btn-ghost">Center</button><button class="btn btn-ghost">Right</button></div>'),
  'slider--marks': example('Stepped range with marks', 'Mark meaningful stops in a small numeric range.',
    () => <Slider label="Refresh interval" min={5} max={30} step={5} defaultValue={15} marks={[5, 15, 30]} format={(value) => `${value}s`} />,
    '<label class="field">Refresh interval <input type="range" min="5" max="30" step="5" value="15" list="intervals"></label><datalist id="intervals"><option value="5"><option value="15"><option value="30"></datalist>'),
  'tabs--access': example('Project settings tabs', 'Select a settings section with the keyboard or pointer.',
    () => <Tabs label="Project settings" defaultValue="access" items={navTabItems} />,
    '<div class="tabs" data-ut-tabs role="tablist" aria-label="Project settings"><button type="button" class="tab" id="tab-general" role="tab" aria-selected="false" aria-controls="panel-general" tabindex="-1">General</button><button type="button" class="tab" id="tab-access" role="tab" aria-selected="true" aria-controls="panel-access">Access</button></div><p id="panel-general" role="tabpanel" aria-labelledby="tab-general" hidden>Project settings</p><p id="panel-access" role="tabpanel" aria-labelledby="tab-access">Member permissions</p>'),
  'accordion--single': example('Single expanded section', 'Keep one section open at a time in a compact help panel.',
    () => <Accordion defaultValue={['projects']} items={[{ id: 'projects', label: 'Projects', content: 'Create projects from the workspace.' }, { id: 'people', label: 'People', content: 'Invite teammates from the access page.' }]} />,
    '<div class="accordion"><details name="project-help" open><summary class="disclosure-trigger">Projects</summary><p>Create projects from the workspace.</p></details><details name="project-help"><summary class="disclosure-trigger">People</summary><p>Invite teammates from the access page.</p></details></div>'),
  'collapsible--initially-open': example('Initially open', 'Show important content first and let readers collapse it.',
    () => <Collapsible label="Build summary" defaultOpen><p>Three checks passed.</p></Collapsible>,
    '<details class="collapsible" open><summary class="disclosure-trigger">Build summary</summary><p class="disclosure-body" data-ut-enter>Three checks passed.</p></details>'),
  'alert-dialog--destructive': example('Destructive confirmation', 'Emphasize an irreversible action and focus the safer choice.',
    () => <DialogVariant kind="confirm" />, dialogHtml('confirm-draft', 'Delete draft?')),
  'modal--wide': example('Wide dialog', 'Give a complex settings form a wider surface.',
    () => <DialogVariant kind="wide" />, dialogHtml('wide-settings', 'Project settings', 'modal-wide')),
  'dialog--wide': example('Wide settings dialog', 'Use a wider panel for related settings and their explanations.',
    () => <DialogVariant kind="wide" />, dialogHtml('project-dialog', 'Project settings', 'modal-wide')),
  'drawer--side': example('End-side drawer', 'Open a drawer from the inline end instead of the bottom.',
    () => <DialogVariant kind="drawer" />, dialogHtml('project-drawer', 'Project settings', 'sheet-panel drawer-panel', 'end')),
  'sheet--start': example('Start-side sheet', 'Open a secondary panel from the inline start.',
    () => <DialogVariant kind="left" />, dialogHtml('project-sheet', 'Project settings', 'sheet-panel', 'start')),
  'popover--align-end': example('End-aligned settings', 'Anchor a compact settings panel to the end of its trigger.',
    () => <Popover label="View settings" trigger="Options" align="end"><Switch label="Compact rows" /></Popover>,
    '<details class="popover" data-ut-disclosure><summary class="btn btn-ghost">Options</summary><div class="pop popover-panel"><label class="choice"><input type="checkbox" class="checkbox"> Compact rows</label></div></details>'),
  'combobox--multiple': example('Multiple team selection', 'Select several teams while keeping unavailable options visible.',
    () => <Combobox label="Teams" options={teamOptions} multiple defaultValue={['design']} />,
    '<label class="field">Teams<select class="select" multiple size="3"><option selected>Design</option><option>Engineering</option><option disabled>Operations</option></select></label>'),
  'select--disabled-option': example('Role availability', 'Preselect an available role and keep restricted roles visible.',
    () => <SelectMenu label="Team" options={teamOptions} defaultValue="design" />,
    '<label class="field">Team<select class="select"><option>Design</option><option>Engineering</option><option disabled>Operations</option></select></label>'),
  'native-select--placeholder': example('Required select with placeholder', 'Prompt the user to pick an option before submitting.',
    () => <Field label="Team" required><NativeSelect defaultValue=""><option value="" disabled>Choose a team</option><option>Design</option></NativeSelect></Field>,
    '<label class="field">Team<select class="select" required><option value="" selected disabled>Choose a team</option><option>Design</option></select></label>'),
  'command--groups': example('Grouped project commands', 'Search named command groups and run an action from the results.',
    SearchActions, '<div class="command"><input class="input" type="search" aria-label="Filter actions" data-ut-filter="grouped-actions"><div class="search-results" id="grouped-actions"><a class="menu-item" data-ut-option href="#new">Create project</a><a class="menu-item" data-ut-option href="#settings">Open settings</a></div></div>'),
  'carousel--loop': example('Looping project stages', 'Cycle through a project’s stages with arrow controls.',
    () => <Carousel slides={carouselSlides} loop aria-label="Project stages" />, horizontalTrackHtml.replace('id="variant-track"', 'id="variant-track" data-ut-loop')),
  'carousel--vertical': example('Vertical carousel', 'Browse vertically stacked slides in a small viewport.',
    () => <Carousel slides={carouselSlides} orientation="vertical" aria-label="Project stages" />, horizontalTrackHtml.replace('class="carousel"', 'class="carousel" data-orientation="vertical"')),
  'calendar--bounded': example('Bounded booking window', 'Limit the calendar to bookable dates.',
    () => <Calendar defaultValue={new Date(2026, 10, 10)} min={new Date(2026, 10, 1)} max={new Date(2026, 10, 30)} />,
    '<label class="field">Booking date<input class="input" type="date" min="2026-11-01" max="2026-11-30" value="2026-11-10"></label>'),
  'date-picker--bounded': example('Date picker with limits', 'Limit scheduling to an approved delivery window.',
    () => <DatePicker label="Delivery date" min={new Date(2026, 10, 1)} max={new Date(2026, 10, 30)} defaultValue={new Date(2026, 10, 10)} />,
    '<label class="field">Delivery date<input class="input" type="date" min="2026-11-01" max="2026-11-30" value="2026-11-10"></label>'),
  'date-range-picker--bounded': example('Reporting window', 'Start with a selected date range and constrain the available dates.',
    DateBounds, '<fieldset class="worklist-dates"><legend>November reporting window</legend><div class="worklist-controls"><label class="field">Start <input type="date" class="input" min="2026-11-01" max="2026-11-10" value="2026-11-02"></label><label class="field">End <input type="date" class="input" min="2026-11-02" max="2026-11-30" value="2026-11-10"></label></div></fieldset>'),
  'progress--indeterminate': example('Indeterminate upload', 'Show activity while the total work is unknown.',
    () => <Progress label="Preparing export" />, '<progress aria-label="Preparing export"></progress>'),
  'loader--progress': example('Determinate loader', 'Pair an operation label with known progress.',
    () => <Loader variant="progress" value={72} label="Importing projects" />, '<label>Importing projects <progress value="72" max="100">72%</progress></label>'),
  'spinner--compact': example('Compact inline spinner', 'Show background activity next to a short status.',
    () => <span className="sample-row"><Spinner size={16} label="Syncing" /><span>Syncing</span></span>,
    '<span class="sample-row"><span class="spinner" style="--ut-spinner-size:16px" role="status" aria-label="Syncing"></span>Syncing</span>'),
  'skeleton--profile': example('Profile placeholder', 'Reserve room for an avatar and two lines of content.',
    () => <div className="sample-row"><Skeleton width={42} height={42} variant="circle" /><div><Skeleton width={120} height={14} /><Skeleton width={80} height={10} /></div></div>,
    '<div class="sample-row" aria-hidden="true"><span class="skeleton" style="width:42px;height:42px;border-radius:50%"></span><span class="skeleton" style="width:120px;height:14px"></span></div>'),
  'banner--dismissible': example('Dismissible announcement', 'Give an announcement a release link and a dismiss action.',
    DismissBanner, '<aside class="kit-banner" id="release-banner">Version 2 is ready. <a class="link" href="#release">Release notes</a> <button class="btn btn-ghost btn-sm" type="button" data-ut-dismiss="release-banner">Dismiss</button></aside>'),
  'attachment--removable': example('Removable attachment', 'Let people remove a file before submitting a message.',
    RemovableAttachment, '<div class="item attachment" id="brief-attachment"><span>brief.pdf</span><button class="btn btn-ghost btn-sm" type="button" data-ut-dismiss="brief-attachment">Remove file</button></div>'),
  'clipboard--confirmation': example('Custom copy confirmation', 'Use specific feedback for a shareable invite code.',
    () => <ClipboardButton text="STUDIO-204" copiedLabel="Invite code copied" variant="ghost">Copy invite code</ClipboardButton>,
    '<code id="invite-code">STUDIO-204</code> <button class="btn btn-ghost" type="button" data-ut-copy="invite-code" data-ut-status="invite-status">Copy invite code</button><p id="invite-status" role="status"></p>'),
  'table--mobile-stack': example('Stacked mobile rows', 'Keep column names visible on narrow screens.',
    () => <Table stack caption="Workspace owners" columns={[{ key: 'name', header: 'Project' }, { key: 'owner', header: 'Owner' }]} rows={projects} getRowKey={(row) => row.id} />,
    '<div class="table-wrap"><table class="table table-stack"><caption>Workspace owners</caption><thead><tr><th scope="col">Project</th><th scope="col">Owner</th></tr></thead><tbody><tr><td data-label="Project">Studio</td><td data-label="Owner">Design</td></tr><tr><td data-label="Project">Atlas</td><td data-label="Owner">Engineering</td></tr></tbody></table></div>'),
  'aspect-ratio--portrait': example('Portrait media frame', 'Reserve a four-by-five space for portrait content.',
    () => <AspectRatio ratio={4 / 5} className="catalog-frame" style={{ maxWidth: 176 }}>Portrait</AspectRatio>,
    '<div class="aspect-ratio" style="--ut-ratio:0.8;max-width:176px;background:var(--ut-bg-3)">Portrait</div>'),
  'device-mockup--desktop': example('Desktop preview', 'Use a wider device frame for a dashboard.',
    () => <DeviceMockup device="desktop"><CardBody>Workspace activity</CardBody></DeviceMockup>,
    '<div class="device-frame" data-device="desktop"><div class="device-screen"><div class="card-body">Workspace activity</div></div></div>'),
  'gallery--two-columns': example('Two-column gallery', 'Use larger items for a small collection.',
    () => <Gallery columns={2}><Card><CardBody>Brand identity</CardBody></Card><Card><CardBody>Product motion</CardBody></Card></Gallery>,
    '<div class="media-gallery" data-columns="2"><div class="card card-body">Brand identity</div><div class="card card-body">Product motion</div></div>'),
  'video--poster': example('Poster and native controls', 'Show a poster and use the browser’s controls with a custom frame.',
    () => <VideoPlayer poster={videoPoster} aria-label="Poster preview" preload="none" controls radius={0} inlineSize={360} />,
    `<video class="kit-video" aria-label="Poster preview" poster='${videoPoster}' preload="none" controls style="inline-size:360px;border-radius:0"></video>`),
  'split-button--new-project': example('Create with secondary actions', 'Keep the primary action separate from alternate creation flows.',
    () => <SplitButton label="New project" items={[{ title: 'Import project', sub: 'Start from an existing project' }, { title: 'Use a template', sub: 'Start with a preset layout' }]} />,
    '<div class="sample-row"><a class="btn btn-solid" href="#new">New project</a>' + menuHtml('More actions', '<a class="menu-item" href="#import">Import project</a><a class="menu-item" href="#templates">Use a template</a>') + '</div>'),
  'choice--mixed': example('Mixed and disabled choices', 'Show that only some items in a group are selected.',
    () => <div className="sample-stack"><Checkbox label="Select all files" indeterminate /><Checkbox label="Read only" disabled defaultChecked /></div>,
    '<label class="choice"><input class="checkbox" type="checkbox" data-ut-mixed> Select all files</label><label class="choice"><input class="checkbox" type="checkbox" checked disabled> Read only</label>'),
  'segmented--counts': example('Views with counts', 'Pair each view with a compact count.',
    () => <Segmented aria-label="Project views" defaultValue="open" items={[{ id: 'open', label: 'Open', count: 3 }, { id: 'closed', label: 'Closed', count: 12 }]} />,
    '<div class="sample-row" role="radiogroup" aria-label="Project views"><label class="choice"><input type="radio" class="radio" name="views" checked> Open · 3</label><label class="choice"><input type="radio" class="radio" name="views"> Closed · 12</label></div>'),
  'menu--danger': example('Menu with a destructive action', 'Distinguish destructive choices from ordinary navigation.',
    () => <Menu trigger={(props) => <Button {...props} variant="ghost">Project actions</Button>} items={menuItems} />, menuHtml('Project actions')),
  'dropdown-menu--end': example('Right-aligned actions', 'Align the menu to the end of its trigger.',
    () => <Menu trigger={(props) => <Button {...props} variant="ghost">Project actions</Button>} align="end" items={menuItems} />, menuHtml('Project actions').replace('pop pop-left', 'pop')),
  'context-menu--project': example('Project row context menu', 'Offer actions from a row’s context menu.',
    () => <ContextMenu label="Project actions" items={menuItems}><Item title="Project Studio" description="Open context actions" /></ContextMenu>,
    '<div class="item">Project Studio ' + menuHtml('Project actions') + '</div>'),
  'menubar--editor': example('Editor menus', 'Group file and edit commands into two menus.',
    () => <Menubar aria-label="Editor menus" menus={[{ id: 'file', label: 'File', items: menuItems }, { id: 'edit', label: 'Edit', items: [{ label: 'Duplicate', onSelect: () => {} }] }]} />,
    '<div class="sample-row" role="group" aria-label="Editor menus">' + menuHtml('File') + menuHtml('Edit', '<a class="menu-item" href="#duplicate">Duplicate</a>') + '</div>'),
  'mega-menu--resources': example('Resource columns', 'Give support and reference material their own headings.',
    () => <MegaMenu trigger="Resources" label="Resources" columns={[{ title: 'Explore', links: sampleLinks }, { title: 'Support', links: [{ label: 'Help centre', href: '#help' }] }]} />,
    menuHtml('Resources', '<p class="label">Explore</p><a class="menu-item" href="#projects">Projects</a><a class="menu-item" href="#team">Team</a><p class="label">Support</p><a class="menu-item" href="#help">Help centre</a>')),
  'navigation-menu--groups': example('Grouped reference links', 'Place a group of documentation links beside a direct link.',
    () => <NavigationMenu items={[{ id: 'home', label: 'Overview', href: '#overview' }, { id: 'docs', label: 'Reference', children: sampleLinks }]} />,
    '<nav class="navigation-menu" aria-label="Resources"><a class="btn btn-plain" href="#overview">Overview</a>' + menuHtml('Reference') + '</nav>'),
  'speed-dial--above': example('Actions above the trigger', 'Open creation actions above a trigger at the bottom of a view.',
    () => <div style={{ paddingTop: 100 }}><SpeedDial placement="above" trigger="Create" label="Create"><Button href="#new">New project</Button></SpeedDial></div>,
    '<div style="padding-top:100px">' + menuHtml('Create', '<a class="menu-item" href="#new">New project</a>').replace('class="popover"', 'class="popover speed-dial" data-placement="above"') + '</div>'),
  'toast--persistent': example('Persistent action toast', 'Keep important feedback visible until it is dismissed.',
    PersistentToast, '<button type="button" class="btn btn-solid" data-ut-reveal="export-toast">Show export notice</button><div class="alert" id="export-toast" role="status" hidden data-ut-enter>Export is ready. <a class="link" href="#export">View export</a> <button class="btn btn-ghost btn-sm" data-ut-dismiss="export-toast">Dismiss</button></div>'),
  'tooltip--immediate': example('Immediate toolbar hint', 'Display a keyboard hint without a hover delay.',
    () => <Tooltip delay={0} content="Search · Ctrl K"><Button variant="ghost">Search</Button></Tooltip>,
    '<button type="button" class="btn btn-ghost" title="Search · Ctrl K">Search</button>'),
  'hover-card--profile': example('Profile preview', 'Show a compact member summary alongside a profile link.',
    () => <HoverCard href="#profile" trigger="Asha Rao" content={<Item title="Asha Rao" description="Design lead" leading={<Avatar name="Asha Rao" />} />} />,
    menuHtml('Asha Rao', '<div class="item"><strong>Asha Rao</strong><span class="muted">Design lead</span></div>')),
  'badge--counts': example('Counts and status badges', 'Use a count for unread items and a status for health.',
    () => <div className="sample-row"><Badge tone="count">12</Badge><Badge tone="ok">Healthy</Badge></div>,
    '<div class="sample-row"><span class="badge badge-count">12</span><span class="badge badge-ok">Healthy</span></div>'),
  'chip--accent': example('Accent filter chips', 'Use a monospace or accent chip for filters.',
    () => <div className="sample-row"><Chip accent>Design</Chip><Chip mono>v2.0</Chip></div>,
    '<div class="sample-row"><span class="chip chip-accent">Design</span><span class="chip chip-mono">v2.0</span></div>'),
  'dot--static': example('Static warning status', 'Show a labelled warning without continuous motion.',
    () => <span className="sample-row"><Dot static tone="warn" />Review required</span>,
    '<span class="sample-row"><span class="dot dot-warn dot-static" aria-hidden="true"></span>Review required</span>'),
  'avatar--team': example('Overlapping member group', 'Show a team with an overflow count.',
    () => <AvatarGroup max={2} aria-label="Project team"><Avatar name="Asha Rao" status="ok" /><Avatar name="Mika Chen" /><Avatar name="Sam Park" /></AvatarGroup>,
    '<div class="avatar-group" aria-label="Project team"><span class="avatar" role="img" aria-label="Asha Rao">AR</span><span class="avatar" role="img" aria-label="Mika Chen">MC</span><span class="avatar" aria-label="One more member">+1</span></div>'),
  'empty--with-action': example('Invite from an empty state', 'Give the user a next step when a list is empty.',
    () => <EmptyState title="No collaborators" action={<Button href="#invite">Invite a teammate</Button>}><p>Your project is private.</p></EmptyState>,
    '<div class="empty-state"><h2 class="empty-state-title">No collaborators</h2><p>Your project is private.</p><a class="btn btn-solid" href="#invite">Invite a teammate</a></div>'),
  'empty-state--quiet': example('Informational empty state', 'Explain an empty archive when there is no action to take.',
    () => <EmptyState title="Archive is empty"><p>Archived projects will appear here.</p></EmptyState>,
    '<div class="empty-state"><h2 class="empty-state-title">Archive is empty</h2><p>Archived projects will appear here.</p></div>'),
  'footer--cta': example('Footer with signup CTA', 'Place a signup link beside the closing message.',
    () => <Footer lede="Build your next project." cta={<Button href="#signup">Sign up</Button>} bottom="Utkristi" />,
    '<footer class="footer"><div class="footer-inner"><div class="footer-top"><p class="lede">Build your next project.</p><a class="btn btn-solid" href="#signup">Sign up</a></div><div class="footer-bottom">Utkristi</div></div></footer>'),
  'shell--workspace': example('Workspace shell', 'Compose a header and footer around an application page.',
    () => <Shell navbar={{ brand: 'Workspace', links: sampleLinks, sticky: false }} footer={{ bottom: 'Workspace' }}><p>Project activity</p></Shell>,
    '<div class="shell"><header class="header header-static"><nav class="navbar"><div class="navbar-inner">Workspace</div></nav></header><main class="page">Project activity</main><footer class="footer"><div class="footer-bottom">Workspace</div></footer></div>'),
  'steps--disabled': example('Steps with a locked stage', 'Show later stages without making a blocked step actionable.',
    () => <Steps defaultValue="review" items={[{ id: 'setup', label: 'Setup' }, { id: 'review', label: 'Review' }, { id: 'publish', label: 'Publish', disabled: true }]} />,
    '<ol><li>Setup</li><li aria-current="step">Review</li><li><button class="btn btn-ghost" disabled>Publish</button></li></ol>'),
  'stat--suffix': example('Metric with a unit', 'Keep a unit and time frame next to a headline metric.',
    () => <Stat value="97.4" suffix="%" label="Delivery success" desc="Last 30 days" />,
    '<div class="stat"><span class="label">Delivery success</span><strong class="stat-value">97.4%</strong><p>Last 30 days</p></div>'),
  'theme-toggle--select': example('Theme dropdown', 'Choose any appearance from a compact native select.',
    () => <ThemeSelect />, '<label class="field">Theme<select class="select" data-ut-theme><option value="dark">Night</option><option value="light">Paper</option><option value="glass">Glass</option></select></label>'),
  'theme-switch--settings': example('Theme switch in settings', 'Present the theme controls inside a settings panel.',
    () => <Card><CardBody><h3>Appearance</h3><ThemeSwitch /></CardBody></Card>,
    '<section class="card card-body"><h3>Appearance</h3><label class="field">Theme<select class="select" data-ut-theme><option value="dark">Night</option><option value="light">Paper</option><option value="glass">Glass</option></select></label></section>'),
  'rich-text--checklist': example('Structured release notes', 'Render headings, lists, and inline code in a note.',
    () => <RichText text={'## Release checklist\n\n- Run `npm test`\n- Publish the package'} />,
    '<article class="rt"><h2>Release checklist</h2><ul><li>Run <code>npm test</code></li><li>Publish the package</li></ul></article>'),
  'kbd--shortcut': example('Keyboard shortcut chord', 'Group individual keys into one shortcut.',
    () => <span className="sample-row"><Kbd>Ctrl</Kbd><span>+</span><Kbd>Enter</Kbd></span>,
    '<span class="sample-row"><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Enter</kbd></span>'),
  'code--inline': example('Inline command', 'Highlight a command in a short instruction.',
    () => <p>Run <Code inline>npm run build</Code> before deploying.</p>,
    '<p>Run <code class="code-inline">npm run build</code> before deploying.</p>'),
  'code-block--logs': example('Read-only build log', 'Show line numbers and omit the copy button.',
    () => <CodeBlock title="Build output" code={logSource} lineNumbers copy={false} />,
    '<div class="code-block"><div class="code-block-head"><span class="label">Build output</span></div><pre class="code code-lines"><span>Build complete</span><span>3 checks passed</span></pre></div>'),
  'logo--compact': example('Compact project mark', 'Use the symbol alone in a compact toolbar.',
    () => <Logo compact name="Workspace" size={24} />,
    '<span class="label" aria-label="Workspace">Workspace</span>'),
  'bottom-navigation--labelled': example('Mobile destinations', 'Give the current mobile destination a label and icon.',
    () => <BottomNavigation aria-label="Workspace" items={sampleLinks.map((link) => ({ ...link, icon: <Icon name={link.active ? 'grid' : 'user'} /> }))} />,
    '<nav class="bottom-nav" aria-label="Workspace"><a class="bottom-nav-link" href="#projects" aria-current="page">Projects</a><a class="bottom-nav-link" href="#team">Team</a></nav>'),
  'file-input--images': example('Multiple image uploads', 'Limit the file picker to images and allow several files.',
    () => <Field label="Brand images"><FileInput accept="image/*" multiple /></Field>,
    '<label class="field">Brand images<input class="file-input" type="file" accept="image/*" multiple></label>'),
  'floating-input--prefilled': example('Prefilled floating field', 'Keep a floating label visible over a saved value.',
    () => <FloatingInput label="Workspace name" defaultValue="Studio" required />,
    '<div class="floating-field"><input class="input" id="saved-workspace" placeholder=" " value="Studio" required><label for="saved-workspace">Workspace name</label></div>'),
  'number-input--step': example('Quantity in steps', 'Allow changes in increments of five.',
    () => <Field label="Seats"><NumberInput min={5} max={50} step={5} defaultValue={10} /></Field>,
    '<label class="field">Seats<input class="input" type="number" min="5" max="50" step="5" value="10"></label>'),
  'phone-input--country': example('Country-code entry', 'Provide a country code and a tel keyboard.',
    () => <Field label="Contact phone"><PhoneInput defaultValue="+91 " required /></Field>,
    '<label class="field">Contact phone<input class="input" type="tel" autocomplete="tel" value="+91 " required></label>'),
  'time-input--business-hours': example('Business hours', 'Constrain a time to a working window and quarter-hour steps.',
    () => <Field label="Delivery time"><TimeInput min="09:00" max="17:00" step={900} defaultValue="09:00" /></Field>,
    '<label class="field">Delivery time<input class="input" type="time" min="09:00" max="17:00" step="900" value="09:00"></label>'),
  'jumbotron--actions': example('Hero with two actions', 'Give readers a primary action and a secondary link.',
    () => <Jumbotron eyebrow="Workspace" actions={<><Button href="#start">Get started</Button><Button href="#learn" variant="ghost">Learn more</Button></>}><h2>Build together</h2></Jumbotron>,
    '<section class="jumbotron"><p class="label">Workspace</p><h2>Build together</h2><div class="jumbotron-actions"><a class="btn btn-solid" href="#start">Get started</a><a class="btn btn-ghost" href="#learn">Learn more</a></div></section>'),
  'list-group--links': example('Linked settings list', 'Organize links to related settings.',
    () => <ListGroup aria-label="Settings"><li><a className="link" href="#profile">Profile</a></li><li><a className="link" href="#billing">Billing</a></li></ListGroup>,
    '<ul class="list-group" aria-label="Settings"><li><a class="link" href="#profile">Profile</a></li><li><a class="link" href="#billing">Billing</a></li></ul>'),
  'qr-code--compact': example('Compact matrix preview', 'Scale a matrix supplied by the app.',
    () => <QRCode size={88} label="Example matrix" matrix={[[true, true, true], [true, false, true], [true, true, true]]} />,
    '<svg class="qr-code" role="img" aria-label="Example matrix" viewBox="0 0 11 11" width="88" height="88"><rect width="11" height="11" fill="white"/><path d="M4 4h3v3H4z M5 5v1h1V5z" fill-rule="evenodd"/></svg>'),
  'rating--ten': example('Ten-point rating', 'Display a score on a ten-point scale.',
    () => <Rating value={8.5} max={10} />,
    '<span class="star-rating" role="img" aria-label="8.5 out of 10">★★★★★★★★½☆</span>'),
  'timeline--horizontal': example('Horizontal milestones', 'Place a compact release timeline across a wide surface.',
    () => <Timeline orientation="horizontal" entries={steps} />,
    '<ol class="activity-timeline" data-orientation="horizontal"><li><time datetime="2026-11-04">2026-11-04</time><strong>Design approved</strong></li><li><time datetime="2026-11-10">2026-11-10</time><strong>Released</strong></li></ol>'),
  'breadcrumb--deep': example('Nested settings path', 'Show the current destination at the end of a deeper path.',
    () => <Breadcrumb items={[{ label: 'Workspace', href: '#workspace' }, { label: 'Projects', href: '#projects' }, { label: 'Studio', href: '#studio' }, { label: 'Access' }]} />,
    '<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#workspace">Workspace</a></li><li><span aria-hidden="true">/</span> <a href="#projects">Projects</a></li><li><span aria-hidden="true">/</span> <span aria-current="page">Access</span></li></ol></nav>'),
  'bubble--reactions': example('Reply with reactions', 'Use an end-aligned outline bubble with a reaction count.',
    () => <Bubble align="end" variant="outline" reactions={<Badge>✓ 2</Badge>}>Ready for review</Bubble>,
    '<div class="bubble" data-align="end"><div class="bubble-content" data-variant="outline">Ready for review</div><div class="bubble-reactions"><span class="badge">✓ 2</span></div></div>'),
  'chart--line': example('Line trend', 'Show the shape of a short activity trend.',
    () => <Chart title="Daily builds" variant="line" data={chartData} />,
    '<figure><figcaption>Daily builds</figcaption><svg role="img" aria-label="Builds: Mon 12, Tue 18, Wed 14" width="160" height="64" viewBox="0 0 160 64"><path d="M6 48 80 12 154 36" fill="none" stroke="currentColor" stroke-width="3"/></svg></figure>'),
  'bulk-action-bar--export': example('Export selected rows', 'Expose an export action and a clear-selection control.',
    BulkExport, '<div class="worklist-bulk" id="selected-rows" role="group" aria-label="Bulk actions"><span role="status">2 selected</span><button type="button" class="btn btn-ghost btn-sm" data-ut-dismiss="selected-rows">Clear selection</button></div>'),
  'column-chooser--required': example('Required identifying column', 'Keep a key column visible while letting users change the rest.',
    RequiredColumn, menuHtml('Visible columns', '<label class="choice"><input type="checkbox" class="checkbox" checked disabled> Project</label><label class="choice"><input type="checkbox" class="checkbox" checked> Owner</label>')),
  'filter-bar--chips': example('Removable active filter', 'Show the active team as a removable chip.',
    FilterChips, '<div class="worklist-filters" role="group" aria-label="Filters"><button class="btn btn-ghost" data-ut-reveal="active-team">Filter by Design</button><button id="active-team" class="btn btn-ghost" data-ut-dismiss="active-team">Remove filter Team: Design</button></div>'),
  'data-table--page-size': example('Compact page size', 'Render one row per page while retaining selection.',
    () => <DataTable rows={projects} columns={[{ key: 'name', header: 'Project', sortValue: (row) => row.name }]} getRowKey={(row) => row.id} pageSize={1} selection={{}} />,
    '<label class="field">Filter projects<input class="input" type="search" data-ut-filter="compact-projects"></label><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Project</th></tr></thead><tbody id="compact-projects"><tr data-ut-option><td>Studio</td></tr><tr data-ut-option><td>Atlas</td></tr></tbody></table></div>'),
  'direction--rtl': example('Right-to-left controls', 'Mirror alignment and navigation order for Arabic.',
    () => <Direction dir="rtl" lang="ar"><ButtonGroup><Button variant="ghost">السابق</Button><Button>التالي</Button></ButtonGroup></Direction>,
    '<div dir="rtl" lang="ar"><div class="button-group"><button class="btn btn-ghost">السابق</button><button class="btn btn-solid">التالي</button></div></div>'),
  'icon--duotone': example('Duotone icon on an action', 'Use a decorative duotone glyph with a visible button label.',
    () => <Button variant="ghost" iconLeft={<Icon name="folder" variant="duotone" />}>Open files</Button>,
    '<button class="btn btn-ghost"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v11H3z" fill="currentColor" opacity=".2"/><path d="M3 6h7l2 2h9v11H3z" fill="none" stroke="currentColor"/></svg>Open files</button>'),
  'item--action': example('List item with a trailing action', 'Keep a secondary action close to its row.',
    () => <Item title="Workspace access" description="Three active members" actions={<Button variant="ghost" size="sm" href="#manage">Manage</Button>} />,
    '<div class="item"><div class="item-content"><strong>Workspace access</strong><p class="muted">Three active members</p></div><a class="btn btn-ghost btn-sm" href="#manage">Manage</a></div>'),
  'label--required': example('Label with a required control', 'Show the required cue and associate it with the field.',
    () => <div className="field"><Label htmlFor="variant-required">Project name *</Label><Input required id="variant-required" /></div>,
    '<div class="field"><label class="field-label" for="variant-required">Project name *</label><input class="input" id="variant-required" required></div>'),
  'marker--border': example('Inline confirmation marker', 'Mark a completed sync with a compact border.',
    () => <Marker variant="border" icon={<Icon name="check" />}>Workspace synced</Marker>,
    '<div class="marker" data-variant="border"><span aria-hidden="true">✓</span><span>Workspace synced</span></div>'),
  'message--outgoing': example('Outgoing message', 'Align a reply to the end with a delivery footer.',
    () => <Message align="end" sender="You" footer="Delivered"><Bubble align="end" variant="solid">Ready to ship.</Bubble></Message>,
    '<article class="message" data-align="end"><div class="message-content"><span class="message-sender label">You</span><div class="bubble" data-align="end"><div class="bubble-content" data-variant="solid">Ready to ship.</div></div><div class="message-footer">Delivered</div></div></article>'),
  'message-scroller--history': example('Review message history', 'Disable following new messages while reviewing earlier entries.',
    () => <MessageScroller label="Project history" follow={false} items={messages} />,
    '<div class="message-scroller"><div class="message-viewport" role="log" aria-label="Project history" tabindex="0"><div class="message-feed"><p>Ready to review</p><p>Looks good</p></div></div></div>'),
  'pagination--last-page': example('Pagination at the last page', 'Show the boundary and allow moving back.',
    LastPage, '<nav class="pagination" aria-label="Pagination"><a class="btn btn-ghost" href="?page=11">Previous page</a><span aria-current="page">12</span><button class="btn btn-ghost" disabled>Next page</button></nav>'),
  'questionnaire--multiple': example('Multiple answers', 'Collect several choices for a single question.',
    () => <Questionnaire questions={[{ id: 'channels', prompt: 'Preferred channels', multiple: true, options: [{ value: 'email', label: 'Email' }, { value: 'chat', label: 'Chat' }] }]} onSubmit={() => {}} />,
    '<fieldset><legend>Preferred channels</legend><label class="choice"><input class="checkbox" type="checkbox" name="channels" value="email"> Email</label><label class="choice"><input class="checkbox" type="checkbox" name="channels" value="chat"> Chat</label></fieldset>'),
  'resizable--vertical': example('Vertical split', 'Stack panels with a keyboard-adjustable separator.',
    () => <Resizable orientation="vertical" first={<p>Preview</p>} second={<p>Logs</p>} defaultValue={60} />,
    '<div class="resizable" data-orientation="vertical" style="--ut-split:60%"><div class="resizable-pane">Preview</div><div class="resizable-handle" aria-hidden="true"></div><div class="resizable-pane">Logs</div></div>'),
  'scroll-area--horizontal': example('Horizontal overflow region', 'Keep a wide row of content scrollable with the keyboard.',
    () => <ScrollArea orientation="horizontal" aria-label="Milestones"><div style={{ minWidth: 640 }}>Design review · Build preview · Release sign-off</div></ScrollArea>,
    '<div class="scroll-area ut-scrollbar" data-orientation="horizontal" role="region" tabindex="0" aria-label="Milestones"><p style="min-width:640px">Design review · Build preview · Release sign-off</p></div>'),
  'separator--vertical': example('Vertical separator', 'Divide two neighbouring tools.',
    () => <div className="sample-row" style={{ height: 42 }}><span>Design</span><Separator orientation="vertical" /><span>Build</span></div>,
    '<div class="sample-row" style="height:42px"><span>Design</span><div class="separator" data-orientation="vertical" aria-hidden="true"></div><span>Build</span></div>'),
  'sidebar--collapsed': example('Collapsed sidebar', 'Keep the heading visible while hiding navigation content.',
    () => <Sidebar collapsed heading="Workspace"><a href="#projects">Projects</a></Sidebar>,
    '<aside class="sidebar" data-collapsed><div class="sidebar-heading">Workspace</div><div class="sidebar-content" hidden><a href="#projects">Projects</a></div></aside>'),
  'trace--failed': example('Failed step with details', 'Show diagnostic information for an unsuccessful operation.',
    () => <Trace steps={[{ id: 'compile', title: 'Compile', status: 'done' }, { id: 'verify', title: 'Verify output', status: 'error', detail: 'The output did not match the expected schema.' }]} />,
    '<ol class="trace"><li><details><summary class="trace-line">Verify output · Error</summary><div class="trace-detail">The output did not match the expected schema.</div></details></li></ol>'),
  'typography--reading': example('Serif reading mode', 'Use serif typography for long-form content.',
    () => <Typography as="article" typeface="serif"><h2>Release notes</h2><p>See what shipped in this release.</p></Typography>,
    '<article class="typography type-serif"><h2>Release notes</h2><p>See what shipped in this release.</p></article>'),
} satisfies Record<string, Example>;
