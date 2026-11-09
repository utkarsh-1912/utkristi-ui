import { useState, type CSSProperties } from 'react';
import {
  Avatar, Badge, Button, Card, CardBody, CardHeader, Checkbox, DataTable, Icon,
  Select, Stat, Table, Tabs, type DataColumn,
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

export const workflowBlocks = {
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
