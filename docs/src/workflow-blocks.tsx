import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Avatar, Badge, Button, StreamChart, createChartStream, type StreamChartVariant, Card, CardBody, CardHeader, Checkbox, DataTable, Icon,
  Select, SelectMenu, Stat, Table, Tabs, type DataColumn,
} from '@utkristi/ui';
import type { Example } from './examples';

const flow: CSSProperties = { display: 'grid', gap: 12, minWidth: 0 };
const row: CSSProperties = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 };
const cardWidth: CSSProperties = { maxWidth: 460, marginInline: 'auto' };

const incidents = [
  { id: 'INC-037', service: 'API gateway', impact: 'Elevated latency', severity: 'Critical', owner: 'Platform' },
  { id: 'INC-038', service: 'Notifications', impact: 'Delayed delivery', severity: 'Warning', owner: 'Messaging' },
  { id: 'INC-039', service: 'Billing sync', impact: 'Recovered', severity: 'Resolved', owner: 'Finance' },
] as const;

const incidentColumns: DataColumn<typeof incidents[number]>[] = [
  { key: 'id', header: 'Incident', sortValue: (item) => item.id },
  { key: 'service', header: 'Service', sortValue: (item) => item.service },
  { key: 'impact', header: 'Impact' },
  { key: 'owner', header: 'Owner' },
  { key: 'severity', header: 'Severity', render: (item) =>
    <Badge tone={item.severity === 'Critical' ? 'bad' : item.severity === 'Warning' ? 'warn' : 'ok'}>{item.severity}</Badge> },
];

function IncidentBoard() {
  const [severity, setSeverity] = useState('');
  return <Card><CardHeader style={row}><strong>Incident board</strong>
    <Select aria-label="Incident severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
      <option value="">All severities</option><option>Critical</option><option>Warning</option><option>Resolved</option>
    </Select>
  </CardHeader><CardBody>
    <DataTable stack rows={incidents.filter((item) => !severity || item.severity === severity)} getRowKey={(item) => item.id}
      searchLabel="Search incidents" columns={incidentColumns} aria-label="Service incidents" />
  </CardBody></Card>;
}

const accessRequests = [
  { id: 'r1', person: 'Asha Rao', access: 'Production read access' },
  { id: 'r2', person: 'Nora Chen', access: 'Billing editor' },
  { id: 'r3', person: 'Mika Laurent', access: 'Incident responder' },
];

function AccessReview() {
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const pending = accessRequests.filter(({ id }) => !reviewed.includes(id));
  return <Card><CardHeader><strong>Access review</strong><Badge>{pending.length} pending</Badge></CardHeader>
    <CardBody style={flow}>
      {pending.map(({ id, person, access }) => <Checkbox key={id} checked={selected.includes(id)}
        label={`${person} · ${access}`} onChange={(event) => {
          const checked = event.currentTarget.checked;
          setSelected((current) => checked ? [...current, id] : current.filter((value) => value !== id));
        }} />)}
      <div style={row}><Button disabled={!selected.length} onClick={() => {
        setReviewed((current) => [...current, ...selected]);
        setSelected([]);
      }}>Mark reviewed</Button>
      <Button variant="quiet" disabled={!reviewed.length && !selected.length} onClick={() => { setReviewed([]); setSelected([]); }}>Reset</Button></div>
      <span role="status">{reviewed.length ? `${reviewed.length} requests reviewed` : 'Select requests to review.'}</span>
    </CardBody>
  </Card>;
}

const invoices = [
  { id: 'INV-109', period: 'August', total: '$1,240.00', status: 'Due' },
  { id: 'INV-108', period: 'July', total: '$1,185.00', status: 'Paid' },
  { id: 'INV-107', period: 'June', total: '$1,185.00', status: 'Paid' },
];

function BillingRegister() {
  const [filter, setFilter] = useState('');
  return <Card><CardHeader style={row}><strong>Billing register</strong>
    <Select aria-label="Invoice status" value={filter} onChange={(event) => setFilter(event.target.value)}>
      <option value="">All invoices</option><option>Due</option><option>Paid</option>
    </Select></CardHeader>
    <CardBody><Table stack aria-label="Invoices" rows={invoices.filter((item) => !filter || item.status === filter)}
      getRowKey={(item) => item.id} columns={[
        { key: 'id', header: 'Invoice' }, { key: 'period', header: 'Period' }, { key: 'total', header: 'Total', num: true },
        { key: 'status', header: 'Status', render: (item) => <Badge tone={item.status === 'Paid' ? 'ok' : 'warn'}>{item.status}</Badge> },
      ]} /></CardBody></Card>;
}

function ReleaseNotes() {
  return <Card><CardHeader><strong>Release notes</strong><Badge tone="accent">Platform</Badge></CardHeader>
    <CardBody><Tabs label="Release versions" items={[
      { id: 'current', label: 'v2.4', content: <div style={flow}>
        <strong>Workspace visibility</strong><span>See ownership and rollout status in the same view.</span>
        <Badge tone="ok">Generally available</Badge></div> },
      { id: 'previous', label: 'v2.3', content: <div style={flow}>
        <strong>Access review history</strong><span>Read completed reviews alongside active requests.</span></div> },
      { id: 'planned', label: 'Preview', content: <div style={flow}>
        <strong>Scheduled exports</strong><span>Preview a recurring report before configuring delivery.</span>
        <Badge tone="warn">Preview</Badge></div> },
    ]} /></CardBody></Card>;
}

function MetricCard() {
  const [period, setPeriod] = useState('week');
  const weekly = period === 'week';
  return <Card style={cardWidth}><CardHeader style={row}>
    <strong>Build performance</strong><Select aria-label="Metric period" value={period} onChange={(event) => setPeriod(event.target.value)}>
      <option value="week">7 days</option><option value="month">30 days</option></Select>
  </CardHeader><CardBody style={flow}>
    <Stat label="Successful builds" value={weekly ? '98.4' : '97.6'} suffix="%" desc={weekly ? '324 builds in the last week' : '1,274 builds in the last month'} />
    <Badge tone="ok">{weekly ? '+1.2 percentage points' : '+0.8 percentage points'}</Badge>
  </CardBody></Card>;
}

function FeatureCard() {
  return <Card pane style={cardWidth}><CardBody style={flow}>
    <Icon name="shield-check" size={28} /><span className="label">Governance</span>
    <strong style={{ fontSize: '1.4rem' }}>Approval paths</strong>
    <span>Give reviewers the right context before a change reaches production.</span>
    <details><summary>See what is included</summary><ul>
      <li>Role-based ownership</li><li>Environment approval rules</li><li>Decision history</li>
    </ul></details>
  </CardBody></Card>;
}

function StoryCard() {
  return <Card style={cardWidth} data-ut-preset="signal"><CardBody style={flow}>
    <span className="label">Customer story · Sample</span>
    <blockquote style={{ margin: 0, fontSize: '1.35rem', lineHeight: 1.3 }}>
      “When a release pauses, everyone can see who owns the next step.”
    </blockquote>
    <div style={row}><Avatar name="Asha Rao" /><div><strong>Asha Rao</strong><div className="muted">Platform lead, Meridian Cloud</div></div></div>
  </CardBody></Card>;
}

function TeamCard() {
  const [following, setFollowing] = useState(false);
  return <Card style={cardWidth}><CardBody style={flow}>
    <div style={row}><Avatar name="Nora Chen" /><div><strong>Nora Chen</strong><div className="muted">Release operations</div></div></div>
    <span>Owns production rollout reviews and incident handoffs.</span>
    <div style={row}><Badge tone="ok">Available</Badge>
      <Button size="sm" variant="ghost" aria-pressed={following} onClick={() => setFollowing(!following)}>
        {following ? 'Following' : 'Follow updates'}
      </Button></div>
  </CardBody></Card>;
}

function SignalMonitor() {
  const [stream] = useState(() => {
    const source = createChartStream(8192);
    source.append(Array.from({ length: 1024 }, (_, time) => ({ time, value: 50 + 8 * Math.sin(time / 90) })));
    return source;
  });
  const clock = useRef(1024);
  const [running, setRunning] = useState(false);
  const [variant, setVariant] = useState<StreamChartVariant>('range');
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      stream.append(Array.from({ length: 32 }, () => {
        const time = clock.current++;
        return { time, value: 50 + 8 * Math.sin(time / 90) + 3 * Math.sin(time / 7) + (time % 499 === 0 ? 22 : 0) };
      }));
    }, 32);
    return () => window.clearInterval(timer);
  }, [running, stream]);
  return <Card><CardHeader style={row}><strong>Signal monitor</strong><Badge>Simulated feed</Badge></CardHeader>
    <CardBody style={flow}><StreamChart label="Gateway latency" unit="ms" variant={variant} stream={stream} paused={!running} />
      <div style={row}><Select aria-label="Chart view" value={variant} onChange={e => setVariant(e.target.value as StreamChartVariant)}>
        <option value="line">Closing values</option><option value="range">Peak envelope</option><option value="candlestick">Open / high / low / close</option>
      </Select><Button onClick={() => setRunning(!running)}>{running ? 'Pause feed' : 'Start feed'}</Button></div>
    </CardBody></Card>;
}

const deskModels = [
  { value: 'Relay', label: 'Relay', description: 'Echo a request for a handoff.' },
  { value: 'Analyst', label: 'Analyst', description: 'Count words and characters in a signal report.' },
  { value: 'Editor', label: 'Editor', description: 'Trim an update to its first twelve words.' },
];
const deskPrompts = [
  { model: 'Relay', label: 'Draft a handoff', prompt: 'Prepare a handoff for the team taking over the gateway incident.' },
  { model: 'Analyst', label: 'Inspect a signal', prompt: 'Gateway latency rose from 48 ms to 132 ms during the rollout.' },
  { model: 'Editor', label: 'Shorten an update', prompt: 'The team is working on restoring service and will post another customer update in fifteen minutes.' },
];
function ConversationDesk() {
  const [threads, setThreads] = useState([{ id: 1, title: 'New conversation', turns: [] as { prompt: string; answer: string; model: string; attachment: string; imageUrl: string }[] }]);
  const [active, setActive] = useState(1);
  const [model, setModel] = useState(deskModels[0].value);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState<File>();
  const picker = useRef<HTMLInputElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLElement>(null);
  const desk = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = desk.current;
    const viewport = window.visualViewport;
    if (!root || !viewport) return;
    const clearHeight = () => root.style.removeProperty('--desk-chat-visible-height');
    const fitComposer = () => {
      const input = composer.current;
      const form = input?.form;
      const keyboardOpen = input === document.activeElement && viewport.scale === 1 &&
        window.innerHeight - viewport.height > 120;
      if (!keyboardOpen || !form) {
        clearHeight();
        return;
      }
      root.style.setProperty('--desk-chat-visible-height', viewport.height + 'px');
      form.scrollIntoView({ block: 'nearest' });
    };
    viewport.addEventListener('resize', fitComposer);
    root.addEventListener('focusout', clearHeight);
    return () => {
      viewport.removeEventListener('resize', fitComposer);
      root.removeEventListener('focusout', clearHeight);
    };
  }, []);
  const images = useRef(new Set<string>());
  useEffect(() => {
    const urls = images.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);
  const thread = threads.find(item => item.id === active)!;
  useEffect(() => {
    const log = transcript.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [active, thread.turns.length]);
  function switchThread(id: number) {
    setActive(id);
    setDraft('');
    setFile(undefined);
    if (picker.current) picker.current.value = '';
  }
  function send() {
    const prompt = draft.trim();
    if (!prompt) return;
    const words = prompt.split(/\s+/);
    const answer = model === 'Analyst' ? 'Input summary: ' + words.length + ' words, ' + prompt.length + ' characters.'
      : model === 'Editor' ? 'Brief: ' + words.slice(0, 12).join(' ') + (words.length > 12 ? '?' : '')
      : 'Received your request: ?' + prompt + '?.';
    const attachment = file?.name ?? '';
    const imageUrl = file?.type.startsWith('image/') && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
    if (imageUrl) images.current.add(imageUrl);
    const turn = { prompt, model, attachment, imageUrl, answer: answer + (file ? ' Attachment: ' + file.type + ', ' + file.size + ' bytes.' : '') };
    setThreads(current => current.map(item => item.id === active ? { ...item, title: item.turns.length ? item.title : prompt.slice(0, 36), turns: [...item.turns, turn] } : item));
    switchThread(active);
  }
  function newChat() {
    const id = threads.length + 1;
    setThreads(current => [...current, { id, title: 'New conversation', turns: [] }]);
    switchThread(id);
    composer.current?.focus();
  }
  return <div ref={desk} className="desk-chat">
    <aside className="desk-chat-history" aria-label="Conversations">
      <div className="desk-chat-history-head"><strong>Conversations</strong>
        <Button variant="quiet" size="sm" iconLeft={<Icon name="plus" />} onClick={newChat}>New chat</Button></div>
      <div className="desk-chat-thread-list">{threads.map(item =>
        <Button key={item.id} size="sm" variant={item.id === active ? 'solid' : 'plain'} aria-current={item.id === active ? 'true' : undefined}
          iconLeft={<Icon name="chat" />} onClick={() => switchThread(item.id)}><span>{item.title}</span></Button>)}</div>
      <Select className="desk-chat-thread-select" aria-label="Conversation history" value={active} onChange={e => switchThread(Number(e.target.value))}>
        {threads.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </Select>
    </aside>
    <div className="desk-chat-workspace">
      <header className="desk-chat-header"><div><span className="label">Conversation desk</span><h3>{thread.title}</h3></div>
      </header>
      {/* A tab stop lets keyboard users scroll the transcript. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <section ref={transcript} className="desk-chat-log" role="log" aria-label="Conversation transcript" tabIndex={0}>
        {!thread.turns.length && <div className="desk-chat-empty"><Icon name="chat" size={30} />
          <h4>What are you working on?</h4><p>Start with a prompt or attach an image. Replies are generated locally.</p>
          <div className="desk-chat-prompts">{deskPrompts.map(item => <Button key={item.model} variant="outlined" size="sm" onClick={() => {
            setModel(item.model); setDraft(item.prompt); composer.current?.focus();
          }}>{item.label}</Button>)}</div></div>}
        {thread.turns.map((turn, i) => <article key={i} className="desk-chat-turn">
          <div className="desk-chat-message desk-chat-user"><strong>You</strong><p>{turn.prompt}</p>
            {turn.attachment && <small>{turn.attachment}</small>}
            {turn.imageUrl && <img src={turn.imageUrl} alt={turn.attachment} />}</div>
          <div className="desk-chat-message desk-chat-reply"><strong>{turn.model}</strong><p>{turn.answer}</p></div>
        </article>)}
      </section>
      <form className="desk-chat-composer" onSubmit={e => { e.preventDefault(); send(); composer.current?.focus(); }}>
        <textarea ref={composer} className="input" aria-label="Message" rows={3} value={draft} placeholder="Message the desk" onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
        {file && <div className="desk-chat-attachment"><span>{file.name}</span><Button size="sm" variant="plain" onClick={() => {
          setFile(undefined); if (picker.current) picker.current.value = '';
        }}>Remove attachment</Button></div>}
        <div className="desk-chat-actions">
          <SelectMenu className="desk-chat-model-picker" label="Reply model" value={model} options={deskModels} onValueChange={setModel} />
          <input ref={picker} hidden aria-label="Image file" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0])} />
          <Button className="desk-chat-attach" variant="outlined" size="sm" aria-label="Attach image" iconLeft={<Icon name="image" />}
            onClick={() => picker.current?.click()}><span>Attach image</span></Button>
          <Button className="desk-chat-send" size="sm" type="submit" disabled={!draft.trim()} iconRight={<Icon name="send" />}>Send</Button>
        </div>
      </form>
    </div>
  </div>;
}

export const workflowBlocks = {
  'signal-monitor': { name: 'Signal monitor', category: 'Application', description: 'Inspect a simulated latency stream as a line, peak envelope, or OHLC candles.',
    preview: SignalMonitor, jsx: '', html: '<figure><figcaption>Gateway latency snapshot</figcaption><meter min="0" max="100" value="50">50 ms</meter></figure>' },
  'conversation-desk': { name: 'Conversation desk', category: 'Application', description: 'Try local model selection, image attachment metadata and conversation history.',
    preview: ConversationDesk, jsx: '', html: '<section class="card card-body"><h2>Conversation desk</h2><label>Reply model <select><option>Relay</option><option>Analyst</option><option>Editor</option></select></label><label>Message <textarea></textarea></label></section>' },
  'incident-board': { name: 'Incident board', category: 'Application', description: 'Filter service incidents by severity and search by team or impact.',
    preview: IncidentBoard, jsx: '', html: '<section class="card"><div class="card-head">Incident board</div><div class="card-body"><table class="table"><thead><tr><th>Service</th><th>Severity</th></tr></thead><tbody><tr><td>API gateway</td><td>Critical</td></tr></tbody></table></div></section>' },
  'access-review': { name: 'Access review', category: 'Account', description: 'Select multiple access requests and mark them reviewed in one action.',
    preview: AccessReview, jsx: '', html: '<section class="card"><div class="card-head">Access review</div><div class="card-body"><label><input class="checkbox" type="checkbox"> Asha Rao · Production read access</label></div></section>' },
  'billing-register': { name: 'Billing register', category: 'Application', description: 'Scan invoices, totals, and payment status in a compact register.',
    preview: BillingRegister, jsx: '', html: '<section class="card"><div class="card-head">Billing register</div><div class="card-body"><table class="table"><thead><tr><th>Invoice</th><th>Total</th><th>Status</th></tr></thead><tbody><tr><td>INV-109</td><td class="num">$1,240.00</td><td>Due</td></tr></tbody></table></div></section>' },
  'release-notes': { name: 'Release notes', category: 'Marketing', description: 'Present current, previous, and upcoming product changes in tabs.',
    preview: ReleaseNotes, jsx: '', html: '<section class="card"><div class="card-head">Release notes</div><div class="card-body"><h2>Workspace visibility</h2><p>See ownership and rollout status in the same view.</p></div></section>' },
  'metric-card': { name: 'Metric card', category: 'Cards', description: 'Show a KPI with a time period switch, denominator, and change indicator.',
    preview: MetricCard, jsx: '', html: '<article class="card"><div class="card-body"><span class="label">Successful builds</span><h2>98.4%</h2><p>324 builds in the last week</p></div></article>' },
  'feature-card': { name: 'Feature card', category: 'Cards', description: 'Present a capability with a strong surface and expandable details.',
    preview: FeatureCard, jsx: '', html: '<article class="card pane"><div class="card-body"><span class="label">Governance</span><h2>Approval paths</h2><details><summary>See what is included</summary><p>Role-based ownership and decision history.</p></details></div></article>' },
  'story-card': { name: 'Customer story card', category: 'Cards', description: 'Pair an editorial quote with clear attribution and a scoped brand preset.',
    preview: StoryCard, jsx: '', html: '<article class="card" data-ut-preset="signal"><div class="card-body"><span class="label">Customer story · Sample</span><blockquote>When a release pauses, everyone can see who owns the next step.</blockquote><cite>Asha Rao, platform lead</cite></div></article>' },
  'team-card': { name: 'Team profile card', category: 'Cards', description: 'Present a teammate’s role, availability, and follow state.',
    preview: TeamCard, jsx: '', html: '<article class="card"><div class="card-body"><h2>Nora Chen</h2><p>Release operations</p><span class="badge badge-ok">Available</span></div></article>' },
} satisfies Record<string, Example & { category: string }>;
